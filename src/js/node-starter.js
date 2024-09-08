import {Factory} from "./factory.js";
import {LEVEL_ALL} from "./logger.js";
import {ONE_MINUTE_MILLI_SECONDS, ONE_DAY_MILLI_SECONDS} from "./durations-ms.js";

const env = process.env;
const id_bot_config_key_prefix = "id_bot_";
const CLIENT_ID = env[`${id_bot_config_key_prefix}client_id`];
const token = env[`${id_bot_config_key_prefix}token`];
const MESSAGE_ID_REGEX = new RegExp(env[`${id_bot_config_key_prefix}message_id_regex`], "svg");
const CUSTOM_EMOJI_ID_REGEX = new RegExp(env[`${id_bot_config_key_prefix}custom_emoji_id_regex`], "g");

new Factory(
    MESSAGE_ID_REGEX,
    CUSTOM_EMOJI_ID_REGEX,
    LEVEL_ALL
)
    .createApplication(
        CLIENT_ID,
        ONE_MINUTE_MILLI_SECONDS,
        ONE_DAY_MILLI_SECONDS
    ).start(token);
