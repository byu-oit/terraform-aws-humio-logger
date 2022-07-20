import { CloudWatchLogsEvent } from 'aws-lambda'
import fetch, { Response } from 'node-fetch'
import { gunzipSync } from 'zlib'
import { url, token } from './env'
import { logger } from './logger'
import { endMatcher, reportMatcher, startMatcher, stdMatcher } from './rx'
import { CloudWatchLogsDecodedData } from 'aws-lambda/trigger/cloudwatch-logs'

const headers = {
  'Content-Type': 'application/json',
  Authorization: `Bearer ${token}`
}

/**
 * Wrap and send CloudWatch Logs/Metrics to Humio repository.
 */
export async function ingest (humioEvents: unknown[], hostType: string): Promise<Response> {
  const data = [{ tags: { host: hostType }, events: humioEvents }]
  const method = 'POST'
  logger.debug({ url, method, headers, data }, 'Ingest request to Humio')
  return await fetch(url, { method, headers, body: JSON.stringify(data) })
}

/**
 * Unzip and decode given event.
 */
export function decode (event: CloudWatchLogsEvent): CloudWatchLogsDecodedData {
  const decodedJsonEvent = gunzipSync(Buffer.from(event.awslogs.data, 'base64'))
  return JSON.parse(decodedJsonEvent.toString())
}

/**
 * Simple CloudWatch Logs parser.
 */
export function parseMessage (message: string): Record<string, unknown> {
  let rx
  if (message.startsWith('END')) {
    rx = endMatcher
  } else if (message.startsWith('START')) {
    rx = startMatcher
  } else if (message.startsWith('REPORT')) {
    rx = reportMatcher
  } else {
    rx = stdMatcher
  }
  const matches = rx.exec(message)
  return matches?.groups ?? {}
}
