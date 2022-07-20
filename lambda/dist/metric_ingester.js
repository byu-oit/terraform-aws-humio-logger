"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const client_cloudwatch_1 = require("@aws-sdk/client-cloudwatch");
const client_lambda_1 = require("@aws-sdk/client-lambda");
const dayjs_1 = __importDefault(require("dayjs"));
const utc_1 = __importDefault(require("dayjs/plugin/utc"));
const env_var_1 = __importDefault(require("env-var"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const events_1 = require("./events");
const logger_1 = require("./logger");
dayjs_1.default.extend(utc_1.default);
const NEXT_TOKEN_KEY = 'NextToken';
const START_TIME_KEY = 'StartTime';
const END_TIME_KEY = 'EndTime';
/**
 * Ingest CloudWatch Metrics data to Humio repository.
 */
async function handler(event, context) {
    // Load user defined configurations for the API request.
    const filename = env_var_1.default.get('CONF_NAME').default('conf_metric_ingester.json').asString();
    const contents = fs_1.default.readFileSync(path_1.default.join(__dirname, filename)).toString('utf-8');
    const configurations = JSON.parse(contents);
    // Set next token if one is present in the event.
    if (NEXT_TOKEN_KEY in event) {
        configurations[NEXT_TOKEN_KEY] = event[NEXT_TOKEN_KEY];
    }
    // Set default start time if none is present.
    if (!(START_TIME_KEY in configurations)) {
        if (START_TIME_KEY in event) {
            configurations[START_TIME_KEY] = event[START_TIME_KEY];
        }
        else {
            configurations[START_TIME_KEY] = dayjs_1.default.utc().subtract(15, 'minutes').toISOString();
        }
    }
    // Set default end time if none is present.
    if (!(END_TIME_KEY in configurations)) {
        if (END_TIME_KEY in event) {
            configurations[END_TIME_KEY] = event[END_TIME_KEY];
        }
        else {
            configurations[END_TIME_KEY] = dayjs_1.default.utc().toISOString();
        }
    }
    // Make CloudWatch:GetMetricData API request.
    const metricData = await getMetricData(configurations);
    // If there is a next token in the metric data,
    // then use this to retrieve the rest of the metrics recursively.
    if (NEXT_TOKEN_KEY in metricData) {
        const client = new client_lambda_1.LambdaClient({});
        // Pass on next token, start time, and end time.
        event[NEXT_TOKEN_KEY] = metricData[NEXT_TOKEN_KEY];
        event[START_TIME_KEY] = configurations[START_TIME_KEY];
        event[END_TIME_KEY] = configurations[END_TIME_KEY];
        const command = new client_lambda_1.InvokeCommand({
            FunctionName: context.functionName,
            InvocationType: 'Event',
            Payload: event
        });
        await client.send(command);
    }
    // Format metric data to Humio event data.
    const humioEvents = formatHumioEvents(metricData, configurations);
    // Send Humio event data to Humio.
    const response = await (0, events_1.ingest)(humioEvents, 'cloudwatch_metrics');
    logger_1.logger.debug({ response: response.text() }, 'Got response from Humio.');
}
exports.handler = handler;
/**
 * Make CloudWatch:GetMetricData API request.
 */
async function getMetricData(configurations) {
    // Create CloudWatch client.
    const client = new client_cloudwatch_1.CloudWatchClient({});
    const command = new client_cloudwatch_1.GetMetricDataCommand(configurations);
    // Make GetMetricData API request.
    return await client.send(command);
}
/**
 * Create list of Humio events based on metrics.
 */
function formatHumioEvents(metrics, configurations) {
    const humioEvents = [];
    // Create Humio event based on each extracted timestamp.
    for (const result of metrics.MetricDataResults ?? []) {
        (result.Timestamps ?? []).forEach((ts, i) => {
            const timestamp = (0, dayjs_1.default)(ts).utc().toISOString();
            humioEvents.push({
                timestamp,
                attributes: {
                    metricDataResults: {
                        id: result.Id,
                        label: result.Label,
                        value: result.Values?.[i],
                        status_code: result.StatusCode
                    },
                    messages: metrics.Messages,
                    requestType: 'GetMetricData',
                    requestParameters: configurations
                }
            });
        });
    }
    return humioEvents;
}
