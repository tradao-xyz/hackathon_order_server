import { selectUserInfo } from "../../src/utils/user";
import { sendTelegramResponse } from "../../src/utils/botLib";
import { UserInfo } from "../../src/utils/dbHelper";
import { NextRequest, NextResponse } from "next/server";
import {
  approveERC20UO,
  approvePluginUO,
  createIncreasePositionUO,
  reconstructSessionKeyProvider,
  sendUO,
} from "../../src/utils/sessionkey";
import { Hex } from "viem";

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
  } else if (
    command.startsWith("/new_order") ||
    command.startsWith("/new_order@TradaoBot")
  ) {
    await newOrderCommand(username, chatId, userInfo, command);
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
      url: `https://aa.tradao.xyz/build/#/${tgId}/${sessionPublicKey}/${verificationCode}`,
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
  userInfo: UserInfo,
  command: string
) {
  const splitedCommands = command.split(" ");
  let msg: string;
  const helpMsg = `🤖 Hey ${username}, your input is: ${command}, Please place your order with the following format (Asset/Amount of Collateral/Side/Leverage/Price  Such as: ETH/Long/100/25/1567`;
  if (splitedCommands.length < 2) {
    msg = helpMsg;
  } else {
    const orderParams = splitedCommands[1].split("/");
    if (orderParams.length !== 5) {
      msg = helpMsg;
    } else {
      const symbolAddress = tokenAddresses[orderParams[0].toLowerCase()];
      const side = orderParams[1].toLowerCase() === "long";
      const collateral = Number(orderParams[2]);
      const leverage = Number(orderParams[3]);
      const price = Number(orderParams[4]);

      if (!symbolAddress) {
        msg = helpMsg;
      } else {
        const uos = [];
        uos.push(approvePluginUO());
        uos.push(approveERC20UO(10000000n));
        // uos.push(createIncreasePositionUO())

        const provider = await reconstructSessionKeyProvider(
          userInfo.sessionKey as Hex
        );
        const hash = await sendUO(provider, uos);
        msg = `order created, hash: ${hash}`;
      }
    }
  }

  await sendTelegramResponse(chatId, msg, process.env.TELEGRAM_BOT_TOKEN);
}

async function orderInfoCommand(
  username: string,
  chatId: number,
  userInfo: UserInfo
) {
  const msg = `check your orders: ${userInfo.scw}`;
  const keyboardButton1 = {
    text: "my trading details",
    url: `https://www.tradao.xyz/#/user/${userInfo.scw}/1`,
  };
  const inlineKeyboardMarkup = { inline_keyboard: [[keyboardButton1]] };
  await sendTelegramResponse(
    chatId,
    msg,
    process.env.TELEGRAM_BOT_TOKEN,
    inlineKeyboardMarkup
  );
}

const tokenAddresses = {
  btc: "0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f",
  eth: "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1",
};
