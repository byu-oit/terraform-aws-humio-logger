import Logger from '@byu-oit/logger'
import { logLevel } from './env'

export const logger = Logger({ level: logLevel })
