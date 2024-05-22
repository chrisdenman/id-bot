import {expect, describe, it} from "vitest";
import {createUuid} from "./uuid";

import {Factory} from "../js/factory";

const factory = new Factory();

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
    ].forEach(([messageContent, numberOfIdentifiers]) =>
        it(
            `That "${messageContent}" contains ${numberOfIdentifiers} identifiers`,
            () => {
                expect(
                    factory.createIdBotMessage({
                        id: createUuid(),
                        attachments: new Map(),
                        content: messageContent
                    }).numberOfContentImageIdentifiers
                ).toBe(numberOfIdentifiers);
            }
        )
    )
);
