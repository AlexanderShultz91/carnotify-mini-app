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
    const keyboard = new InlineKeyboard()
      .text('Открыть приложение', 'open_app')
      .danger();

    return ctx.reply(
      'Привет, это Парковщик. Жми открыть приложение ниже',
      { reply_markup: keyboard }
    );
  });

  // Обработка «красной кнопки» (редирект в приложение)
  bot.callbackQuery('open_app', async (ctx) => {
    await ctx.answerCallbackQuery({
      url: 'https://t.me/parkathome_bot/app'
    });
  });

  // Гасим все необработанные апдейты молча
  bot.catch((err) => {
    console.error('Bot error:', err.message);
  });
}
