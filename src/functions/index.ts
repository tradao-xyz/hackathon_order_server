import { Bot } from "grammy";
import start from "./start";
import help from "./help";
import error from "./error";

const functions = async (bot: Bot) => {
  await bot.use(help);
  await bot.use(start);
  await bot.use(error);
};

export default functions;
