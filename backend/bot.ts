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
    const keyboard = new InlineKeyboard().add({
      text: "Открыть приложение",
      web_app: { url: "https://parking-v4-final.vercel.app" },
      style: "destructive"
    });

    return ctx.reply(
      "Привет, это Парковщик.\nСвязь с соседями без лишних слов",
      { reply_markup: keyboard }
    );
  });
}
