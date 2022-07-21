import { Context } from 'aws-lambda'
import env from 'env-var'
import fs from 'fs'
import path from 'path'
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

dayjs.extend(utc)

const START_TIME_KEY = 'StartTime'
const END_TIME_KEY = 'EndTime'

/**
 * Ingest CloudWatch Metric statistics to Humio repository.
 */
export async function handler (event: any, context: Context): Promise<void> {
  // Load user defined configurations for the API request.
  const filename = env.get('CONF_NAME').default('conf_metric_statistics_ingester.json').asString()
  const contents = fs.readFileSync(path.join(__dirname, filename)).toString('utf-8')
  const configurations = JSON.parse(contents)

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
    parameters[START_TIME_KEY] = dayjs.utc().subtract(15, 'minutes').toISOString()
  }

  if (!(END_TIME_KEY in parameters)) {
    parameters[END_TIME_KEY] = dayjs.utc().toISOString()
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

  return humioEvents
}
