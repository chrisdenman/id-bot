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

    add(key, value) {
        this.#map.set(key, value);
        this.#logger.debug(`set entry [${key}->${value}], ${this.#map.size} values cached.`);
    }

    getValue(key) {
        return this.#map.get(key);
    }

    delete(key){
        const deleted = this.#map.delete(key);
        this.#logger.debug(
            deleted ? `removed entry [${key}->?], ${this.#map.size} values cached.` : `unknown key ${key}`
        );
        
        return deleted;
    }
}

export {Cache};
