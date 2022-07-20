"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logLevel = exports.token = exports.protocol = exports.url = exports.host = void 0;
const env_var_1 = __importDefault(require("env-var"));
exports.host = env_var_1.default.get('HUMIO_HOST').default('https://cloud.humio.com').asUrlObject();
exports.host.pathname = '/api/v1/ingest/humio-structured';
exports.url = exports.host.toString();
exports.protocol = env_var_1.default.get('HUMIO_PROTOCOL').default('HTTPS').asEnum(['HTTPS', 'HTTP']);
exports.token = env_var_1.default.get('HUMIO_INGEST_TOKEN').default('').asString();
exports.logLevel = env_var_1.default.get('LOG_LEVEL').default('info').asString().toLowerCase();
