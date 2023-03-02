import { CloudWatchClient, GetMetricDataCommand, StatusCode } from '@aws-sdk/client-cloudwatch'
import { InvokeCommand, LambdaClient } from '@aws-sdk/client-lambda'
import { type Context } from 'aws-lambda'
import { mockClient } from 'aws-sdk-client-mock'
import 'aws-sdk-client-mock-jest'
import dayjs from 'dayjs'
import { readFileSync } from 'fs'
import fetch, { type Response } from 'node-fetch'
import { resolve } from 'path'
import { handler } from '../src/metric_ingester'

// Mocking node fetch: https://stackoverflow.com/a/68379449/7542561
jest.mock('node-fetch', () => jest.fn())
const mockFetch = fetch as jest.MockedFunction<typeof fetch>

// Mocking aws sdk clients: https://aws.amazon.com/blogs/developer/mocking-modular-aws-sdk-for-javascript-v3-in-unit-tests/
const cloudwatchMock = mockClient(CloudWatchClient)
const lambdaMock = mockClient(LambdaClient)

beforeAll(() => {
  process.env.CONFIG = readFileSync(resolve(__dirname, './static/conf_metric_ingester.json')).toString()
})

beforeEach(() => {
  cloudwatchMock.reset()
  lambdaMock.reset()
})

test('Recursively sends all the metrics', async () => {
  // Mock response for fetch
  const response = { text: async () => await Promise.resolve('OK') } as const as Response
  mockFetch.mockResolvedValue(response)

  // Mock CloudWatch::GetMetricDataCommand
  cloudwatchMock.on(GetMetricDataCommand).resolves({
    $metadata: {},
    MetricDataResults: [
      {
        Id: 'test_cloudwatch_metrics_lambda_invocations',
        Label: '',
        Timestamps: [
          dayjs().toDate()
        ],
        Values: [
          1
        ],
        StatusCode: StatusCode.COMPLETE,
        Messages: [
          { Value: 'foo' }
        ]
      }
    ],
    NextToken: 'fake_token',
    Messages: [
      { Value: 'foo' }
    ]
  })

  // Mock Lambda::InvokeCommand
  lambdaMock.on(InvokeCommand).resolves({})

  const context = { functionName: 'metric_ingester' } as const as Context
  const event = {
    NextToken: 'fake_token'
  }

  await handler(event, context)

  // Should get metrics from cloudwatch
  expect(cloudwatchMock).toHaveReceivedCommandTimes(GetMetricDataCommand, 1)

  // Should invoke next lambda when NextToken is passed back from cloudwatch command
  expect(lambdaMock).toHaveReceivedCommandTimes(InvokeCommand, 1)

  // Should ingest humio events
  expect(mockFetch).toHaveBeenCalledTimes(1)
})
