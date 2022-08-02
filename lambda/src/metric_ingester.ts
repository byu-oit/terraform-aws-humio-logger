import {
  CloudWatchClient,
  GetMetricDataCommand,
  GetMetricDataCommandOutput,
  MessageData
} from '@aws-sdk/client-cloudwatch'
import { InvokeCommand, LambdaClient } from '@aws-sdk/client-lambda'
import { Context } from 'aws-lambda'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import env from 'env-var'
import fs from 'fs'
import path from 'path'
import { ingest } from './events'
import { logger } from './logger'

dayjs.extend(utc)

const NEXT_TOKEN_KEY = 'NextToken'
const START_TIME_KEY = 'StartTime'
const END_TIME_KEY = 'EndTime'

/**
 * Ingest CloudWatch Metrics data to Humio repository.
 */
export async function handler (event: any, context: Context): Promise<void> {
  // Load user defined configurations for the API request.
  let configurations = env.get('CONFIG').required().asJsonObject() as any

  // Set next token if one is present in the event.
  if (NEXT_TOKEN_KEY in event) {
    configurations[NEXT_TOKEN_KEY] = event[NEXT_TOKEN_KEY]
  }

  // Set default start time if none is present.
  if (!(START_TIME_KEY in configurations)) {
    if (START_TIME_KEY in event) {
      configurations[START_TIME_KEY] = event[START_TIME_KEY]
    } else {
      configurations[START_TIME_KEY] = dayjs.utc().subtract(15, 'minutes').toISOString()
    }
  }

  // Set default end time if none is present.
  if (!(END_TIME_KEY in configurations)) {
    if (END_TIME_KEY in event) {
      configurations[END_TIME_KEY] = event[END_TIME_KEY]
    } else {
      configurations[END_TIME_KEY] = dayjs.utc().toISOString()
    }
  }

  // Make CloudWatch:GetMetricData API request.
  const metricData = await getMetricData(configurations)

  // If there is a next token in the metric data,
  // then use this to retrieve the rest of the metrics recursively.
  if (NEXT_TOKEN_KEY in metricData) {
    const client = new LambdaClient({})
    // Pass on next token, start time, and end time.
    event[NEXT_TOKEN_KEY] = metricData[NEXT_TOKEN_KEY]
    event[START_TIME_KEY] = configurations[START_TIME_KEY]
    event[END_TIME_KEY] = configurations[END_TIME_KEY]
    const command = new InvokeCommand({
      FunctionName: context.functionName,
      InvocationType: 'Event',
      Payload: event
    })
    await client.send(command)
  }

  // Format metric data to Humio event data.
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
      const timestamp = dayjs(ts).utc().toISOString()
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
