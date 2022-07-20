"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logGroupMatcher = exports.reportMatcher = exports.startMatcher = exports.endMatcher = exports.stdMatcher = void 0;
/**
 * Standard out from Lambdas.
 */
exports.stdMatcher = /\d\d\d\d-\d\d-\d\d\S+\s+(?<requestId>\S+)/;
/**
 * END RequestId: b3be449c-8bd7-11e7-bb30-4f271af95c46
 */
exports.endMatcher = /END RequestId:\s+(?<requestId>\S+)/;
/**
 * START RequestId: b3be449c-8bd7-11e7-bb30-4f271af95c46
 * Version: $LATEST
 */
exports.startMatcher = /END RequestId:\s+(?<requestId>\S+)/;
/**
 * REPORT RequestId: b3be449c-8bd7-11e7-bb30-4f271af95c46
 * Duration: 0.47 ms
 * Billed Duration: 100 ms
 * Memory Size: 128 MB
 * Max Memory Used: 20 MB
 */
exports.reportMatcher = /REPORT RequestId:\s+(?<requestId>\S+)\s+\nDuration: (?<duration>\S+) ms\s+\nBilled Duration: (?<billedDuration>\S+) ms\s+\nMemory Size: (?<memorySize>\S+) MB\s+\nMax Memory Used: (?<maxMemory>\S+) MB/;
/**
 * Parse out the service name and log group name.
 */
exports.logGroupMatcher = /^\/aws\/(?<awsServiceName>lambda|apigateway)\/(?<parsedLogGroupName>.*)/;
