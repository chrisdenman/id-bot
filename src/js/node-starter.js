import {Factory} from "./factory.js";
import {ONE_MINUTE_MILLI_SECONDS, ONE_DAY_MILLI_SECONDS} from "./durations-ms.js";

const env = process.env;
const client_id = env["id_bot_client_id"];
const token = env["id_bot_token"];

new Factory()
    .createApplication(
        client_id,
        ONE_MINUTE_MILLI_SECONDS,
        ONE_DAY_MILLI_SECONDS
    ).start(token);
