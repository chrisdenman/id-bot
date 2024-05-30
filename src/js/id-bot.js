import {MESSAGE_HAS_MORE_IDS_THAN_IMAGES, MESSAGE_HAS_MORE_IMAGES_THAN_IDS} from "./reminder-messages.js";

/**
 * @typedef {typeof import('./id-bot-message.js')['IdBotMessage']} IdBotMessage
 * @typedef {typeof import('discord.js')['Channel']} Channel
 * @typedef {typeof import('discord.js').Events} Events
 * @typedef {typeof import('../cache.js').Cache} Cache
 */
class IdBot {

    /**
     * @type DiscordInterface
     */
    #discordInterface;

    /**
     * @type Cache
     */
    #cache;

    /**
     * @type Logger
     */
    #logger;

    /**
     * @param {ImageIdStats} imageIdStats
     * @returns {string}
     */
    #reminderMessage(imageIdStats) {
        return imageIdStats.isUnderIdentified ? MESSAGE_HAS_MORE_IMAGES_THAN_IDS : MESSAGE_HAS_MORE_IDS_THAN_IMAGES;
    }

    /**
     * @param {Channel} channel
     * @param messageId
     */
    #deleteChannelMessage(channel, messageId) {
        this.#logger.debug(`deleting channel message with id=${messageId}`);
        this.#discordInterface.deleteMessage(channel, messageId);
    }

    /**
     * @param {IdBotMessage} message
     */
    #deleteOurReplyTo(message) {
        const messageId = message.id;
        this.#logger.info(`deleting our reply to ${message.toIdString()}`);
        const replyId = this.#cache.get(messageId);
        if (replyId) {
            this.#deleteChannelMessage(message.channel, replyId);
            this.#cache.remove(messageId);
        } else {
            this.#logger.warn(`${message.toIdString()} has no known replies`);
        }
    }

    #onClientReady() {
        this.#logger.info(`Ready`);
    }

    /**
     * @param {IdBotMessage} message
     * @returns {Promise<void>}
     */
    #onMessageCreate = async message => {
        this.#logger.debug(`new ${message}`);

        if (message.isAuthorHuman) {
            const imageIdStats = message.imageIdStats;
            if (!imageIdStats.isCorrectlyIdentified) {
                const reminderMessage = this.#reminderMessage(imageIdStats);
                this.#logger.debug(
                    `${message.toIdString()} is not correctly identified, replying with "${reminderMessage}".`
                );
                this.#discordInterface.replyTo(message, reminderMessage);
            }
        } else {
            if (this.#discordInterface.isSelfAuthored(message)) {
                const referencedMessageId = message.referencedMessageId;
                this.#logger.debug(`${message.toIdString()} is our new reminder reply to ${referencedMessageId}."`);

                this.#cache.set(referencedMessageId, message.id);
            }
        }
    };

    /**
     * @param {IdBotMessage} originalMessage
     * @param {IdBotMessage} updatedMessage
     * @returns {Promise<void>}
     */
    #onMessageUpdate = async (originalMessage, updatedMessage) => {
        this.#logger.debug(`updated ${updatedMessage}`);

        if (updatedMessage.isAuthorHuman) {
            this.#logger.debug(`${updatedMessage.toIdString()} author is human`);
            const imageIdStats = updatedMessage.imageIdStats;

            if (!imageIdStats.isCorrectlyIdentified) {
                this.#deleteOurReplyTo(updatedMessage);
                const replyMessageContent = this.#reminderMessage(imageIdStats);
                this.#logger.debug(`${updatedMessage.toIdString()} not correctly identified, replying with "${replyMessageContent}"`);
                this.#discordInterface.replyTo(updatedMessage, replyMessageContent);
            } else {
                this.#deleteOurReplyTo(updatedMessage);
            }
        }
    };

    /**
     * @param {IdBotMessage} message
     * @returns {Promise<void>}
     */
    #onMessageDelete = async message => {
        this.#logger.debug(`deleted id=${message.toIdString()}`);
        if (message.isAuthorHuman) {
            this.#logger.debug(`onMessageDelete: message author is human`);
            this.#deleteOurReplyTo(message);
        }
    };

    /**
     * @param {Cache} cache
     * @param {DiscordInterface} discordInterface
     * @param {Logger} logger
     */
    constructor(cache, discordInterface, logger) {
        this.#cache = cache;
        this.#discordInterface = discordInterface;
        this.#logger = logger;

        this.#discordInterface
            .setClientReadyHandler(this.#onClientReady.bind(this))
            .setMessageCreateHandler(this.#onMessageCreate.bind(this))
            .setMessageUpdateHandler(this.#onMessageUpdate.bind(this))
            .setMessageDeleteHandler(this.#onMessageDelete.bind(this));
    }

    /**
     * @param {string} token
     */
    login(token) {
        this.#discordInterface.login(token);
    }

    close() {
        this.#discordInterface.close();
    }
}

export {IdBot};
