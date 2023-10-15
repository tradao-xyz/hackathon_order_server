import { Bot, webhookCallback } from "grammy";
import { NextApiRequest, NextApiResponse } from "next";
import functions from "../functions";

// ------------------
// Using Crypto with Edge Middleware and Edge Functions
// ------------------

export const config = {
  runtime: "edge",
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Initialize a bot instance
  const bot = new Bot(process.env.TELEGRAM_BOT_TOKEN || "");
  console.log("Initialized instance successfully");

  // Append all middlewares to bot
  await functions(bot);
  console.log("Appended functions successfully");

  // Create a request handler
  const handle = webhookCallback(bot, "next-js");
  console.log("Created handler successfully");

  // Return the handler to Vercel api
  return await handle(req, res);
}
