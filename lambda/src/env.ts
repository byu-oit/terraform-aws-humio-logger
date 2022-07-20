import env from 'env-var'

export const host = env.get('HUMIO_HOST').default('https://cloud.humio.com').asUrlObject()
host.pathname = '/api/v1/ingest/humio-structured'

export const url = host.toString()

export const protocol = env.get('HUMIO_PROTOCOL').default('HTTPS').asEnum(['HTTPS', 'HTTP'])

export const token = env.get('HUMIO_INGEST_TOKEN').default('').asString()

export const logLevel = env.get('LOG_LEVEL').default('info').asString().toLowerCase()
