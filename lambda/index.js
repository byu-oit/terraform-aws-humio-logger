const zlib = require('zlib')
const https = require('https')

function sendLogEventsToHumio (logEvents) {
  const events = logEvents.map(event => {
    const attributes = JSON.parse(event.message) // Parsing so we don't stringify it twice.
    return {
      timestamp: event.timestamp,
      timezone: 'America/Denver',
      attributes: {
        ...attributes,
        SubIdxNM: process.env.SUB_IDX_NM
      }
    }
  })
  const data = JSON.stringify([{
    tags: {
      SubIdxNM: process.env.SUB_IDX_NM
    },
    events
  }])
  console.info('Sending data.', data)

  const options = {
    hostname: (process.env.ENV === 'prd') ? 'oit-humio.byu.edu' : 'oit-humio-dev.byu.edu',
    port: 443,
    path: '/api/v1/ingest/humio-structured',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': data.length,
      Authorization: 'Bearer ' + process.env.HUMIO_INGEST_TOKEN
    }
  }

  return new Promise((resolve, reject) => {
    const req = https.request(options, function (res) {
      if (res.statusCode >= 400) {
        reject(new Error(`[Humio API Error] ${res.statusCode} - ${res.statusMessage}`))
      } else {
        console.log('Send logs successful. Code: ', res.statusCode)
        resolve()
      }
    })

    req.on('error', (error) => {
      const errorMsg = `[HTTPS Error] ${error.name} - ${error.message}`
      console.error(errorMsg)
      reject(errorMsg)
    })

    req.write(data)
    req.end()
  })
}

exports.handler = function (event, context) {
  console.debug('Event: ' + JSON.stringify(event, null, 2))

  const payload = new Buffer.from(event.awslogs.data, 'base64')
  return zlib.gunzip(payload, function (e, decodedEvent) {
    if (e !== null) {
      console.error(e)
      context.fail(e)
    } else {
      console.debug('Decoded event: ' + decodedEvent)
      decodedEvent = JSON.parse(decodedEvent.toString('ascii'))
      sendLogEventsToHumio(decodedEvent.logEvents).catch(e => {
        console.error(e)
        context.fail(e)
      })
    }
  })
}
