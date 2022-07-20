import env from 'env-var'

const host = env.get('HUMIO_HOST').default('https://cloud.humio.com').asString()
const endpoint = env.get('HUMIO_ENDPOINT').default('/api/v1/ingest/humio-structured').asString()
const protocol = env.get('HUMIO_PROTOCOL').default('HTTPS').asEnum(['HTTPS', 'HTTP']).toLowerCase()

export const url = new URL(endpoint, `${protocol}://${host}`).toString()

export const token = env.get('HUMIO_INGEST_TOKEN').default('').asString()

export const logLevel = env.get('LOG_LEVEL').default('info').asString().toLowerCase()
