import { Bot } from "grammy";
import dotenv from "dotenv";

dotenv.config();

const token = process.env.TELEGRAM_BOT_TOKEN;

if (!token) {
  console.warn("TELEGRAM_BOT_TOKEN is not set. Bot functionality will be disabled.");
}

export const bot = token ? new Bot(token) : null;
