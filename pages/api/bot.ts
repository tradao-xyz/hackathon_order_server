import { NextApiRequest, NextApiResponse } from "next";
import { selectUserInfo } from "../../src/utils/user";
import { sendTelegramResponse } from "../../src/utils/botLib";
import { UserInfo } from "../../src/utils/dbHelper";
import { NextRequest, NextResponse } from "next/server";

export const config = {
  runtime: "edge",
};

export default async function handler(request: NextRequest, res: NextResponse) {
  const { method, headers } = request;

  if (method === "POST") {
    return handleRequest(request);
  }
  return new Response("NotFound", { status: 404 });
}

async function handleRequest(request: NextRequest) {
  const data = await request.json();

  console.log(`data--- ${JSON.stringify(data)}`);

  //@ts-ignore
  const { message, callback_query } = data;
  let command;
  let chatId;
  let username;

  try {
    if (callback_query && callback_query.data) {
      command = callback_query.data.trim();
      chatId = callback_query.from.id;
      username = callback_query.from.username;
      console.log(`callback command--- ${command}`);
      console.log(`callback chatId--- ${chatId}`);
    } else if (message && message.text) {
      command = message.text.trim();
      chatId = message.chat.id;
      username = message.chat.username;
      console.log(`message command--- ${command}`);
      console.log(`message chatId--- ${chatId}`);
    }
    await commandAction(command, username, chatId);
    return new Response("OK", { status: 200 });
  } catch (e) {
    console.error(`exception--- `, e);
  }

  return new Response("OK", { status: 200 });
}

async function commandAction(
  command: string,
  username: string,
  chatId: number
) {
  const userInfo = await session(chatId);
  if (!userInfo) {
    return;
  }

  if (
    command === "/start" ||
    command === "/start@TradaoBot" ||
    command === "/wallet_info" ||
    command === "/wallet_info@TradaoBot"
  ) {
    await startCommand(username, chatId, userInfo);
  } else if (command === "/new_order" || command === "/new_order@TradaoBot") {
    await newOrderCommand(username, chatId, userInfo);
  } else if (command === "/order_info" || command === "/order_info@TradaoBot") {
    await orderInfoCommand(username, chatId, userInfo);
  } else {
    console.warn(`invalid command: ${command}`);
  }
}

async function session(tgId: number) {
  const userInfo = await selectUserInfo(tgId);
  const sessionPublicKey =
    "0xc6973b771925cbad96047fc079c3cd83a3fac0890f7532fc81ccc587a2bc955d";

  if (!userInfo || !userInfo.scw || !userInfo.sessionKey) {
    //1. generate verificationCode
    const u32a = new Uint32Array(1);
    const verificationCode = crypto.getRandomValues(u32a)[0];
    //2. lead to binding...
    const msg = `🤖 Hello, click below to get your smart wallet!`;
    const keyboardButton1 = {
      text: "New wallet",
      url: `https://aa.tradao.xyz/build?tgId=${tgId}&sessionPublicKey=${sessionPublicKey}&verificationCode=${verificationCode}`,
    };
    const inlineKeyboardMarkup = { inline_keyboard: [[keyboardButton1]] };
    await sendTelegramResponse(
      tgId,
      msg,
      process.env.TELEGRAM_BOT_TOKEN,
      inlineKeyboardMarkup
    );
  } else {
    return userInfo;
  }
}

async function startCommand(
  username: string,
  chatId: number,
  userInfo: UserInfo
) {
  const msg = `🤖 Hey ${username}, your contract wallet address: ${userInfo.scw}`;
  await sendTelegramResponse(chatId, msg, process.env.TELEGRAM_BOT_TOKEN);
}

async function newOrderCommand(
  username: string,
  chatId: number,
  userInfo: UserInfo
) {
  const msg = `🤖 Hey ${username}, your contract wallet address: ${userInfo.scw}`;
  await sendTelegramResponse(chatId, msg, process.env.TELEGRAM_BOT_TOKEN);
}

async function orderInfoCommand(
  username: string,
  chatId: number,
  userInfo: UserInfo
) {
  const msg = `🤖 Hey ${username}, your contract wallet address: ${userInfo.scw}`;
  await sendTelegramResponse(chatId, msg, process.env.TELEGRAM_BOT_TOKEN);
}
