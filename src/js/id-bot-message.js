/**
 * @typedef {typeof import('./image-id-stats.js')['ImageIdStats']} ImageIdStats
 * @typedef {typeof import('discord.js')['Snowflake']} Snowflake
 * @typedef {typeof import('discord.js').Message} Message
 * @typedef {typeof import('discord.js').MessagePayload} MessagePayload
 * @typedef {typeof import('discord.js').MessageReplyOptions} MessageReplyOptions
 */
import {MessageType} from "discord-api-types/v10";

/**
 * A facade for a Discord JS Message.
 */
class IdBotMessage {

    /**
     * @type ImageIdStats
     */
    #imageIdStats;

    /**
     * @type Message
     */
    #discordJsMessage;

    get discordJsMessage() {
        return this.#discordJsMessage;
    };

    get id() {
        return this.#discordJsMessage.id;
    };

    get channel() {
        return this.#discordJsMessage.channel;
    };

    get referencedMessageId() {
        // noinspection JSUnresolvedReference
        return this.#discordJsMessage?.reference?.messageId;
    };

    get content() {
        return this.#discordJsMessage.content;
    };

    /**
     * @param {Snowflake} authorId
     */
    isAuthoredBy(authorId) {
        return this.#discordJsMessage.author.id === authorId;
    };

    /**
     * @returns {boolean}
     */
    get isAuthorHuman() {
        return !this.#discordJsMessage.author.bot;
    };

    /**
     * @returns {boolean}
     */
    get isReply() {
        return this.#discordJsMessage.type === MessageType.Reply;
    };

    /**
     * @param {Snowflake} authorId
     * @returns {boolean}
     */
    isReplyBy(authorId) {
        return this.isAuthoredBy(authorId) && this.isReply;
    };

    /**
     * @returns {ImageIdStats} Details on the number of image attachments and image identifiers
     */
    get imageIdStats() {
        return this.#imageIdStats;
    };

    /**
     * @returns {string}
     */
    toString() {
        return `message(id=${this.id}, content=${this.content}, channel=${this.channel}, isReply=${this.isReply}, isAuthorHuman=${this.isAuthorHuman}, referencedMessageId=${this?.referencedMessageId}, imageIdStats=${this.imageIdStats})`;
    };

    /**
     * @returns {string}
     */
    toIdString() {
        return `message(id=${this.id}, ...)`;
    };

    /**
     * @param {ImageIdStats} imageIdStats
     * @param {Message} discordJsMessage the discord.js sourced discordJsMessage
     */
    constructor(imageIdStats, discordJsMessage) {
        this.#discordJsMessage = discordJsMessage;
        this.#imageIdStats = imageIdStats;
    };
}

export {
    IdBotMessage
};
