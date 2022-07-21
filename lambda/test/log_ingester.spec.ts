import { CloudWatchLogsEvent } from 'aws-lambda'
import { CloudWatchLogsDecodedData } from 'aws-lambda/trigger/cloudwatch-logs'
import dayjs from 'dayjs'
import fetch, { Response } from 'node-fetch'
import { gzipSync } from 'zlib'
import { handler } from '../src/log_ingester'

// Mocking node fetch: https://stackoverflow.com/a/68379449/7542561
jest.mock('node-fetch', () => jest.fn())
const mockFetch = fetch as jest.MockedFunction<typeof fetch>

test('Verify Lambda Handler Flow', async () => {
  // Mock response for fetch
  const response = { text: async () => await Promise.resolve('OK') } as const as Response
  mockFetch.mockResolvedValue(response)

  // Mock log event for lambda handler
  const message = {
    level: 'info',
    time: 1658424388728,
    reqId: 'Root=1-62d98c44-6fca8c454be12f40417745bb',
    res: {
      statusCode: 201
    },
    responseTime: 15.373342990875244,
    message: 'request completed'
  }

  const timestamp = dayjs('2022-07-21T11:26:28.729-06:00', 'YYYY-MM-DDThh:mm:ss.SSSZ').unix()
  const decoded: CloudWatchLogsDecodedData = {
    logEvents: [
      {
        id: '31953106606966983378809025079804211143289615424298221568',
        timestamp,
        message: JSON.stringify(message)
      }
    ],
    logGroup: '/project/prd/api',
    logStream: 'project-api-prd/project-prd/f082aeb2dcb145379acbcfc5ea17e591',
    messageType: '',
    owner: '',
    subscriptionFilters: []
  }

  /**
   * "The value of the data field is a Base64-encoded .gzip file archive."
   * Docs: https://docs.aws.amazon.com/lambda/latest/dg/services-cloudwatchlogs.html
   */
  const event: CloudWatchLogsEvent = {
    awslogs: {
      data: gzipSync(Buffer.from(JSON.stringify(decoded))).toString('base64')
    }
  }

  // Run lambda handler
  await handler(event)

  // Should only call fetch once
  expect(mockFetch).toHaveBeenCalledTimes(1)

  // Fetch request body should match
  expect(mockFetch.mock.calls?.[0]?.[1]?.body?.[0]).toEqual({
    tags: {
      host: 'cloudwatch_logs'
    },
    events: [
      {
        timestamp,
        rawstring: JSON.stringify(message),
        kvparse: true,
        attributes: {
          owner: decoded.owner,
          logGroup: decoded.logGroup,
          logStream: decoded.logStream,
          messageType: decoded.messageType,
          subscriptionFilters: decoded.subscriptionFilters
        }
      }
    ]
  })
})
