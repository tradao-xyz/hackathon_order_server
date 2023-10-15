import { Composer, Context, InlineKeyboard } from "grammy";

const composer = new Composer();

export const message =
  `<b>⚠️ Oh, I didn't get it...</b>` +
  `\n` +
  `Maybe you'll take a look at my available commands at /help?!`;

export const keyboard = new InlineKeyboard().text(
  "> Go to available commands! <",
  "help"
);

composer.on("message", async (ctx: Context): Promise<void> => {
  console.log(`eeeeeee 0000`);
  if (ctx.message?.chat.type === "private") {
    await ctx.reply(message, { parse_mode: "HTML", reply_markup: keyboard });
  }
});

export default composer;
