import {IdBotMessage} from "./id-bot-message.js";
import {Cache} from "./cache.js";
import {IdBot} from "./id-bot.js";
import {Logger} from "./logger.js";
import {ImageIdStats} from "./image-id-stats.js";
import {Client} from "discord.js";
import {GatewayIntentBits} from "discord-api-types/v10";

import {DiscordInterface} from "./discord-interface.js";
import {Application} from "./application.js";

const CLIENT_OPTIONS = {
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
};

class Factory {

    static get CLIENT_OPTIONS() {
        return CLIENT_OPTIONS;
    }

    createApplication = clientId => new Application(process, this.createIdBot(clientId));

    createCache() {
        return new Cache(this.createLogger("MessageIdToReplyIdCache"));
    }

    /**
     * @param {string} clientId
     * @returns {DiscordInterface}
     */
    #createDiscordInterface = clientId =>
        new DiscordInterface(
            new Client(Factory.CLIENT_OPTIONS),
            this,
            this.createLogger(`DiscordInterface(clientId=${clientId})`),
            clientId
        );

    /**
     * @param {string} clientId
     * @returns {IdBot}
     */
    createIdBot = clientId =>
        new IdBot(
            this.createCache(),
            this.#createDiscordInterface(clientId),
            this.createLogger(`IdBot(${clientId})`)
        );

    createTimeStamp() {
        return new Date().getMilliseconds();
    }

    /**
     *
     * @param discordJsMessage
     * @returns {IdBotMessage}
     */
    createIdBotMessage = discordJsMessage => new IdBotMessage(this, discordJsMessage);

    /**
     * @param {string} [prefix]
     * @returns {Logger}
     */
    createLogger = prefix => new Logger(console, prefix);

    /**
     * @param {number} imageAttachmentCount
     * @param {number} emojiCount
     * @param {number} customEmojiCount
     * @param {number} imageIdentifierCount
     * @returns {ImageIdStats}
     */
    createImageIdStats = (imageAttachmentCount, emojiCount, customEmojiCount, imageIdentifierCount) =>
        new ImageIdStats(imageAttachmentCount, emojiCount, customEmojiCount, imageIdentifierCount);
}

export {Factory};
