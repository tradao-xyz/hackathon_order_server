import { Bot, webhookCallback } from "grammy";
import { NextApiRequest, NextApiResponse } from "next";
import functions from "../../src/functions";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Initialize a bot instance
  const bot = new Bot(process.env.TELEGRAM_BOT_TOKEN || "");
  console.log("Initialized instance successfully");

  // Append all middlewares to bot
  // await functions(bot);
  bot.on("message", (ctx) => {
    console.log(`111111111111`);
    ctx.reply("Got another message!");
  });
  console.log("Appended functions successfully");

  // Create a request handler
  const handle = webhookCallback(bot, "next-js");
  console.log("Created handler successfully");

  // Return the handler to Vercel api
  return await handle(req, res);
}
