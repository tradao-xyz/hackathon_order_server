import { Composer, Context } from "grammy";
import * as start from "./start";

const composer = new Composer();

export const message =
  `<b>⚠️ Available commands:</b>` +
  `\n` +
  `\n` +
  `/help - <code>show this message</code>` +
  `\n` +
  `/blog - <code>listing blog posts</code>` +
  `\n` +
  `/playing - <code>music i'm listening</code>` +
  `\n` +
  `/playlist - <code>my collection of music</code>` +
  `\n`;

export const keyboard = start.keyboard;

composer.command("help", async (ctx: Context): Promise<void> => {
  await ctx.reply(message, {
    parse_mode: "HTML",
    reply_markup: keyboard,
  });
});

composer.callbackQuery("help", async (ctx: Context): Promise<void> => {
  await ctx.editMessageText(message, {
    parse_mode: "HTML",
    reply_markup: keyboard,
  });
});

export default composer;
