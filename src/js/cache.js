import {CacheMeta} from "./cache-meta.js";

class Cache {

    /**
     * @type Factory
     */
    #factory;

    /**
     * @type Logger
     */
    #logger;

    /**
     * @type {Map<Any, Any>}
     */
    #keyToValue;

    /**
     * @type {Map<Any, CacheMeta>}
     */
    #keyToMetaData;

    /**
     *
     * @param {Factory} factory
     * @param {Logger} logger
     */
    constructor(factory, logger) {
        this.#factory = factory;
        this.#logger = logger;

        this.#keyToValue = new Map();
        this.#keyToMetaData = new Map();
    }

    /**
     * @param {*} key
     * @param {*} value
     */
    set(key, value) {
        const isUpdate = this.#keyToValue.has(key);
        const meta = isUpdate ?
            this.#factory.withUpdate(value, this.#keyToMetaData.get(key)) :
            this.#factory.createCacheMeta(key, value);
        this.#keyToMetaData.set(key, meta);
        this.#keyToValue.set(key, value);
        this.#logger.debug(`${isUpdate ? "=" : ">"}[${key}->${value}] : ${this.#keyToValue.size} values cached.`);
    }

    /**
     * @param {*} key
     * @returns {undefined|Any}
     */
    get(key) {
        if (this.#keyToValue.has(key)) {
            const value = this.#keyToValue.get(key);

            this.#keyToMetaData.set(key, this.#factory.withCacheAccess(this.#keyToMetaData.get(key)));
            this.#logger.debug(`<[${key}]`);

            return value;
        } else {
            this.#logger.debug(`?[${key}]`);

            return undefined;
        }
    }

    /**
     * @param {*} key
     * @returns {CacheMeta}
     */
    getMeta(key) {
        return this.#keyToValue.has(key) ? this.#keyToMetaData.get(key) : undefined;
    }

    /**
     * @returns {IterableIterator<CacheMeta>}
     */
    get getMetas() {
        return this.#keyToMetaData.values();
    }

    /**
     * @param {*} key
     * @returns {boolean} true iff. the item was removed
     */
    remove(key) {
        this.#keyToMetaData.delete(key);
        const dataDeleted = this.#keyToValue.delete(key);

        this.#logger.debug(
            dataDeleted ?
                this.#logger.debug(`-[${key}] : ${this.#keyToValue.size} values cached.`) : `unknown key ${key}`
        );

        return dataDeleted;
    }
}

export {Cache, CacheMeta};
