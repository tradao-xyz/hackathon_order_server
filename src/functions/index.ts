import { Bot } from "grammy";
import error from "./error";
import walletInfo from "./walletInfo";
import newOrder from "./newOrder";
import orderInfo from "./orderInfo";
import { session } from "./session";

const functions = async (bot: Bot) => {
  console.log(`ff 111`);
  bot.use(session);
  bot.use(walletInfo);
  bot.use(newOrder);
  bot.use(orderInfo);
  bot.use(error);
  console.log(`ff 222`);
};

export default functions;
