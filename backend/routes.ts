import { Router } from 'express';
import db from './database.js';
import { bot } from './bot.js';

const router = Router();

// GET /api/user/:telegramId
router.get('/user/:telegramId', (req, res) => {
  const { telegramId } = req.params;
  const user = db.prepare('SELECT * FROM users WHERE telegram_id = ?').get(telegramId);
  
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  
  res.json(user);
});

// POST /api/register
router.post('/register', (req, res) => {
  const { telegram_id, first_name, last_name, car_number } = req.body;
  
  if (!telegram_id) {
    return res.status(400).json({ error: 'telegram_id is required' });
  }
  
  try {
    const transaction = db.transaction(() => {
      const stmtUser = db.prepare(`
        INSERT INTO users (telegram_id, first_name, last_name, car_number)
        VALUES (?, ?, ?, ?)
        ON CONFLICT(telegram_id) DO UPDATE SET
          first_name = COALESCE(excluded.first_name, users.first_name),
          last_name = COALESCE(excluded.last_name, users.last_name),
          car_number = COALESCE(excluded.car_number, users.car_number)
      `);
      
      stmtUser.run(telegram_id, first_name, last_name, car_number);

      if (car_number) {
        const stmtCar = db.prepare(`
          INSERT OR IGNORE INTO cars (telegram_id, car_number)
          VALUES (?, ?)
        `);
        stmtCar.run(telegram_id, car_number);
      }
    });

    transaction();
    
    const user = db.prepare('SELECT * FROM users WHERE telegram_id = ?').get(telegram_id);
    res.status(201).json(user);
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/notify
router.post('/notify', async (req, res) => {
  const { telegram_id, type, target_car_number, reason, description, photo } = req.body;

  if (!telegram_id) {
    return res.status(400).json({ error: 'telegram_id is required' });
  }

  try {
    // Search for owner in cars table
    const owner = target_car_number 
      ? db.prepare('SELECT telegram_id FROM cars WHERE car_number = ?').get(target_car_number) as { telegram_id: number } | undefined
      : undefined;

    const messageText = `${reason}. ${description || ''}`.trim();

    if (owner && bot) {
      // Owner found: Send notification via bot
      try {
        if (photo) {
          // If photo is a URL or base64, bot.api.sendPhoto can handle it if it's a string URL
          // If it's base64, it needs more handling, but let's assume URL for now or handle string
          await bot.api.sendPhoto(owner.telegram_id, photo, { caption: messageText });
        } else {
          await bot.api.sendMessage(owner.telegram_id, messageText);
        }
        
        // Save to notifications table for history
        db.prepare(`
          INSERT INTO notifications (sender_id, target_car_number, type, reason, description, photo_path)
          VALUES (?, ?, ?, ?, ?, ?)
        `).run(telegram_id, target_car_number, type, reason, description, photo);

        return res.json({ success: true, delivered: true });
      } catch (botError) {
        console.error('Bot notification error:', botError);
        // If bot fails (e.g. user blocked bot), fallback to saving in DB
      }
    }

    // Owner not found or bot failed: Save to notifications table
    db.prepare(`
      INSERT INTO notifications (sender_id, target_car_number, type, reason, description, photo_path)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(telegram_id, target_car_number, type, reason, description, photo);

    return res.json({ success: true, delivered: false });
  } catch (error) {
    console.error('Notify error:', error);
    res.status(200).json({ success: true, delivered: false, error: 'Internal error saved as notification' });
  }
});

export default router;
