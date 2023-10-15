export interface TelegramMessageParams {
  chat_id: number;
  text: string;
  parse_mode: string;
  disable_web_page_preview: boolean;
  message_thread_id?: number;
  reply_markup?: any;
}

export async function sendTelegramResponse(
  chatId: number,
  message: string,
  token: string,
  reply_markup?: any
): Promise<Response> {
  console.log(
    `msg--- ${message}  chatId--- ${chatId}   reply_markup--- ${JSON.stringify(
      reply_markup
    )}`
  );
  const apiUrl = `https://api.telegram.org/bot${token}/sendMessage`;
  let params: TelegramMessageParams = {
    chat_id: chatId,
    text: message,
    parse_mode: "Markdown",
    disable_web_page_preview: true,
  };

  if (reply_markup) {
    params.reply_markup = reply_markup;
  }

  try {
    // console.log(`telegram post params: ${JSON.stringify(params)}`)

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(params),
    });

    console.log(`telegram text: ${await response.text()}`);

    if (response.ok) {
      return new Response("Message sent successfully!", { status: 200 });
    } else {
      return new Response(`Failed to send message. ${await response.text()}`, {
        status: 500,
      });
    }
  } catch (error) {
    throw new Error(`Error occurred while sending the message.`, error);
  }
}
