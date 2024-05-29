class CacheValueWrapper {

    /**
     * @type {Factory}
     */
    #factory;

    /**
     * @type {number}
     */
    #createdAt;

    /**
     * @type {number}
     */
    #addedAt;

    /**
     * @type {number}
     */
    #accessedAt;

    /**
     * @type {number}
     */
    #updatedAt;

    /**
     * @type {Any}
     */
    #key;

    /**
     * @type {Any}
     */
    #value;

    /**
     *
     * @param  {Factory} factory
     * @param  {Any} key
     * @param  {Any} [value]
     */
    constructor(factory, key, value) {
        this.#factory = factory;
        this.#key = key;
        this.#value = value;
        
        this.#createdAt = this.#factory.createTimeStamp();
    }

    get key() {
        return this.#key;
    }

    get value() {
        return this.#value;
    }

    get createdAt() {
        return this.#createdAt;
    }

    get addedAt() {
        return this.#addedAt;
    }

    get accessedAt() {
        return this.#accessedAt;
    }

    get updatedAt() {
        return this.#updatedAt;
    }
}

class Cache {

    /**
     * @type Map
     */
    #map;

    /**
     * @type {Logger}
     */
    #logger;

    constructor(logger) {
        this.#map = new Map();
        this.#logger = logger;
    }

    set(key, value) {
        this.#map.set(key, value);
        this.#logger.debug(`+[${key}->${value}] : ${this.#map.size} values cached.`);
    }

    get(key) {
        if (this.#map.has(key)) {
            const value = this.#map.get(key);
            this.#logger.debug(`=[${key}->${value}]`);

            return value;
        }
    }

    remove(key){
        const deleted = this.#map.delete(key);
        this.#logger.debug(
            deleted ? this.#logger.debug(`-[${key}->?] : ${this.#map.size} values cached.`) : `unknown key ${key}`
        );
        
        return deleted;
    }
}

export {Cache};
