import {isImageMediaType} from "./media-type.js";

/**
 * @typedef {typeof import('./message-image-info.js')['MessageImageInfo']} MessageImageInfo
 * @typedef {typeof import('discord.js')['Snowflake']} Snowflake
 * @typedef {typeof import('discord.js').Message} Message
 * @typedef {typeof import('discord.js').MessagePayload} MessagePayload
 * @typedef {typeof import('discord.js').MessageReplyOptions} MessageReplyOptions
 */
import {MessageType} from "discord-api-types/v10";

class IdBotMessage {

    /**
     * @type {Factory}
     */
    #factory;

    /**
     * @type {MessageImageInfo}
     */
    #imageInfo;

    /**
     * @type {Logger}
     */
    #logger;

    /**
     * @type {RegExp}
     */
    #MESSAGE_ID_VALIDATING_REGEXP = /ID:(\s*)\w+/svg;
    // #MESSAGE_ID_VALIDATING_REGEXP = /(?<=[^\^\W]WID:)(ID:(\s*)?.+)(?=((\WID:)|$))/svg;

    /**
     *@type {Message}
     */
    #discordJsMessage;

    get id() {
        return this.#discordJsMessage.id;
    }

    get channel() {
        return this.#discordJsMessage.channel;
    }

    get referencedMessageId() {
        return this.#discordJsMessage.reference.messageId;
    }

    get content() {
        return this.#discordJsMessage.content;
    }

    /**
     * @param {string | MessagePayload | MessageReplyOptions} content
     */
    reply(content) {
        return this.#discordJsMessage.reply(content);
    }

    /**
     * @param {Snowflake} authorId
     */
    isAuthoredBy(authorId) {
        return this.#discordJsMessage.author.id === authorId;
    }

    /**
     * @returns {boolean}
     */
    get isAuthorHuman() {
        const isAuthorHuman = !this.#discordJsMessage.author.bot;
        this.#logger?.debug(
            `author of message with id ${this.#discordJsMessage.id} is a ${isAuthorHuman ? "human" : "bot"}`
        );

        return isAuthorHuman;
    }

    /**
     * @returns {boolean}
     */
    get isReply() {
        return this.#discordJsMessage.type === MessageType.Reply;
    }

    /**
     * @param {Snowflake} authorId
     * @returns {boolean}
     */
    isReplyBy(authorId) {
        const isOurReply = this.isAuthoredBy(authorId) && this.isReply;
        this.#logger?.debug(`author of message with id ${this.#discordJsMessage.id} is ${isOurReply ? "" : "not "}us`);

        return isOurReply;
    }

    /**
     * @returns {number}
     */
    get numberOfContentImageIdentifiers() {
        return [...this.#discordJsMessage.content.matchAll(this.#MESSAGE_ID_VALIDATING_REGEXP)].length;
    }

    /**
     * @returns {string[]}
     */
    get #messageImageAttachments() {
        return [...this.#discordJsMessage.attachments.values()]
            .map(v => v.contentType)
            .filter(isImageMediaType);
    }

    /**
     * @returns {number}
     */
    get numberOfImageAttachments() {
        return this.#messageImageAttachments.length;
    }

    /**
     * @returns {MessageImageInfo} Details on the number of image attachments and image identifiers
     */
    get imageInfo() {
        return this.#imageInfo = this.#imageInfo ||
            this.#factory.createMessageImageInfo(this.numberOfImageAttachments, this.numberOfContentImageIdentifiers);
    };

    /**
     * @param {Factory} factory
     * @param {Message} discordJsMessage the discord.js sourced discordJsMessage
     * @param {Logger} [logger]
     */
    constructor(factory, discordJsMessage, logger) {
        this.#factory = factory;
        this.#discordJsMessage = discordJsMessage;
        this.#logger = logger;
    }
}

export {
    IdBotMessage
};
