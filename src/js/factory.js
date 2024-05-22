import {IdBotMessage} from "./id-bot-message.js";
import {Cache} from "./cache.js";
import {IdBot} from "./id-bot.js";
import {Logger} from "./logger.js";
import {MessageImageInfo} from "./message-image-info.js";
import {Client} from "discord.js";
import {GatewayIntentBits} from "discord-api-types/v10";

import {DiscordInterface} from "./discord-interface.js";
import {Application} from "./application.js";

class Factory {

    createApplication = clientId => new Application(process, this.createIdBot(clientId));

    createIdBotMessage = (discordJsMessage) =>
        new IdBotMessage(this, discordJsMessage, this.createLogger("IdBotMessage"));

    createCache() {
        return new Cache(this.createLogger("MessageIdToReplyIdCache"));
    }

    createMessageImageInfo(numberOfImageAttachments, numberOfImageIds) {
        return new MessageImageInfo(numberOfImageAttachments, numberOfImageIds);
    }

    createClient() {
        return new Client({
            intents: [
                GatewayIntentBits.Guilds,
                GatewayIntentBits.GuildMessages,
                GatewayIntentBits.MessageContent
            ]
        });
    }

    /**
     * @param {string} clientId
     * @returns {IdBot}
     */
    createIdBot = clientId =>
        new IdBot(
            this.createCache(),
            this.#createDiscordInterface(clientId),
            this.createLogger("IdBot")
        );

    /**
     * @param {string} clientId
     * @returns {DiscordInterface}
     */
    #createDiscordInterface = clientId =>
        new DiscordInterface(
            this.createClient(),
            this,
            this.createLogger(`DiscordInterface for ${clientId}`),
            clientId
        );

    /**
     * @param {string} [name]
     * @returns {Logger}
     */
    createLogger = name => new Logger(console, name);
}

export {Factory};
