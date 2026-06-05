import Database from 'better-sqlite3';
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';

const DB_PATH = process.env.DB_PATH || './data/jace.db';

mkdirSync(dirname(DB_PATH), { recursive: true });

export const db = new Database(DB_PATH);

db.pragma('journal_mode = WAL');

db.exec(`
CREATE TABLE IF NOT EXISTS deals (
id INTEGER PRIMARY KEY AUTOINCREMENT,
channel_id TEXT UNIQUE NOT NULL,
guild_id TEXT NOT NULL,
mode TEXT NOT NULL,
kind TEXT NOT NULL,
buyer_id TEXT NOT NULL,
seller_id TEXT NOT NULL,
amount TEXT,
currency TEXT,
item TEXT,
deposit_address TEXT,
deposit_txid TEXT,
deposit_confs INTEGER DEFAULT 0,
status TEXT NOT NULL DEFAULT 'open',
created_at INTEGER NOT NULL,
updated_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS confirmations (
deal_id INTEGER NOT NULL,
user_id TEXT NOT NULL,
kind TEXT NOT NULL,
PRIMARY KEY (deal_id,user_id,kind)
);
`);

export const insertDeal=db.prepare(`
INSERT INTO deals
(channel_id,guild_id,mode,kind,buyer_id,seller_id,amount,currency,item,deposit_address,created_at,updated_at)
VALUES
(@channel_id,@guild_id,@mode,@kind,@buyer_id,@seller_id,@amount,@currency,@item,@deposit_address,@now,@now)
`);

export const getDealByChannel=db.prepare(
`SELECT * FROM deals WHERE channel_id=?`
);

export const updateDealStatus=db.prepare(
`UPDATE deals SET status=?,updated_at=? WHERE id=?`
);

export const updateDeposit=db.prepare(
`UPDATE deals SET deposit_txid=?,deposit_confs=?,status=?,updated_at=? WHERE id=?`
);

export const listOpenCryptoDeals=db.prepare(
`SELECT * FROM deals WHERE kind='crypto' AND status IN ('open','funded')`
);

export const addConfirmation=db.prepare(
`INSERT OR IGNORE INTO confirmations (deal_id,user_id,kind) VALUES (?,?,?)`
);

export const countConfirmations=db.prepare(
`SELECT COUNT(*) AS n FROM confirmations WHERE deal_id=? AND kind=?`
);

export const clearConfirmations=db.prepare(
`DELETE FROM confirmations WHERE deal_id=?`
);
