import dotenv from "dotenv";
import logging from "./logger.js";
import { fileURLToPath } from 'url';
import path from 'path';

dotenv.config();
logging.success("Configs loading successfully initiated");

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const config = {
    bot: {
        name: process.env.BOT_NAME || "𝓔𝓵𝓵𝓲𝓮 𝓿1",
        version: process.env.VERSION || "2.0.0",
        prefixes: process.env.PREFIXES ? process.env.PREFIXES.split(',') : ['.', '#', '*', '!'],
        defaultPrefix: process.env.DEFAULT_PREFIX || ".",
        allowNoPrefix: process.env.ALLOW_NO_PREFIX === "false" || true,
        welcomeImage: process.env.WELCOME_IMAGE || path.join(__dirname, 'assets', 'welcome.jpeg'),

        reactToChannels: process.env.REACT_TO_CHANNELS === "true" || true,
        channelReaction: process.env.CHANNEL_REACTION || "❤️",
        autoReadChannels: process.env.AUTO_READ_CHANNELS === "true" || true,
    },
    auth: {
        folder: process.env.CONFIG_FOLDER || "Elliev1",
        useCredsFile: process.env.USE_CREDS_FILE === "true",
        credsFilePath: process.env.CREDS_FILE_PATH || "./creds.json",
    },
    user: {
        name: process.env.USER_NAME || "Ernest",
        number: process.env.USER_NUMBER || "254103106336",
    },
    social: {
        telegram: process.env.TELEGRAM_GROUP || "https://t.me/Peaseernest",
        whatsappChannel: process.env.WHATSAPP_CHANNEL || "https://whatsapp.com/channel/0029VayK4ty7DAWr0jeCZx0i",
    },
    error: {
        message: "There has been an error executing the command",
        notadmin: "You are not an admin so you cant use this command",
        notingroups: "This command works only in groups",
    },
    creator: {
        number: "254793859108",
        name: "PeaseErnest",
        email: "peaseernest8@gmail.com"
    }
};

export default config;