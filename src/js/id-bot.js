import {MESSAGE_HAS_MORE_IDS_THAN_IMAGES, MESSAGE_HAS_MORE_IMAGES_THAN_IDS} from "./reminder-messages.js";

/**
 * @typedef {typeof import('./id-bot-message.js')['IdBotMessage']} IdBotMessage
 * @typedef {typeof import('discord.js')['Channel']} Channel
 * @typedef {typeof import('discord.js').Events} Events
 * @typedef {typeof import('../cache.js').Cache} Cache
 */
class IdBot {

    /**
     * @type {DiscordInterface}
     */
    #discordInterface;

    /**
     * @type {Cache}
     */
    #cache;

    /**
     * @type {Logger}
     */
    #logger;

    /**
     * @param {MessageImageInfo} messageImageInfo
     * @returns {string}
     */
    #reminderMessage(messageImageInfo) {
        return messageImageInfo.idUnderIdentified ? MESSAGE_HAS_MORE_IMAGES_THAN_IDS : MESSAGE_HAS_MORE_IDS_THAN_IMAGES;
    }

    /**
     * @param {Channel} channel
     * @param messageId
     */
    #deleteChannelMessage(channel, messageId) {
        this.#logger.debug(`attempting to delete replies to message with id=${messageId}`);
        this.#discordInterface.deleteMessage(channel, messageId);
    }

    /**
     * @param {IdBotMessage} message
     */
    #deleteRepliesTo(message) {
        const messageId = message.id;
        this.#logger.debug(`deleting our reply to messageId=${messageId}`);
        const replyId = this.#cache.getValue(messageId);
        if (replyId) {
            this.#deleteChannelMessage(message.channel, replyId);
            this.#cache.delete(messageId);
        } else {
            this.#logger.warn(`no known reply, nothing to delete`);
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
        this.#logger.debug(`message created with id=${message.id}, content="${message.content}"`);

        if (message.isAuthorHuman) {
            this.#logger.debug(`message authored by a human`);

            const imageInfo = message.imageInfo;
            this.#logger.debug(imageInfo.toString());
            if (!imageInfo.isCorrectlyIdentified) {
                this.#logger.debug(`message is not correctly identified, adding reminder reply.`);
                this.#discordInterface.replyTo(message, this.#reminderMessage(imageInfo));
            }
        } else {
            this.#logger.debug(`onMessageCreate: message author is a bot`);

            if (this.#discordInterface.isSelfAuthored(message)) {
                this.#logger.debug(`we authored this message`);
                const referencedMessageId = message.referencedMessageId;
                this.#discordInterface.fetchMessage(
                    message.channel,
                    referencedMessageId,
                    referencedMessage => {
                        const imageInfo = referencedMessage.imageInfo;
                        if (!imageInfo.isCorrectlyIdentified) {
                            this.#cache.add(referencedMessageId, message.id);
                        }
                    });
            }
        }
    };

    /**
     * @param _
     * @param {IdBotMessage} updatedMessage
     * @returns {Promise<void>}
     */
    #onMessageUpdate = async (_, updatedMessage) => {
        this.#logger.debug(`message updated id=${updatedMessage.id}, msg="${updatedMessage.content}"`);

        if (updatedMessage.isAuthorHuman) {
            this.#logger.debug(`message updated by a human`);

            const imageInfo = updatedMessage.imageInfo;
            this.#deleteRepliesTo(updatedMessage);
            if (!imageInfo.isCorrectlyIdentified) {
                this.#logger.debug(`message updated but not currently identified, adding reminder`);
                this.#discordInterface.replyTo(updatedMessage, this.#reminderMessage(imageInfo));
            }
        }
    };

    /**
     * @param {IdBotMessage} message
     * @returns {Promise<void>}
     */
    #onMessageDelete = async message => {
        this.#logger.debug(`onMessageDelete: id=${message.id}`);
        if (message.isAuthorHuman) {
            this.#logger.debug(`onMessageDelete: message author is human`);
            this.#deleteRepliesTo(message);
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
