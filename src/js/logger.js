const LEVEL_OFF = 0x0;
const LEVEL_TRACE = 0x1;
const LEVEL_DEBUG = LEVEL_TRACE << 1;
const LEVEL_LOG = LEVEL_DEBUG << 1;
const LEVEL_INFO = LEVEL_LOG << 1;
const LEVEL_WARN = LEVEL_INFO << 1;
const LEVEL_ERROR = LEVEL_WARN << 1;
const LEVEL_FATAL = LEVEL_ERROR << 1;

class Logger {

    #console;

    /**
     * @type string
     */
    #prefix;

    /**
     * @type number
     */
    #level;

    /**
     * @param {Console} console - the console to log to
     * @param {number} [level=LEVEL_TRACE | LEVEL_DEBUG | LEVEL_LOG | LEVEL_INFO | LEVEL_WARN | LEVEL_ERROR | LEVEL_FATAL] - this logger's logging level
     * @param {string} [prefix] - an optional logger prefix
     */
    constructor(
        console,
        level = LEVEL_TRACE | LEVEL_DEBUG | LEVEL_LOG | LEVEL_INFO | LEVEL_WARN | LEVEL_ERROR | LEVEL_FATAL,
        prefix= undefined
    ) {
        this.#console = console;
        this.#level = level;
        this.#prefix = prefix;
    };

    #isLogged = level => (level & this.#level) !== LEVEL_OFF;

    #levelText = (level) => {
        let levelText= "";
        switch (level & this.#level) {
            case LEVEL_TRACE:
                levelText = "TRACE";
                break;
            case LEVEL_DEBUG:
                levelText = "DEBUG";
                break;
            case LEVEL_LOG:
                levelText = "LOG";
                break;
            case LEVEL_INFO:
                levelText = "INFO";
                break;
            case LEVEL_WARN:
                levelText = "WARN";
                break;
            case LEVEL_ERROR:
                levelText = "ERROR";
                break;
            case LEVEL_FATAL:
                levelText = "FATAL";
                break;
        }

        return levelText;
    };

    #format = (message, level) => `${level}:${this.#prefix ? (this.#prefix + ":") : ""}${message}`;

    #logAt = (message, level, target) => {
        if (this.#isLogged(level)) {
            target(this.#format(message, this.#levelText(level)));
        }
    };

    /**
     * @param {*} message
     */
    trace = message => this.#logAt(message, LEVEL_TRACE, this.#console.trace);

    /**
     * @param {*} message
     */
    debug = message => this.#logAt(message, LEVEL_DEBUG, this.#console.debug);

    /**
     * @param {*} message
     */
    log = message => this.#logAt(message, LEVEL_LOG, this.#console.log);

    /**
     * @param {*} message
     */
    info = message => this.#logAt(message, LEVEL_INFO, this.#console.info);

    /**
     * @param {*} message
     */
    warn = message => this.#logAt(message, LEVEL_WARN, this.#console.warn);

    /**
     * @param {*} message
     * @param {Error} [error]
     */
    error = (message, error= undefined) => {
        this.#logAt(message, LEVEL_ERROR, this.#console.error);
        if (error) {
            this.#logAt(error, LEVEL_ERROR, this.#console.error);
        }
    };

    /**
     * @param {*} message
     */
    fatal = message => this.#logAt(message, LEVEL_FATAL, this.#console.fatal);
}

export {
    Logger,
    LEVEL_OFF,
    LEVEL_TRACE,
    LEVEL_DEBUG,
    LEVEL_LOG,
    LEVEL_INFO,
    LEVEL_WARN,
    LEVEL_ERROR,
    LEVEL_FATAL
};