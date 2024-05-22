class Logger {

    #console;

    /**
     * @type {string}
     */
    #name;

    /**
     * @param {Console} console - the console to log to
     * @param {string} [name] - an optional logger name
     */
    constructor(console, name) {
        this.#console = console;
        this.#name = name;
    }

    #format = message => `${this.#name ? (this.#name + ":") : ""} ${message}`;

    /**
     * @param {string} message
     */
    info = message => this.#console.info(this.#format(message));

    /**
     * @param {string} message
     */
    log = message => this.#console.log(this.#format(message));

    /**
     * @param {string} message
     */
    debug = message => this.#console.debug(this.#format(message));

    /**
     * @param {string} message
     */
    error = message => this.#console.error(this.#format(message));

    /**
     * @param {string} message
     */
    warn = message => this.#console.warn(this.#format(message));
}

export {Logger};
