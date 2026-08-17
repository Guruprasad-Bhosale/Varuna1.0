import sqlite3
import json
import logging
from pathlib import Path
from typing import List, Dict, Any

logger = logging.getLogger("VARUNA-LOCALDB")

class LocalBufferDB:
    def __init__(self, db_path: str = None):
        if db_path is None:
            self.db_path = Path(__file__).resolve().parent / "data" / "edge_buffer.db"
        else:
            self.db_path = Path(db_path)
            
        self.db_path.parent.mkdir(parents=True, exist_ok=True)
        self._init_db()
        
    def _init_db(self):
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS telemetry_queue (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    payload TEXT NOT NULL,
                    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            ''')
            conn.commit()
            
    def enqueue(self, payload: Dict[str, Any]):
        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                cursor.execute(
                    'INSERT INTO telemetry_queue (payload) VALUES (?)',
                    (json.dumps(payload),)
                )
                conn.commit()
                logger.info(f"Enqueued 1 record to local buffer. Queue size: {self.get_queue_size()}")
        except Exception as e:
            logger.error(f"Failed to enqueue record: {e}")
            
    def get_queue_size(self) -> int:
        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                cursor.execute('SELECT COUNT(*) FROM telemetry_queue')
                return cursor.fetchone()[0]
        except Exception:
            return 0
            
    def pop_batch(self, batch_size: int = 50) -> List[tuple]:
        """Returns list of (id, payload_dict)"""
        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                cursor.execute(
                    'SELECT id, payload FROM telemetry_queue ORDER BY id ASC LIMIT ?',
                    (batch_size,)
                )
                rows = cursor.fetchall()
                
                results = []
                for row_id, payload_str in rows:
                    results.append((row_id, json.loads(payload_str)))
                return results
        except Exception as e:
            logger.error(f"Failed to pop batch: {e}")
            return []
            
    def remove_records(self, record_ids: List[int]):
        if not record_ids:
            return
        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                placeholders = ','.join('?' for _ in record_ids)
                cursor.execute(
                    f'DELETE FROM telemetry_queue WHERE id IN ({placeholders})',
                    record_ids
                )
                conn.commit()
        except Exception as e:
            logger.error(f"Failed to remove synced records: {e}")
