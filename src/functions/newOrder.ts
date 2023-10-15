import { Composer, Context } from "grammy";

const composer = new Composer();

composer.command("new_order", async (ctx: Context): Promise<void> => {
  const message = ``;
  await ctx.reply(message, {
    parse_mode: "HTML",
    reply_to_message_id: ctx.msg.chat.id,
  });
});

export default composer;
