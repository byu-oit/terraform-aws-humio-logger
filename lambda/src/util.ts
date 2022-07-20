// Rate Expression Utilities
// Docs: https://docs.aws.amazon.com/AmazonCloudWatch/latest/events/ScheduledEvents.html#RateExpressions
export type RateUnit = 'hour' | 'hours' | 'minute' | 'minutes' | 'day' | 'days'

export function isRateUnit (value: unknown): value is RateUnit {
  return typeof value === 'string' && [
    'hour',
    'hours',
    'minute',
    'minutes',
    'day',
    'days'
  ].includes(value)
}

export function parseRateUnit (value: unknown): RateUnit {
  if (!isRateUnit(value)) {
    throw TypeError('value is not a rate unit type')
  }
  return value
}
