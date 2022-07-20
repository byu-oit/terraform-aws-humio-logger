"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
const logger_1 = __importDefault(require("@byu-oit/logger"));
const env_1 = require("./env");
exports.logger = (0, logger_1.default)({ level: env_1.logLevel });
