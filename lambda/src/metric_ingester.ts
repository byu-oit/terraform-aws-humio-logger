import {
  CloudWatchClient,
  GetMetricDataCommand,
  type GetMetricDataCommandOutput,
  type MessageData
} from '@aws-sdk/client-cloudwatch'
import { InvokeCommand, LambdaClient } from '@aws-sdk/client-lambda'
import { type Context } from 'aws-lambda'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import env from 'env-var'
import { ingest } from './events'
import { logger } from './logger'
import { parseRateUnit } from './util'

dayjs.extend(utc)

const NEXT_TOKEN_KEY = 'NextToken'
const START_TIME_KEY = 'StartTime'
const END_TIME_KEY = 'EndTime'

/**
 * Ingest CloudWatch Metrics data to Humio repository.
 */
export async function handler (event: any, context: Context): Promise<void> {
  logger.debug({ event, context }, 'Invoked metric ingester')
  // Load user defined configurations for the API request.
  const configurations = env.get('CONFIG').required().asJsonObject() as any
  logger.debug({ configurations }, 'Found configurations in environment')

  // Set next token if one is present in the event.
  if (NEXT_TOKEN_KEY in event) {
    logger.debug('Found next token in incoming event')
    configurations[NEXT_TOKEN_KEY] = event[NEXT_TOKEN_KEY]
  }

  // Set default start time if none is present.
  if (!(START_TIME_KEY in configurations)) {
    if (START_TIME_KEY in event) {
      logger.debug('Set start time from incoming event')
      configurations[START_TIME_KEY] = dayjs(event[START_TIME_KEY])
    } else {
      const [value, unit] = env.get('RATE_EXPRESSION').default('15 minutes').asString().split(' ')
      logger.debug('Set default start time')
      configurations[START_TIME_KEY] = dayjs.utc().subtract(parseInt(value), parseRateUnit(unit))
    }
  } else {
    logger.debug('Set start time from configuration')
    const startTime = dayjs(configurations[START_TIME_KEY])
    if (!startTime.isValid()) {
      throw new TypeError(`Invalid start time ${String(configurations[START_TIME_KEY])}`)
    }
    configurations[END_TIME_KEY] = startTime
  }

  // Set default end time if none is present.
  if (!(END_TIME_KEY in configurations)) {
    if (END_TIME_KEY in event) {
      logger.debug('Set end time from incoming event')
      configurations[END_TIME_KEY] = dayjs(event[END_TIME_KEY])
    } else {
      logger.debug('Set default end time')
      configurations[END_TIME_KEY] = dayjs.utc()
    }
  } else {
    logger.debug('Set end time from configuration')
    const endTime = dayjs(configurations[END_TIME_KEY])
    if (!endTime.isValid()) {
      throw new TypeError(`Invalid end time ${String(configurations[END_TIME_KEY])}`)
    }
    configurations[END_TIME_KEY] = endTime
  }

  // Make CloudWatch:GetMetricData API request.
  logger.debug({ configurations }, 'Request metric data')
  const metricData = await getMetricData(configurations)

  // If there is a next token in the metric data,
  // then use this to retrieve the rest of the metrics recursively.
  if (NEXT_TOKEN_KEY in metricData) {
    logger.debug('Invoke next ingester to continue processing metric data recursively')
    const client = new LambdaClient({})
    // Pass on next token, start time, and end time.
    event[NEXT_TOKEN_KEY] = metricData[NEXT_TOKEN_KEY]
    event[START_TIME_KEY] = configurations[START_TIME_KEY]
    event[END_TIME_KEY] = configurations[END_TIME_KEY]
    const command = new InvokeCommand({
      FunctionName: context.functionName,
      InvocationType: 'Event',
      Payload: Buffer.from(JSON.stringify(event))
    })
    await client.send(command)
  }

  // Format metric data to Humio event data.
  logger.debug('Format metric data as humio events')
  const humioEvents = formatHumioEvents(metricData, configurations)

  // Send Humio event data to Humio.
  const response = await ingest(humioEvents, 'cloudwatch_metrics')
  logger.debug({ response: response.text() }, 'Got response from Humio.')
}

/**
 * Make CloudWatch:GetMetricData API request.
 */
async function getMetricData (configurations: any): Promise<GetMetricDataCommandOutput> {
  // Create CloudWatch client.
  const client = new CloudWatchClient({})
  const command = new GetMetricDataCommand(configurations)

  // Make GetMetricData API request.
  return await client.send(command)
}

export interface HumioMetricEvent {
  timestamp: string
  attributes: {
    metricDataResults: {
      id?: string
      label?: string
      value?: number
      status_code?: string
    }
    messages?: MessageData[]
    requestType: 'GetMetricData'
    requestParameters: unknown
  }
}

/**
 * Create list of Humio events based on metrics.
 */
function formatHumioEvents (metrics: GetMetricDataCommandOutput, configurations: any): HumioMetricEvent[] {
  const humioEvents: HumioMetricEvent[] = []

  // Create Humio event based on each extracted timestamp.
  for (const result of metrics.MetricDataResults ?? []) {
    (result.Timestamps ?? []).forEach((ts, i) => {
      const timestamp = dayjs(ts).toISOString()
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
      })
    })
  }
  return humioEvents
}
