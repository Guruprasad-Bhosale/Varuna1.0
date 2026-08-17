import logging
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime, timedelta
from typing import Dict, Any, Optional
import httpx

logger = logging.getLogger("VARUNA-ALERTS")

class AlertDispatcher:
    def __init__(self):
        # In-memory deduplication cache: {node_id: last_alert_timestamp}
        self._cooldown_cache: Dict[str, datetime] = {}
        self.cooldown_period = timedelta(minutes=30)

    def should_suppress_alert(self, node_id: str) -> bool:
        """Prevents notification spam by enforcing a 30-minute cooldown window per node."""
        now = datetime.utcnow()
        if node_id in self._cooldown_cache:
            if now - self._cooldown_cache[node_id] < self.cooldown_period:
                return True
        self._cooldown_cache[node_id] = now
        return False

    async def send_telegram_alert(self, bot_token: str, chat_id: str, record: Dict[str, Any]):
        """Dispatches rich Markdown alert to Telegram channels."""
        url = f"https://api.telegram.org/bot{bot_token}/sendMessage"
        text = (
            f"🚨 *VARUNA WATER SAFETY ALERT*\n\n"
            f"*Node:* `{record['node_id']}`\n"
            f"*Status:* `{record['predicted_safety_level'].upper()}`\n"
            f"*Safety Score:* `{record['safety_score']}/100`\n"
            f"*Confidence:* `{record['confidence_pct']}%`\n\n"
            f"📊 *Sensor Telemetry:*\n"
            f"• pH: `{record['ph']}`\n"
            f"• Turbidity: `{record['turbidity_ntu']} NTU`\n"
            f"• EC: `{record['ec_us_cm']} µS/cm`\n"
            f"• Temp: `{record['temperature_c']} °C`\n"
            f"• Particles: `{record['particle_count']}`\n\n"
            f"📍 *Coordinates:* `{record['latitude']}, {record['longitude']}`\n"
            f"⏰ *Timestamp:* `{record['timestamp']}`"
        )
        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                resp = await client.post(url, json={"chat_id": chat_id, "text": text, "parse_mode": "Markdown"})
                if resp.status_code == 200:
                    logger.info("Telegram alert successfully sent for node %s", record['node_id'])
                else:
                    logger.warning("Telegram API error: %s", resp.text)
        except Exception as e:
            logger.error("Failed to dispatch Telegram alert: %s", e)

    async def dispatch_critical_alerts(self, record: Dict[str, Any], settings: Any):
        """Master dispatcher invoked asynchronously upon detecting hazardous water states."""
        node_id = record["node_id"]
        safety_level = record.get("predicted_safety_level", "Safe")

        if safety_level not in ["Moderate", "Dangerous"]:
            return

        if self.should_suppress_alert(node_id):
            logger.info("Alert for node %s suppressed due to active cooldown.", node_id)
            return

        logger.warning("DISPATCHING ENVIRONMENTAL ALERT for Node: %s [Level: %s]", node_id, safety_level)

        # 1. Telegram Dispatch
        if getattr(settings, "TELEGRAM_BOT_TOKEN", None) and getattr(settings, "TELEGRAM_CHAT_ID", None):
            await self.send_telegram_alert(
                settings.TELEGRAM_BOT_TOKEN, 
                settings.TELEGRAM_CHAT_ID, 
                record
            )

        # 2. Generic Municipal Webhook Dispatch
        if getattr(settings, "MUNICIPAL_WEBHOOK_URL", None):
            try:
                async with httpx.AsyncClient(timeout=5.0) as client:
                    await client.post(settings.MUNICIPAL_WEBHOOK_URL, json=record)
            except Exception as err:
                logger.error("Municipal webhook dispatch failed: %s", err)

        # 3. WhatsApp Gateway Dispatch (Baileys)
        await self.send_baileys_whatsapp_alert(record, settings)

    def format_whatsapp_message(self, record: Dict[str, Any]) -> str:
        status_emoji = "🔴" if record.get("predicted_safety_level") == "Dangerous" else "🟠"
        return (
            f"{status_emoji} *PROJECT VARUNA — WATER SAFETY ALERT*\n\n"
            f"*Node:* {record.get('node_id')}\n"
            f"*Condition:* {record.get('predicted_safety_level', 'Unknown').upper()}\n"
            f"*Safety Score:* {record.get('safety_score')} / 100\n"
            f"*AI Confidence:* {record.get('confidence_pct')}%\n\n"
            f"📊 *Live Sensor Readings:*\n"
            f"• pH Level: {record.get('ph')}\n"
            f"• Turbidity: {record.get('turbidity_ntu')} NTU\n"
            f"• Conductivity: {record.get('ec_us_cm')} µS/cm\n"
            f"• Temperature: {record.get('temperature_c')} °C\n"
            f"• Particle Count: {record.get('particle_count')}\n\n"
            f"📍 *GPS Location:* {record.get('latitude')}, {record.get('longitude')}\n"
            f"⏰ *Timestamp:* {record.get('timestamp')}\n\n"
            f"⚠️ *Advisory:* Water safety thresholds breached. Automated alert for municipal inspection."
        )

    async def send_baileys_whatsapp_alert(self, record: Dict[str, Any], settings: Any):
        """Sends WhatsApp message via local self-hosted Baileys Gateway."""
        gateway_url = getattr(settings, "BAILEYS_GATEWAY_URL", "http://whatsapp_gateway:3001/api/v1/whatsapp/send-alert")
        recipient = getattr(settings, "WHATSAPP_ALERT_RECIPIENT", None)

        if not recipient:
            logger.info("WhatsApp recipient not configured. Skipping Baileys dispatch.")
            return

        payload = {
            "recipient": recipient,
            "message": self.format_whatsapp_message(record)
        }

        try:
            async with httpx.AsyncClient(timeout=8.0) as client:
                response = await client.post(gateway_url, json=payload)
                if response.status_code == 200:
                    logger.info("WhatsApp emergency alert dispatched successfully via Baileys.")
                else:
                    logger.warning("Baileys Gateway responded with status: %d - %s", response.status_code, response.text)
        except Exception as err:
            logger.error("Failed to connect to Baileys WhatsApp Gateway: %s", err)
