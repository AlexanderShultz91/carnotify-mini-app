import { Router, Request, Response } from 'express';
import { createHmac } from 'crypto';
import db from './database.js';
import { bot } from './bot.js';

const router = Router();

// ---------------------------------------------------------------------------
// УТИЛИТЫ
// ---------------------------------------------------------------------------

/**
 * Валидация Telegram initData по HMAC-SHA256.
 * Возвращает telegram_id отправителя или null если подпись невалидна.
 */
function validateInitData(initData: string | undefined, botToken: string): number | null {
  if (!initData) return null;
  try {
    const params = new URLSearchParams(initData);
    const hash = params.get('hash');
    if (!hash) return null;

    params.delete('hash');
    const dataCheckString = [...params.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}=${value}`)
      .join('\n');

    const secretKey = createHmac('sha256', 'WebAppData')
      .update(botToken)
      .digest();
    const calculatedHash = createHmac('sha256', secretKey)
      .update(dataCheckString)
      .digest('hex');

    if (calculatedHash !== hash) return null;

    const user = JSON.parse(params.get('user') || '{}');
    return user.id ? Number(user.id) : null;
  } catch {
    return null;
  }
}

/**
 * Простой in-memory rate limiter.
 * maxRequests запросов за windowMs миллисекунд.
 */
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(key: string, maxRequests = 5, windowMs = 5 * 60 * 1000): boolean {
  const now = Date.now();
  const entry = rateLimitStore.get(key);

  if (!entry || now > entry.resetAt) {
    rateLimitStore.set(key, { count: 1, resetAt: now + windowMs });
    return false; // не заблокирован
  }
  if (entry.count >= maxRequests) return true; // заблокирован
  entry.count++;
  return false; // не заблокирован
}

/**
 * Получить авторизованный telegram_id из запроса.
 * Приоритет: валидированный initData → body.telegram_id (только в dev).
 */
function getAuthorizedId(req: Request): number | null {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const initData = req.headers['x-telegram-init-data'] as string | undefined;

  // Продакшн: строгая валидация initData
  if (botToken && initData) {
    return validateInitData(initData, botToken);
  }

  // Dev без токена: доверяем body (только для локальной разработки)
  if (process.env.NODE_ENV !== 'production' && req.body?.telegram_id) {
    console.warn('[DEV] Using telegram_id from body — never in production!');
    return Number(req.body.telegram_id);
  }

  return null;
}

// ---------------------------------------------------------------------------
// ШАБЛОНЫ СООБЩЕНИЙ
// ---------------------------------------------------------------------------

function buildMessage(
  type: string,
  reason: string | null,
  description: string | null,
  senderCarNumber: string | null
): string {
  switch (type) {
    case 'cant_leave':
      return (
        '🚗 Парковочный ассистент\n\n' +
        'Ваш автомобиль мешает выезду соседу. Пожалуйста, подойдите к машине.'
      );

    case 'blocked':
      return (
        '🚗 Парковочный ассистент\n\n' +
        `Вашу машину перекрыл сосед (госномер: ${senderCarNumber || 'не указан'}).\n` +
        'Он уедет, как только вы с ним свяжетесь или подадите сигнал.'
      );

    case 'warn': {
      const parts = [reason, description].filter(Boolean).join('\n');
      return `⚠️ Сообщение о вашем автомобиле\n\n${parts || 'Сосед оставил вам сообщение.'}`;
    }

    default:
      return [reason, description].filter(Boolean).join('\n') || 'Уведомление от соседа.';
  }
}

// ---------------------------------------------------------------------------
// МАРШРУТЫ
// ---------------------------------------------------------------------------

/**
 * GET /api/user/:telegramId
 * Проверяет наличие пользователя, возвращает профиль + машину если есть.
 */
router.get('/user/:telegramId', (req: Request, res: Response) => {
  const telegramId = Number(req.params.telegramId);
  if (!telegramId) return res.status(400).json({ error: 'Invalid telegramId' });

  const user = db
    .prepare('SELECT * FROM users WHERE telegram_id = ?')
    .get(telegramId) as Record<string, unknown> | undefined;

  if (!user) return res.status(404).json({ error: 'User not found' });

  const car = db
    .prepare('SELECT car_number FROM cars WHERE owner_telegram_id = ?')
    .get(telegramId) as { car_number: string } | undefined;

  return res.json({ ...user, car_number: car?.car_number || null });
});

/**
 * POST /api/register
 * Создаёт или обновляет профиль пользователя.
 * Если передан car_number - привязывает к аккаунту (один пользователь = один номер).
 * Использует initData из заголовка для авторизации, если токен задан.
 */
router.post('/register', (req: Request, res: Response) => {
  const { first_name, last_name, car_number } = req.body;

  // Для регистрации принимаем telegram_id из body (еще нет initData при первом запуске)
  const telegram_id = req.body.telegram_id ? Number(req.body.telegram_id) : getAuthorizedId(req);

  if (!telegram_id) {
    return res.status(401).json({ error: 'Unauthorized: telegram_id missing' });
  }

  try {
    const txn = db.transaction(() => {
      // Upsert пользователя
      db.prepare(`
        INSERT INTO users (telegram_id, first_name, last_name)
        VALUES (?, ?, ?)
        ON CONFLICT(telegram_id) DO UPDATE SET
          first_name = COALESCE(excluded.first_name, users.first_name),
          last_name  = COALESCE(excluded.last_name,  users.last_name)
      `).run(telegram_id, first_name || null, last_name || null);

      if (car_number) {
        const normalized = String(car_number).toUpperCase().trim();

        // Снимаем старые машины этого пользователя (меняет номер)
        db.prepare('DELETE FROM cars WHERE owner_telegram_id = ?').run(telegram_id);

        // Регистрируем новый номер. Если кто-то другой уже зарегал этот номер —
        // переписываем на нового владельца (REPLACE).
        db.prepare(`
          INSERT OR REPLACE INTO cars (car_number, owner_telegram_id)
          VALUES (?, ?)
        `).run(normalized, telegram_id);
      }
    });

    txn();

    const user = db
      .prepare('SELECT * FROM users WHERE telegram_id = ?')
      .get(telegram_id) as Record<string, unknown>;
    const car = db
      .prepare('SELECT car_number FROM cars WHERE owner_telegram_id = ?')
      .get(telegram_id) as { car_number: string } | undefined;

    return res.status(201).json({ ...user, car_number: car?.car_number || null });
  } catch (error) {
    console.error('Register error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/notify
 * Центральный маршрут отправки уведомлений.
 *
 * Body: { type, target_car_number, reason?, description? }
 * Header: x-telegram-init-data (для авторизации отправителя)
 *
 * Типы:
 *   cant_leave  - не могу выехать, шаблонное сообщение, нужна своя машина
 *   blocked     - я перекрыл, шаблон с номером отправителя, нужна своя машина
 *   warn        - предупреждение, свободный текст (reason + description)
 *   report      - жалоба, бот НЕ вызывается, пишем только в reports
 */
router.post('/notify', async (req: Request, res: Response) => {
  console.log('notify called', req.body);
  const { type, target_car_number, reason, description } = req.body;

  // --- Авторизация ---
  const senderId = getAuthorizedId(req);
  if (!senderId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // --- Rate limiting по senderId ---
  if (isRateLimited(String(senderId))) {
    return res.status(429).json({ error: 'Too many requests. Try again in 5 minutes.' });
  }

  // --- Тип report: не дёргаем бота, просто пишем в reports ---
  if (type === 'report') {
    db.prepare(`
      INSERT INTO reports (sender_id, target_car_number, reason, description)
      VALUES (?, ?, ?, ?)
    `).run(senderId, target_car_number || null, reason || null, description || null);

    return res.json({ success: true, delivered: false, note: 'report saved' });
  }

  // --- Для cant_leave и blocked: проверяем что у отправителя есть машина ---
  let senderCarNumber: string | null = null;
  if (type === 'cant_leave' || type === 'blocked') {
    const senderCar = db
      .prepare('SELECT car_number FROM cars WHERE owner_telegram_id = ?')
      .get(senderId) as { car_number: string } | undefined;

    if (!senderCar) {
      return res.status(403).json({
        error: 'Forbidden: register your car number first to use this feature',
      });
    }
    senderCarNumber = senderCar.car_number;
  }

  // --- Ищем получателя по номеру машины ---
  const normalized = target_car_number
    ? String(target_car_number).toUpperCase().trim()
    : null;

  const ownerRow = normalized
    ? (db
        .prepare('SELECT owner_telegram_id FROM cars WHERE car_number = ?')
        .get(normalized) as { owner_telegram_id: number } | undefined)
    : undefined;

  // --- Формируем текст ---
  const messageText = buildMessage(type, reason || null, description || null, senderCarNumber);

  // --- Лог в notifications ---
  db.prepare(`
    INSERT INTO notifications (sender_id, target_car_number, type, reason, description, delivered)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(senderId, normalized || null, type, reason || null, description || null, 0);

  const notifId = (db.prepare('SELECT last_insert_rowid() as id').get() as { id: number }).id;

  // --- Отправка через бота ---
  if (ownerRow && bot) {
    try {
      await bot.api.sendMessage(ownerRow.owner_telegram_id, messageText);

      // Помечаем как доставленное
      db.prepare('UPDATE notifications SET delivered = 1 WHERE id = ?').run(notifId);

      return res.json({ success: true, delivered: true });
    } catch (botError: unknown) {
      // 403 = пользователь заблокировал бота - не роняем сервер
      const code = (botError as { error_code?: number })?.error_code;
      console.warn(`Bot send failed (code ${code}) for owner ${ownerRow.owner_telegram_id}`);
    }
  }

  // Получатель не найден или бот не смог — всё равно возвращаем успех фронту
  return res.json({ success: true, delivered: false });
});

/**
 * GET /api/admin/stats  (простая панель для дебага)
 * Возвращает общую статистику по БД.
 */
router.get('/admin/stats', (req: Request, res: Response) => {
  const users = (db.prepare('SELECT COUNT(*) as n FROM users').get() as { n: number }).n;
  const cars = (db.prepare('SELECT COUNT(*) as n FROM cars').get() as { n: number }).n;
  const notifications = (db.prepare('SELECT COUNT(*) as n FROM notifications').get() as { n: number }).n;
  const reports = (db.prepare('SELECT COUNT(*) as n FROM reports').get() as { n: number }).n;

  const recent = db
    .prepare(`
      SELECT n.id, n.type, n.target_car_number, n.delivered, n.created_at,
             u.first_name, c_sender.car_number as sender_car
      FROM notifications n
      LEFT JOIN users u ON u.telegram_id = n.sender_id
      LEFT JOIN cars c_sender ON c_sender.owner_telegram_id = n.sender_id
      ORDER BY n.created_at DESC
      LIMIT 20
    `)
    .all();

  return res.json({ users, cars, notifications, reports, recent });
});

export default router;
