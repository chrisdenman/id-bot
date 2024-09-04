import {describe, expect, it} from "vitest";
import {Factory} from "../js/factory.js";
import {createUuid} from "./uuid.js";
import {ONE_MINUTE_MILLI_SECONDS, ONE_DAY_MILLI_SECONDS} from "../js/durations-ms.js";

describe("Tests for our Factory", () => {

    it("That we can create a new application using the factory", () => {
        expect(
            new Factory()
                .createApplication(
                    createUuid(),
                    ONE_MINUTE_MILLI_SECONDS,
                    ONE_DAY_MILLI_SECONDS)
        ).toBeDefined();
    });
});
