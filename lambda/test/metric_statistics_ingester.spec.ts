import { CloudWatchClient, GetMetricStatisticsCommand } from '@aws-sdk/client-cloudwatch'
import { mockClient } from 'aws-sdk-client-mock'
import fetch, { Response } from 'node-fetch'
import dayjs from 'dayjs'
import { handler } from '../src/metric_statistics_ingester'
import { Context } from 'aws-lambda'

// Mocking node fetch: https://stackoverflow.com/a/68379449/7542561
jest.mock('node-fetch', () => jest.fn())
const mockFetch = fetch as jest.MockedFunction<typeof fetch>

// Mocking aws sdk clients: https://aws.amazon.com/blogs/developer/mocking-modular-aws-sdk-for-javascript-v3-in-unit-tests/
const cloudwatchMock = mockClient(CloudWatchClient)

beforeAll(() => {
  process.env.CONF_NAME = '../../examples/static/conf_metric_statistics_ingester.json'
})

beforeEach(() => {
  cloudwatchMock.reset()
})

test('Ingests the metric statistics', async () => {
  // Mock response for fetch
  const response = { text: async () => await Promise.resolve('OK') } as const as Response
  mockFetch.mockResolvedValue(response)

  // Mock CloudWatch::GetMetricDataCommand
  cloudwatchMock.on(GetMetricStatisticsCommand).resolves({
    Label: '',
    Datapoints: [
      {
        Timestamp: dayjs().toDate(),
        SampleCount: Infinity,
        Average: Infinity,
        Sum: Infinity,
        Minimum: Infinity,
        Maximum: Infinity,
        Unit: 'Count',
        ExtendedStatistics: {
          foo: Infinity
        }
      }
    ]
  })

  await handler({}, {} as const as Context)

  // Should get metric statistics from cloudwatch for each configuration
  expect(cloudwatchMock).toHaveReceivedCommandTimes(GetMetricStatisticsCommand, 2)

  // Should ingest humio events for each configuration
  expect(mockFetch).toHaveBeenCalledTimes(2)
})
