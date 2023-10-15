import { Bot } from "grammy";
import error from "./error";
import { session } from "./session";
import walletInfo from "./walletInfo";
import newOrder from "./newOrder";
import orderInfo from "./orderInfo";

const functions = async (bot: Bot) => {
  await bot.use(session);
  await bot.use(walletInfo);
  await bot.use(newOrder);
  await bot.use(orderInfo);
  await bot.use(error);
};

export default functions;
