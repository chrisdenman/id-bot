import {beforeEach, describe, expect, it} from "vitest";
import {Factory} from "../js/factory.js";
import {createUuid} from "./uuid.js";

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
    let key, value;

    beforeEach(() => {
        factory = new Factory();
        cache = factory.createCache();
        key = createUuid();
        value = createUuid();
    });

    it("We can store and retrieve things from the cache", () => {
        cache.set(key, value);

        expect(cache.get(key)).toBe(value);
    });

    it("Newly added cache entries have the required properties set", () => {
        cache.set(key, value);
        const meta = cache.getMeta(key);

        expect(meta.key).toBe(key);
        expect(meta.value).toBe(value);
        expect(meta.createdAt).toBeDefined();
    });

    it("Newly added cache entries have a 'createdAt' value greater or equal than that sampled before population.", () => {
        const then = factory.utcTimeStampNow;
        cache.set(key, value);
        const meta = cache.getMeta(key);

        expect(meta.createdAt).toBeGreaterThanOrEqual(then);
    });

    it("Metadata records the last accessed time of an entry correctly.", () => {
        cache.set(key, value);
        const metaBefore = cache.getMeta(key);

        expect(metaBefore.lastAccessedAt).toBeUndefined();

        const then = factory.utcTimeStampNow;
        cache.get(key);
        const metaAfter = cache.getMeta(key);

        expect(metaAfter.lastAccessedAt).toBeGreaterThanOrEqual(then);
    });

    it("Metadata records the last update time of an entry correctly.", () => {
        cache.set(key, value);
        const newValue = createUuid();
        const metaBefore = cache.getMeta(key);

        expect(metaBefore.updatedAt).toBeUndefined();
        expect(metaBefore.value).toBe(value);

        const then = factory.utcTimeStampNow;
        cache.set(key, newValue);
        const metaAfter = cache.getMeta(key);

        expect(metaAfter.updatedAt).toBeGreaterThanOrEqual(then);
        expect(metaAfter.value).toBe(newValue);
    });

    it("Retrieving metadata returns undefined if the key is unknown.", () => {
        expect(cache.getMeta(key)).toBeUndefined();
    });

    it("Retrieving values returns undefined if the key is unknown.", () => {
        expect(cache.get(key)).toBeUndefined();
    });

    it("Requests to remove unknown keys are allowed.", () => {
        expect(cache.remove(key)).toEqual(false);
    });

    it("The removal by key works.", () => {
        cache.set(key, value);
        expect(cache.remove(key)).toBe(true);
        expect(cache.remove(key)).toBe(false);
    });

});
