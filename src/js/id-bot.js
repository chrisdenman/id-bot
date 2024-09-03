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
     * A cache that maps: the original message id to reminder message id.
     *
     * @type Cache
     */
    #cache;

    /**
     * @type CacheMaxStaleManager
     */
    #cacheMaxStaleManager;

    /**
     * @type Logger
     */
    #logger;

    /**
     * @param {ImageIdStats} imageIdStats
     * @returns {string}
     */
    #reminderMessage = imageIdStats => imageIdStats.isUnderIdentified ?
        MESSAGE_HAS_MORE_IMAGES_THAN_IDS :
        MESSAGE_HAS_MORE_IDS_THAN_IMAGES;

    /**
     * @param {Channel} channel
     * @param messageId
     */
    async #deleteChannelMessage(channel, messageId) {
        this.#logger.debug(`deleting channel message with id=${messageId}`);
        this.#discordInterface.deleteMessage(channel, messageId);
    };

    /**
     * @param {IdBotMessage} message
     */
    #deleteOurReplyTo(message) {
        const messageId = message.id;
        this.#logger.info(`deleting our reply to ${message.toIdString()}`);

        const replyId = this.#cache.get(messageId);
        if (replyId) {
            this
                .#deleteChannelMessage(message.channel, replyId)
                .then(() => {
                    this.#cache.remove(messageId);
                    this.#logger.debug(this.#cache);
                });
        } else {
            this.#logger.warn(`${message.toIdString()} has no known replies`);
        }
    };

    #onClientReady() {
        this.#logger.info(`Ready`);
        this.#cacheMaxStaleManager.start();
    };

    /**
     * For every created event for message 'm':
     *
     *  1. if it is human authored and incorrectly identified, we post a reminder reply message
     *  2. else, if it's a self-authored reply, we cache: m.referencedMessageId -> m.id
     *
     * @param {IdBotMessage} message
     *
     * @returns {Promise<undefined>}
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
            if (this.#discordInterface.isOurReply(message)) {
                const referencedMessageId = message.referencedMessageId;
                this.#logger.debug(`${message.toIdString()} is our new reminder reply to ${referencedMessageId}."`);

                this.#cache.set(referencedMessageId, message.id);
                this.#logger.debug(this.#cache);
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
            this.#logger.debug(`deleted message's author is human`);
            this.#deleteOurReplyTo(message);
        }
    };

    /**
     * @param {Cache} cache
     * @param {CacheMaxStaleManager} cacheMaxStaleManager
     * @param {DiscordInterface} discordInterface
     * @param {Logger} logger
     */
    constructor(
        cache,
        cacheMaxStaleManager,
        discordInterface,
        logger
    ) {
        this.#cache = cache;
        this.#cacheMaxStaleManager = cacheMaxStaleManager;
        this.#discordInterface = discordInterface
            .setClientReadyHandler(this.#onClientReady.bind(this))
            .setMessageCreateHandler(this.#onMessageCreate.bind(this))
            .setMessageUpdateHandler(this.#onMessageUpdate.bind(this))
            .setMessageDeleteHandler(this.#onMessageDelete.bind(this));
        this.#logger = logger;
    };

    /**
     * @param {string} token
     */
    login(token) {
        this.#discordInterface.login(token);
    };

    close() {
        this.#discordInterface.close();
        this.#cacheMaxStaleManager.stop();
    };
}

export {IdBot};
