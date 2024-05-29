import {isImageMediaType} from "./media-type.js";
import {numberOfEmojiContained} from "./emoji.js";

/**
 * @typedef {typeof import('./image-id-stats.js')['ImageIdStats']} ImageIdStats
 * @typedef {typeof import('discord.js')['Snowflake']} Snowflake
 * @typedef {typeof import('discord.js').Message} Message
 * @typedef {typeof import('discord.js').MessagePayload} MessagePayload
 * @typedef {typeof import('discord.js').MessageReplyOptions} MessageReplyOptions
 */
import {MessageType} from "discord-api-types/v10";

class IdBotMessage {

    /**
     * @type {ImageIdStats}
     */
    #imageIdStats;

    /**
     * @type {RegExp}
     */
    #MESSAGE_ID_VALIDATING_REGEXP = /(?<=(^|\s|\W)ID:\s*)(\w+)(?!\WID:)/svg;

    /**
     * @type {RegExp}
     */
    #CUSTOM_EMOJI_REGEX = /<(a)?:(?<name>\w+):(?<id>\d+)>/g;

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
        return this.#discordJsMessage?.reference?.messageId;
    }

    get content() {
        return this.#discordJsMessage.content;
    }

    /**
     * @param {string} content
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
        return !this.#discordJsMessage.author.bot;
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
        return this.isAuthoredBy(authorId) && this.isReply;
    }

    /**
     * @returns {ImageIdStats} Details on the number of image attachments and image identifiers
     */
    get imageIdStats() {
        return this.#imageIdStats;
    };

    toString() {
        return `message(id=${this.id}, content=${this.content}, channel=${this.channel}, isReply=${this.isReply}, isAuthorHuman=${this.isAuthorHuman}, referencedMessageId=${this?.referencedMessageId}, imageIdStats=${this.imageIdStats})`;
    }

    toIdString() {
        return `message(id=${this.id}, ...)`;
    }

    /**
     * @param {Factory} factory
     * @param {Message} discordJsMessage the discord.js sourced discordJsMessage
     */
    constructor(factory, discordJsMessage) {
        this.#discordJsMessage = discordJsMessage;

        const content = discordJsMessage.content;

        const customEmojiMatches = [...content.matchAll(this.#CUSTOM_EMOJI_REGEX)];
        const sansCustomEmoji = content.replaceAll(this.#CUSTOM_EMOJI_REGEX, "");
        console.debug(`customEmoji sansCustomEmoji=${sansCustomEmoji}`);

        const numberOfEmoji = numberOfEmojiContained(sansCustomEmoji);

        const idMatches = [...content.matchAll(this.#MESSAGE_ID_VALIDATING_REGEXP)];

        customEmojiMatches?.forEach(match => {
            console.debug(`customEmoji match=${match[0]}`);
            console.debug(`customEmoji name=${match[2]}`);
            console.debug(`customEmoji id=${match[3]}`);
        });

        this.#imageIdStats = factory.createImageIdStats(
                [...discordJsMessage.attachments.values()]
                    .map(v => v.contentType)
                    .filter(isImageMediaType)
                    .length,
            numberOfEmoji,
            customEmojiMatches.length,
            idMatches.length
        );
    }
}

export {
    IdBotMessage
};
