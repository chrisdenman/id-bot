import {Factory} from "./factory.js";

const env = process.env;
const client_id = env["id_bot_client_id"];
const token = env["id_bot_token"];
new Factory().createApplication(client_id).start(token);
