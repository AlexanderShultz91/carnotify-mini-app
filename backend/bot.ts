import { Bot, InlineKeyboard } from 'grammy';
import dotenv from 'dotenv';

dotenv.config();

const token = process.env.TELEGRAM_BOT_TOKEN;

if (!token) {
  console.warn('TELEGRAM_BOT_TOKEN is not set. Bot will be disabled.');
}

export const bot = token ? new Bot(token) : null;

if (bot) {
  bot.command('start', (ctx) => {
    const keyboard = new InlineKeyboard().url(
      'Открыть приложение',
      'https://t.me/parkathome_bot/app'
    );

    return ctx.reply(
      'Парковка у дома\nПерекрыли вас или вы кого-то - напишите владельцу напрямую\nСвязь с соседями без лишних слов',
      { reply_markup: keyboard }
    );
  });

  // Гасим все необработанные апдейты молча
  bot.catch((err) => {
    console.error('Bot error:', err.message);
  });
}
