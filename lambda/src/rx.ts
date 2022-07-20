/**
 * Standard out from Lambdas.
 */
export const stdMatcher = /\d\d\d\d-\d\d-\d\d\S+\s+(?<requestId>\S+)/

/**
 * END RequestId: b3be449c-8bd7-11e7-bb30-4f271af95c46
 */
export const endMatcher = /END RequestId:\s+(?<requestId>\S+)/

/**
 * START RequestId: b3be449c-8bd7-11e7-bb30-4f271af95c46
 * Version: $LATEST
 */
export const startMatcher = /END RequestId:\s+(?<requestId>\S+)/

/**
 * REPORT RequestId: b3be449c-8bd7-11e7-bb30-4f271af95c46
 * Duration: 0.47 ms
 * Billed Duration: 100 ms
 * Memory Size: 128 MB
 * Max Memory Used: 20 MB
 */
export const reportMatcher = /REPORT RequestId:\s+(?<requestId>\S+)\s+\nDuration: (?<duration>\S+) ms\s+\nBilled Duration: (?<billedDuration>\S+) ms\s+\nMemory Size: (?<memorySize>\S+) MB\s+\nMax Memory Used: (?<maxMemory>\S+) MB/

/**
 * Parse out the service name and log group name.
 */
export const logGroupMatcher = /^\/aws\/(?<awsServiceName>lambda|apigateway)\/(?<parsedLogGroupName>.*)/
