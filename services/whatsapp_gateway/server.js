import express from 'express';
import cors from 'cors';
import pino from 'pino';
import { 
    makeWASocket, 
    useMultiFileAuthState, 
    DisconnectReason, 
    Browsers 
} from '@whiskeysockets/baileys';
import qrcodeTerminal from 'qrcode-terminal';
import QRCode from 'qrcode';

const app = express();
app.use(express.json());
app.use(cors());

const PORT = process.env.PORT || 3001;
const logger = pino({ level: 'info' });

let sock = null;
let connectionState = 'DISCONNECTED';
let latestQR = null;

// Message outbound queue to prevent spam flags
const messageQueue = [];
let isProcessingQueue = false;

async function processQueue() {
    if (isProcessingQueue || messageQueue.length === 0) return;
    isProcessingQueue = true;

    while (messageQueue.length > 0) {
        const { jid, message, resolve, reject } = messageQueue.shift();
        try {
            if (connectionState !== 'CONNECTED' || !sock) {
                throw new Error('WhatsApp Gateway is not connected.');
            }
            const result = await sock.sendMessage(jid, { text: message });
            logger.info({ jid }, 'WhatsApp Alert dispatched successfully.');
            resolve(result);
        } catch (err) {
            logger.error({ err, jid }, 'Failed to dispatch WhatsApp message.');
            reject(err);
        }
        // Enforce 2.5-second pacing between alerts
        await new Promise(r => setTimeout(r, 2500));
    }
    isProcessingQueue = false;
}

async function connectToWhatsApp() {
    const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys');

    sock = makeWASocket({
        auth: state,
        logger: pino({ level: 'silent' }),
        browser: Browsers.ubuntu('Chrome'),
        printQRInTerminal: false,
        syncFullHistory: false // Memory optimization as requested
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect, qr } = update;

        if (qr) {
            latestQR = qr;
            connectionState = 'QR_READY';
            console.log('\n==================================================');
            console.log('⚡ SCAN THIS QR CODE WITH WHATSAPP LINKED DEVICES:');
            console.log('==================================================\n');
            qrcodeTerminal.generate(qr, { small: true });
        }

        if (connection === 'close') {
            const statusCode = lastDisconnect?.error?.output?.statusCode;
            const shouldReconnect = statusCode !== DisconnectReason.loggedOut;
            connectionState = 'DISCONNECTED';
            logger.warn(`WhatsApp connection closed (Status: ${statusCode}). Reconnecting: ${shouldReconnect}`);
            if (shouldReconnect) {
                setTimeout(connectToWhatsApp, 3000);
            }
        } else if (connection === 'open') {
            connectionState = 'CONNECTED';
            latestQR = null;
            logger.info('✅ WhatsApp Gateway successfully connected and authenticated!');
        }
    });
}

function formatJID(recipient) {
    if (recipient.endsWith('@g.us') || recipient.endsWith('@s.whatsapp.net')) {
        return recipient;
    }
    const cleanNumber = recipient.replace(/\D/g, '');
    // Assume Indian number by default if 10 digits
    const standardNumber = cleanNumber.length === 10 ? `91${cleanNumber}` : cleanNumber;
    return `${standardNumber}@s.whatsapp.net`;
}

// REST Endpoints
app.get('/api/v1/whatsapp/status', (req, res) => {
    res.json({ status: connectionState, qr_available: !!latestQR });
});

app.get('/api/v1/whatsapp/qr', async (req, res) => {
    if (!latestQR) {
        return res.status(404).json({ message: 'No QR code active. Gateway might already be connected.' });
    }
    try {
        const qrDataUrl = await QRCode.toDataURL(latestQR);
        res.json({ qr: latestQR, qr_image: qrDataUrl });
    } catch (err) {
        res.status(500).json({ error: 'Failed to generate QR image' });
    }
});

app.post('/api/v1/whatsapp/send-alert', (req, res) => {
    const { recipient, message } = req.body;
    if (!recipient || !message) {
        return res.status(400).json({ error: 'Fields "recipient" and "message" are required.' });
    }

    const jid = formatJID(recipient);

    new Promise((resolve, reject) => {
        messageQueue.push({ jid, message, resolve, reject });
        processQueue();
    })
    .then(result => res.json({ success: true, messageId: result?.key?.id }))
    .catch(err => res.status(500).json({ success: false, error: err.message }));
});

app.listen(PORT, () => {
    logger.info(`VARUNA WhatsApp Baileys Gateway running on port ${PORT}`);
    connectToWhatsApp();
});
