import { Composer, Context, InlineKeyboard, NextFunction } from "grammy";
import { selectUserInfo } from "../utils/user";

const sessionPublicKey =
  "0xc6973b771925cbad96047fc079c3cd83a3fac0890f7532fc81ccc587a2bc955d";

const composer = new Composer();

composer.on(
  "message",
  async (ctx: Context, next: NextFunction): Promise<void> => {
    console.log(`sssss`);
    if (ctx.message?.chat.type === "private") {
      const tgId = ctx.msg.chat.id;
      console.log(`session 111: ${tgId}`);
      const userInfo = await selectUserInfo(tgId);
      console.log(`session 222: ${userInfo}`);

      if (!userInfo || !userInfo.scw || !userInfo.sessionKey) {
        //1. generate verificationCode
        const u32a = new Uint32Array(1);
        const verificationCode = crypto.getRandomValues(u32a)[0];
        //2. lead to binding...
        const msg = `🤖 Hey ${ctx.msg.from.first_name}, click below to get your smart wallet! \n\n\n  [Get new Wallet](https://aa.tradao.xyz/build?tgId=123&publicKey=0x123&verificationCode=abc) `;
        const keyboard = new InlineKeyboard().url(
          "New wallet",
          `https://aa.tradao.xyz/build?tgId=${tgId}&sessionPublicKey=${sessionPublicKey}&verificationCode=${verificationCode}`
        );
        console.log(`session 333: ${msg}`);
        const r = await ctx.reply(msg, {
          parse_mode: "MarkdownV2",
          reply_markup: keyboard,
        });
        console.log(`session 444: ${r}`);
      } else {
        await next();
      }
    }
  }
);

export default composer;
