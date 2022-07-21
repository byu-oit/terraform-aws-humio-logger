"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseMessage = exports.decode = exports.ingest = void 0;
const node_fetch_1 = __importDefault(require("node-fetch"));
const zlib_1 = require("zlib");
const env_1 = require("./env");
const logger_1 = require("./logger");
const rx_1 = require("./rx");
const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${env_1.token}`
};
/**
 * Wrap and send CloudWatch Logs/Metrics to Humio repository.
 */
async function ingest(humioEvents, hostType) {
    const data = [{ tags: { host: hostType }, events: humioEvents }];
    logger_1.logger.debug({ data }, 'Data being sent to Humio');
    return await (0, node_fetch_1.default)(env_1.url, { method: 'POST', headers, body: data });
}
exports.ingest = ingest;
/**
 * Unzip and decode given event.
 */
function decode(event) {
    const decodedJsonEvent = (0, zlib_1.gunzipSync)(Buffer.from(event.awslogs.data, 'base64'));
    return JSON.parse(decodedJsonEvent.toString());
}
exports.decode = decode;
/**
 * Simple CloudWatch Logs parser.
 */
function parseMessage(message) {
    let rx;
    if (message.startsWith('END')) {
        rx = rx_1.endMatcher;
    }
    else if (message.startsWith('START')) {
        rx = rx_1.startMatcher;
    }
    else if (message.startsWith('REPORT')) {
        rx = rx_1.reportMatcher;
    }
    else {
        rx = rx_1.stdMatcher;
    }
    const matches = rx.exec(message);
    return matches?.groups ?? {};
}
exports.parseMessage = parseMessage;
