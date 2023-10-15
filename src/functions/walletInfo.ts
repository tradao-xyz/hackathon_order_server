import { Composer, Context } from "grammy";
import { selectUserInfo } from "../utils/user";

const composer = new Composer();

composer.command("wallet_info", async (ctx: Context): Promise<void> => {
  const tgId = ctx.msg.chat.id;
  const userInfo = await selectUserInfo(tgId);
  const message = `🤖 Hey ${ctx.msg.from.first_name}, your contract wallet address: ${userInfo.scw}`;

  await ctx.reply(message, {
    parse_mode: "MarkdownV2",
    reply_to_message_id: ctx.msg.chat.id,
  });
});

export default composer;
