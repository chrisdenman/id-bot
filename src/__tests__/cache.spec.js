import {beforeEach, describe, expect, it, vi} from "vitest";
import {Factory} from "../js/factory.js";
import {createUuid} from "./uuid.js";
import {LEVEL_OFF} from "../js/logger.js";

describe("Tests for our Cache", () => {

    /**
     * @type Cache
     */
    let cache;

    /**
     * @type Factory
     */
    let factory;

    /**
     * @type *
     */
    let k0, v0, k1, v1;

    const setK0V0 = () => {
        cache.set(k0, v0);

        return cache;
    };

    const setK1V1 = () => {
        cache.set(k1, v1);

        return cache;
    };

    beforeEach(() => {
        factory = new Factory(
            /(?<=(^|\s|\W)ID:\s*)(\w+)(?!\WID:)/svg,
            /<(a)?:(?<name>\w+):(?<id>\d+)>/g,
            LEVEL_OFF
        );
        cache = factory.createCache();
        [k0, v0, k1, v1] = [createUuid(), createUuid(), createUuid(), createUuid()];
    });

    it("We can store and retrieve things from the cache", () => {
        expect(setK0V0().get(k0)).toBe(v0);
    });

    it("Newly added cache entries have the required properties set", () => {
        setK0V0();

        const meta = cache.getMeta(k0);

        expect(meta.key).toBe(k0);
        expect(meta.createdAt).toBeDefined();
    });

    it("Newly added cache entries have a 'createdAt' value greater or equal than that sampled before population.", () => {
        const then = factory.getNowInMilliSeconds;

        const meta = setK0V0().getMeta(k0);

        expect(meta.createdAt).toBeGreaterThanOrEqual(then);
    });

    it("Metadata records the last accessed time of an entry correctly.", () => {
        setK0V0();
        const metaBefore = cache.getMeta(k0);

        expect(metaBefore.lastAccessedAt).toEqual(metaBefore.createdAt);

        const then = factory.getNowInMilliSeconds;
        cache.get(k0);
        const metaAfter = cache.getMeta(k0);

        expect(metaAfter.lastAccessedAt).toBeGreaterThanOrEqual(then);
    });

    it("Metadata records the last update time of an entry correctly.", () => {
        setK0V0();
        const newValue = v1;
        const metaBefore = cache.getMeta(k0);

        expect(metaBefore.lastUpdatedAt).toBeUndefined();

        const then = factory.getNowInMilliSeconds;
        cache.set(k0, newValue);
        const metaAfter = cache.getMeta(k0);

        expect(metaAfter.lastUpdatedAt).toBeGreaterThanOrEqual(then);
    });

    it("Retrieving metadata returns undefined if the key is unknown.", () => {
        expect(cache.getMeta(k0)).toBeUndefined();
    });

    it("Retrieving values returns undefined if the key is unknown.", () => {
        expect(cache.get(k0)).toBeUndefined();
    });

    it("Requests to remove unknown keys are allowed.", () => {
        expect(cache.remove(k0)).toEqual(false);
    });

    it("The removal by key works.", () => {
        setK0V0();

        expect(cache.remove(k0)).toBe(true);
        expect(cache.remove(k0)).toBe(false);
    });

    it("That metaData returns the metadata elements.", () => {
        setK0V0();
        const metas = cache.metaData;
        /**
         * @type {CacheMeta}
         */
        const firstElement = metas.next().value;
        expect(cache.get(firstElement.key)).toBe(v0);
        expect(metas.next().done).toBe(true);
    });

    it("That metaData returns elements sorted by decreasing lastAccessedAt values.", async () => {
        vi.useRealTimers();

        setK1V1();

        await new Promise(resolve => setTimeout(resolve, 100));
        setK0V0();
        const metas = cache.metaData;

        /**
         * @type {CacheMeta}
         */
        const meta0 = metas.next().value;
        metas.next();

        expect(metas.next().done).toBe(true);

        expect(cache.get(meta0.key)).toBe(v1);
    });

});
