import {expect, describe, it} from "vitest";
import {createUuid} from "./uuid";

import {Factory} from "../js/factory";

const factory = new Factory();

describe(
    "Emoji character counting in message content",
    () => [
        ["", 0],
        [" ", 0],
        ["\u{0023}", 1],
        ["\u{0030}", 1],
        ["\u{0039}", 1],
        ["\u{00AE}", 1],
        ["\u{2194}", 1],
        ["\u{1FAF8}", 1],
        ["\u{1FAF8}\u{1FAF8}", 2],
        ["                 \u{1FAF8}              \u{1FAF8}                   ", 2],
        ["\u{0023}\u{1FAF8}\u{0023}", 3],
    ].forEach(([messageContent, expectedEmojiCount]) =>
        it(
            `That "${messageContent}" contains ${expectedEmojiCount} emoji characters.`,
            () => {
                expect(
                    factory.createIdBotMessage({
                        id: createUuid(),
                        attachments: new Map(),
                        content: messageContent
                    }).emojiCount
                ).toBe(expectedEmojiCount);
            }
        )
    )
);


describe(
    "Image ID counting in message content",
    () => [
        ["", 0],
        ["         ", 0],
        ["ID:", 0],
        ["ID: a", 1],
        ["ID: ab", 1],
        ["ID: abc", 1],
        ["ID: abcd", 1],
        ["ID: abcd. ID: abcd.", 2],
        ["ID: abcd. ID: a", 2],
        ["ID: aID: abcd.", 1],
        ["ID: abcsID: abcd.", 1],
        ["ID: abcs. ID: abcd.", 2],
        ["ID: abcs ID: abcd.     ID: abcd", 3]
    ].forEach(([messageContent, expectedImageIdCount]) =>
        it(
            `That "${messageContent}" contains ${expectedImageIdCount} identifiers`,
            () => {
                const discordMessage = factory
                    .createIdBotMessage({
                        id: createUuid(),
                        attachments: new Map(),
                        content: messageContent
                    });

                expect(discordMessage.imageIdentifierCount).toBe(expectedImageIdCount);
            }
        )
    )
);
