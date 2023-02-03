import { type CloudWatchLogsEvent } from 'aws-lambda'
import pick from 'lodash.pick'
import { decode, ingest, parseMessage } from './events'
import { logger } from './logger'
import { logGroupMatcher } from './rx'

/**
 * Extract log data from CloudWatch Logs events and
 * pass the data onto the Humio ingester.
 */
export async function handler (event: CloudWatchLogsEvent): Promise<void> {
  const decodedEvent = decode(event)

  logger.debug({ event: decodedEvent }, 'Event from CloudWatch Logs')

  // Extract the general attributes from the event batch
  const batchAttrs = {
    ...pick(decodedEvent, 'owner', 'logGroup', 'logStream', 'messageType', 'subscriptionFilters'),
    ...logGroupMatcher.exec(decodedEvent.logGroup)
  }

  // Flatten the events from CloudWatch Logs
  const humioEvents = []
  for (const logEvent of decodedEvent.logEvents) {
    const { timestamp, message } = logEvent
    const attributes = {
      ...batchAttrs,
      ...parseMessage(message)
    }
    humioEvents.push({
      timestamp,
      rawstring: message,
      kvparse: true,
      attributes
    })
  }

  const response = await ingest(humioEvents, 'cloudwatch_logs')
  logger.debug({ response: response.text() }, 'Got response from humio')
}
