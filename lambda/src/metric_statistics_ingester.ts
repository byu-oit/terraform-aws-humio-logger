import { Context } from 'aws-lambda'
import env from 'env-var'
import {
  CloudWatchClient,
  GetMetricStatisticsCommand,
  GetMetricStatisticsCommandOutput
} from '@aws-sdk/client-cloudwatch'
import { ResponseMetadata } from '@aws-sdk/types'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import { logger } from './logger'
import { ingest } from './events'
import { parseRateUnit } from './util'

dayjs.extend(utc)

const START_TIME_KEY = 'StartTime'
const END_TIME_KEY = 'EndTime'

/**
 * Ingest CloudWatch Metric statistics to Humio repository.
 */
export async function handler (event: any, context: Context): Promise<void> {
  logger.debug({ event, context }, 'Invoked metric statistics ingester')
  // Load user defined configurations for the API request.
  const configurations = env.get('CONFIG').required().asJsonArray()
  logger.debug({ configurations }, 'Found configurations in environment')

  for (const parameters of configurations) {
    // Make CloudWatch:GetMetricStatistics API request.
    const metricStatistics = await getMetricStatistics(parameters)

    // Used for debugging.
    logger.debug({ metricStatistics }, 'Statistics from CloudWatch Metrics')

    // Format metric data to Humio event data
    const humioEvents = formatHumioEvents(metricStatistics, parameters)

    // Send Humio event data to Humio
    const response = await ingest(humioEvents, 'cloudwatch_metrics')
    logger.debug({ response: response.text() }, 'Got response from Humio.')
  }
}

async function getMetricStatistics (parameters: any): Promise<GetMetricStatisticsCommandOutput> {
  // Check whether start and end time has been set or defaults are to be used.
  if (!(START_TIME_KEY in parameters)) {
    const [value, unit] = env.get('RATE_EXPRESSION').default('15 minutes').asString().split(' ')
    parameters[START_TIME_KEY] = dayjs.utc().subtract(parseInt(value), parseRateUnit(unit))
  }

  if (!(END_TIME_KEY in parameters)) {
    parameters[END_TIME_KEY] = dayjs.utc()
  }

  // Used for debugging.
  logger.debug({ startTime: parameters[START_TIME_KEY], endTime: parameters[END_TIME_KEY] })

  // Make GetMetricStatistics API request.
  const client = new CloudWatchClient({})
  const command = new GetMetricStatisticsCommand(parameters)
  return await client.send(command)
}

export interface HumioMetricStatisticsEvents {
  timestamp: string
  attributes: {
    label?: string
    datapoint: {
      sampleCount?: number
      average?: number
      sum?: number
      minimum?: number
      maximum?: number
      unit?: string
      extendedStatistics?: Record<string, number>
      responseMetaData?: ResponseMetadata
    }
  }
}

/**
 * Create list of Humio events based on metrics.
 */
function formatHumioEvents (metrics: GetMetricStatisticsCommandOutput, parameters: any): HumioMetricStatisticsEvents[] {
  const humioEvents: HumioMetricStatisticsEvents[] = []

  // Used for debugging.
  logger.debug({ datapoints: metrics.Datapoints }, 'Datapoints')

  // Create one Humio event per datapoint/timestamp
  ;(metrics.Datapoints ?? []).forEach((datapoint) => {
    const timestamp = dayjs(datapoint.Timestamp).utc().toISOString()
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
    }
    humioEvents.push(event)
  })
  logger.debug({ events: humioEvents }, 'Formatted humio events')

  return humioEvents
}
