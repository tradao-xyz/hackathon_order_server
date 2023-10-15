import { Bot } from "grammy";
import help from "./help";
import start from "./start";
import error from "./error";

const functions = async (bot: Bot) => {
  await bot.use(help);
  await bot.use(start);
  await bot.use(error);
};

export default functions;
