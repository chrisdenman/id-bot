import {afterEach, beforeEach, describe, expect, it, vi} from "vitest";
import {Application} from "../js/application";
import {IdBot} from "../js/id-bot.js";
import {Factory} from "../js/factory";
import {Logger} from "../js/logger";
import {DiscordInterfaceHarness} from "./discord-interface-harness";
import {createUuid} from "./uuid";
import {MessageType} from "discord-api-types/v10";

vi.mock("discord.js", async (importOriginal) => {
    return {
        ...(await importOriginal())
    };
});

const [TOKEN, CLIENT_ID] = ["token", createUuid()];
const UNDER_DESCRIBED_REMINDER_MESSAGE = "Hello! Please add an ID for each image. Thank you! ❤️";
const OVER_DESCRIBED_REMINDER_MESSAGE = "Hello! Whoops, did you forget an image? ❤️";
const AUTHOR_ID__NOT_US = createUuid();
const CONTENT_EMPTY = "";

const createDiscordJsMessage = function (
    content = CONTENT_EMPTY,
    attachmentContentTypes = [],
    authorId = AUTHOR_ID__NOT_US,
    type = MessageType.Default,
    referenceMessageId = undefined,
    isBotAuthored = false,
    id = createUuid(),
) {
    const attachments = new Map(attachmentContentTypes.map(v => [createUuid(), {contentType: v}]));

    return {
        id: id,
        author: {
            id: authorId,
            bot: isBotAuthored
        },
        content: content,
        attachments: attachments,
        type: type,
        reference: {
            messageId: referenceMessageId
        },
        channel: {
            messages: {
                delete: vi.fn().mockImplementationOnce(
                    () => new Promise((resolve) => resolve())
                )
            }
        },
        reply: vi.fn()
    };
};

/**
 * @param {IdBotMessage} userMessage
 */
const createIdBotReply = function (userMessage, replyContent) {
    return createDiscordJsMessage(
        replyContent,
        [],
        CLIENT_ID,
        MessageType.Reply,
        userMessage.id,
        true
    );
};

describe("Application startup and shutdown", () => {
    let factory, process, client, discordInterfaceHarness, idBot, application;

    beforeEach(() => {
        factory = new Factory();
        process = {on: vi.fn(), exit: vi.fn()};
        client = {
            once: vi.fn(),
            on: vi.fn(),
            login: vi.fn().mockImplementationOnce(
                () => new Promise((resolve) => resolve())
            ),
            close: vi.fn(),
            user: {
                tag: "tag"
            }
        };
        discordInterfaceHarness = new DiscordInterfaceHarness(
            client,
            factory,
            factory.createLogger(`DiscordInterface for ${CLIENT_ID}`),
            CLIENT_ID);
        idBot = new IdBot(factory.createCache(), discordInterfaceHarness, new Logger(console, "IdBot"));
        application = new Application(process, idBot);
    });

    it("That messages authored by other bots are ignored.", () => {
        application.start(TOKEN);
        discordInterfaceHarness.onClientReady();

        const discordJsMessage = createDiscordJsMessage(CONTENT_EMPTY, ["image/png"], AUTHOR_ID__NOT_US, MessageType.Default, undefined, true);
        discordInterfaceHarness.onMessageCreate(discordJsMessage);
        application.stop();

        expect(discordJsMessage.reply).not.toBeCalled();
    });

    // @todo that unknown media types for attachments are ignored
    // @todo do updates come with new ids?

    describe(
        "Ensuring that new messages are given the correct reminder replies",
        () => [
            [CONTENT_EMPTY, ["image/png"], UNDER_DESCRIBED_REMINDER_MESSAGE, "ID: An image of something."],
            ["ID: A big shiny horse.", [], OVER_DESCRIBED_REMINDER_MESSAGE, CONTENT_EMPTY],
            ["ID: blah", ["image/png", "image/png"], UNDER_DESCRIBED_REMINDER_MESSAGE, "ID blah.ID: foo"],
            ["ID: A big shiny horse. ID: A mushroom!", ["image/png"], OVER_DESCRIBED_REMINDER_MESSAGE, "ID: A mushroom!"],
        ].forEach(([
                       content,
                       attachmentData,
                       expectedReplyContent,
                       updatedContent
                   ]) => {
                it(
                    `Message="${content}", attachments=${attachmentData}, expectedReply="${expectedReplyContent}", updatedContent="${updatedContent}"`,
                    () => {
                        application.start(TOKEN);
                        discordInterfaceHarness.onClientReady();

                        // User posts a message
                        const userMessage = createDiscordJsMessage(content, attachmentData);
                        discordInterfaceHarness.onMessageCreate(userMessage);

                        // IdBot replies
                        expect(userMessage.reply).toBeCalledWith(expectedReplyContent);

                        // IdBot reply received by discord.js, idBot caches referenced message to idBot reply if the message is not correctly identified
                        const idBotReplyMessage = createIdBotReply(userMessage, expectedReplyContent);
                        discordInterfaceHarness.onMessageCreate(idBotReplyMessage);

                        // User edits their post to correct it
                        const updatedUserMessage = createDiscordJsMessage(
                            updatedContent,
                            attachmentData,
                            AUTHOR_ID__NOT_US,
                            MessageType.Default,
                            undefined,
                            false,
                            userMessage.id
                        );
                        discordInterfaceHarness.onMessageUpdate(userMessage, updatedUserMessage);

                        // IdBot deletes its reply
                        expect(updatedUserMessage.channel.messages.delete).toBeCalledWith(idBotReplyMessage.id);
                    });
            }
        )
    );

    it("That normal shutdown closes the IdBot instance and returns the correct process exit code", () => {
        application.start(TOKEN);
        application.stop();

        expect(process.exit).toHaveBeenCalledWith(0);
    });

    it("That termination closes the IdBot instance and returns the correct process exit code", () => {
        application.start(TOKEN);
        application.terminate();

        expect(process.exit).toHaveBeenCalledWith(-1);
    });

    afterEach(() => {
        vi.clearAllMocks();
    });
});
