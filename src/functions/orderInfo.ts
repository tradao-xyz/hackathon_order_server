import { Composer, Context } from "grammy";

const composer = new Composer();

composer.command("order_info", async (ctx: Context): Promise<void> => {
  const message =
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

  await ctx.reply(message, {
    parse_mode: "HTML",
    reply_to_message_id: ctx.msg.chat.id,
  });
});

export default composer;
