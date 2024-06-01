import {describe, expect, it} from "vitest";
import {
    MS_PER_SECOND,
    SECONDS_PER_MINUTE,
    MINUTES_PER_HOUR,
    HOURS_PER_DAY,

    ONE_SECOND_MILLI_SECONDS,
    ONE_MINUTE_MILLI_SECONDS,
    ONE_HOUR_MILLI_SECONDS,
    ONE_DAY_MILLI_SECONDS
} from "../js/durations-ms.js";

describe("Tests for mS constants", () => {

    it("Checking the constants have the correct values", () => {
        expect(MS_PER_SECOND).toBe(1000);
        expect(SECONDS_PER_MINUTE).toBe(60);
        expect(MINUTES_PER_HOUR).toBe(60);
        expect(HOURS_PER_DAY).toBe(24);

        expect(ONE_SECOND_MILLI_SECONDS).toBe(1000);
        expect(ONE_MINUTE_MILLI_SECONDS).toBe(1000 * 60);
        expect(ONE_HOUR_MILLI_SECONDS).toBe(1000 * 60 * 60);
        expect(ONE_DAY_MILLI_SECONDS).toBe(1000 * 60 * 60 * 24);
    });
});
