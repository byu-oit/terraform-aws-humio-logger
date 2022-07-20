"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const lodash_pick_1 = __importDefault(require("lodash.pick"));
const events_1 = require("./events");
const logger_1 = require("./logger");
const rx_1 = require("./rx");
/**
 * Extract log data from CloudWatch Logs events and
 * pass the data onto the Humio ingester.
 */
async function handler(event) {
    const decodedEvent = (0, events_1.decode)(event);
    logger_1.logger.debug({ event: decodedEvent }, 'Event from CloudWatch Logs');
    // Extract the general attributes from the event batch
    const batchAttrs = {
        ...(0, lodash_pick_1.default)(decodedEvent, 'owner', 'logGroup', 'logStream', 'messageType', 'subscriptionFilters'),
        ...rx_1.logGroupMatcher.exec(decodedEvent.logGroup)
    };
    // Flatten the events from CloudWatch Logs
    const humioEvents = [];
    for (const logEvent of decodedEvent.logEvents) {
        const { timestamp, message } = logEvent;
        const attributes = {
            ...batchAttrs,
            ...(0, events_1.parseMessage)(message)
        };
        humioEvents.push({
            timestamp,
            rawstring: message,
            kvparse: true,
            attributes
        });
    }
    const response = await (0, events_1.ingest)(humioEvents, 'cloudwatch_logs');
    logger_1.logger.debug({ response: response.text() }, 'Got response from humio');
}
exports.handler = handler;
