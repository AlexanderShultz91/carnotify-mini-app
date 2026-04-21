import { createClient } from '@libsql/client';
import path from 'path';

const dbPath = path.join(process.cwd(), 'database.sqlite');

const client = createClient({ url: `file:${dbPath}` });

export async function initDb() {
  await client.execute('PRAGMA journal_mode = WAL');
  await client.execute('PRAGMA foreign_keys = ON');

  await client.executeMultiple(`
    -- Основная таблица пользователей (без car_number - он в таблице cars)
    CREATE TABLE IF NOT EXISTS users (
      telegram_id INTEGER PRIMARY KEY,
      first_name  TEXT,
      last_name   TEXT,
      created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Реестр автомобилей: один номер = один владелец
    -- Если пользователь меняет номер - старый удаляется через upsert в routes
    CREATE TABLE IF NOT EXISTS cars (
      car_number         TEXT PRIMARY KEY,
      owner_telegram_id  INTEGER NOT NULL,
      created_at         DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (owner_telegram_id) REFERENCES users(telegram_id)
    );

    -- Лог всех уведомлений (cant_leave, blocked, warn)
    CREATE TABLE IF NOT EXISTS notifications (
      id               INTEGER PRIMARY KEY AUTOINCREMENT,
      sender_id        INTEGER,
      target_car_number TEXT,
      type             TEXT,
      reason           TEXT,
      description      TEXT,
      delivered        INTEGER DEFAULT 0,
      created_at       DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (sender_id) REFERENCES users(telegram_id)
    );

    -- Лог жалоб (type = report): бот не дёргается, просто аналитика
    CREATE TABLE IF NOT EXISTS reports (
      id               INTEGER PRIMARY KEY AUTOINCREMENT,
      sender_id        INTEGER,
      target_car_number TEXT,
      reason           TEXT,
      description      TEXT,
      created_at       DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (sender_id) REFERENCES users(telegram_id)
    );
  `);
}

export default client;
