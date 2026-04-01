import { Bot, InlineKeyboard } from "grammy";
import dotenv from "dotenv";

dotenv.config();

const token = process.env.TELEGRAM_BOT_TOKEN;

if (!token) {
  console.warn("TELEGRAM_BOT_TOKEN is not set. Bot functionality will be disabled.");
}

export const bot = token ? new Bot(token) : null;

if (bot) {
  bot.command("start", (ctx) => {
    const keyboard = new InlineKeyboard().webApp(
      "Открыть приложение",
      process.env.MINI_APP_URL || "https://parking-v4-final.vercel.app"
    );

    return ctx.reply(
      "Парковка у дома\n\nПерекрыли вас или вы кого-то — напишите владельцу напрямую\nУкажите, когда планируете уехать, чтобы сосед не ждал\n\nСвязь с соседями без лишних слов",
      { reply_markup: keyboard }
    );
  });
}
