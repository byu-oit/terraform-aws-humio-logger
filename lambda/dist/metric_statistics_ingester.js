"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const env_var_1 = __importDefault(require("env-var"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const client_cloudwatch_1 = require("@aws-sdk/client-cloudwatch");
const dayjs_1 = __importDefault(require("dayjs"));
const utc_1 = __importDefault(require("dayjs/plugin/utc"));
const logger_1 = require("./logger");
const events_1 = require("./events");
dayjs_1.default.extend(utc_1.default);
const START_TIME_KEY = 'StartTime';
const END_TIME_KEY = 'EndTime';
/**
 * Ingest CloudWatch Metric statistics to Humio repository.
 */
async function handler(event, context) {
    // Load user defined configurations for the API request.
    const filename = env_var_1.default.get('CONF_NAME').default('conf_metric_statistics_ingester.json').asString();
    const contents = fs_1.default.readFileSync(path_1.default.join(__dirname, filename)).toString('utf-8');
    const configurations = JSON.parse(contents);
    for (const parameters of configurations) {
        // Make CloudWatch:GetMetricStatistics API request.
        const metricStatistics = await getMetricStatistics(parameters);
        // Used for debugging.
        logger_1.logger.debug({ metricStatistics }, 'Statistics from CloudWatch Metrics');
        // Format metric data to Humio event data
        const humioEvents = formatHumioEvents(metricStatistics, parameters);
        // Send Humio event data to Humio
        const response = await (0, events_1.ingest)(humioEvents, 'cloudwatch_metrics');
        logger_1.logger.debug({ response: response.text() }, 'Got response from Humio.');
    }
}
exports.handler = handler;
async function getMetricStatistics(parameters) {
    // Check whether start and end time has been set or defaults are to be used.
    if (!(START_TIME_KEY in parameters)) {
        parameters[START_TIME_KEY] = dayjs_1.default.utc().subtract(15, 'minutes').toISOString();
    }
    if (!(END_TIME_KEY in parameters)) {
        parameters[END_TIME_KEY] = dayjs_1.default.utc().toISOString();
    }
    // Used for debugging.
    logger_1.logger.debug({ startTime: parameters[START_TIME_KEY], endTime: parameters[END_TIME_KEY] });
    // Make GetMetricStatistics API request.
    const client = new client_cloudwatch_1.CloudWatchClient({});
    const command = new client_cloudwatch_1.GetMetricStatisticsCommand(parameters);
    return await client.send(command);
}
/**
 * Create list of Humio events based on metrics.
 */
function formatHumioEvents(metrics, parameters) {
    const humioEvents = [];
    // Used for debugging.
    logger_1.logger.debug({ datapoints: metrics.Datapoints }, 'Datapoints');
    (metrics.Datapoints ?? []).forEach((datapoint) => {
        const timestamp = (0, dayjs_1.default)(datapoint.Timestamp).utc().toISOString();
        const event = {
            timestamp,
            attributes: {
                label: metrics.Label,
                datapoint: {
                    sampleCount: datapoint.SampleCount,
                    average: datapoint.Average,
                    sum: datapoint.Sum,
                    minimum: datapoint.Minimum,
                    maximum: datapoint.Maximum,
                    unit: datapoint.Unit,
                    extendedStatistics: datapoint.ExtendedStatistics,
                    responseMetaData: metrics.$metadata
                },
                requestType: 'GetMetricStatistics',
                requestParameters: parameters
            }
        };
        humioEvents.push(event);
    });
    return humioEvents;
}
