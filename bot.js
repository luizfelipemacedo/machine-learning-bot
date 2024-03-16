import { server } from "./server.js";
import TelegramBot from "node-telegram-bot-api";
import SashiDoTeachableMachine from "@sashido/teachablemachine-node";

const botToken = process.env.BOT_TOKEN;
const bot = new TelegramBot(botToken, { polling: true });

const modelUrl = "https://teachablemachine.withgoogle.com/models/AX2LlLix3/";
const model = new SashiDoTeachableMachine({
  modelUrl,
});

console.info("Bot is running...");

server.init();

const botCommands = [
  {
    command: "/classificar",
    description: "Classifica uma imagem",
  },
];

bot.setMyCommands(botCommands);

bot.onText(/\/classificar/, (message) => {
  const chatId = message.chat.id;
  bot.sendMessage(chatId, "Envie uma imagem para que eu possa classificá-la");

  bot.on("photo", (photoMessage) => handlePhoto(photoMessage));
});

async function handlePhoto(message) {
  const chatId = message.chat.id;
  const photoId = message.photo[message.photo.length - 1].file_id;

  const imagePath = await bot.downloadFile(photoId, "./image");

  try {
    const fileName = imagePath.split("/").pop();
    const serverAddress = server.getAddress();

    const imageUrl = `${serverAddress}/image/${fileName}`;

    bot.sendMessage(chatId, "Classificando imagem...");

    const predictionResult = await classifyImage(imageUrl);

    server.removeFile(fileName);

    return bot.sendMessage(
      chatId,
      `Na imagem contém um ${predictionResult.class}`
    );
  } catch (error) {
    console.log("error", error);
    return bot.sendMessage(chatId, `Erro ao classificar a imagem`);
  }
}

/**
 *
 * @param { string } imageUrl
 * @returns { Promise<{ class: string, score: number }> }
 */
async function classifyImage(imageUrl) {
  const predictions = await model.classify({ imageUrl });
  return predictions.find((prediction) => prediction.score > 0.5);
}
