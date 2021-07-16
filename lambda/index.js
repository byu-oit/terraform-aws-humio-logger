const zlib = require('zlib')
const https = require('https')

function sendLogEventToHumio (logEvent) {
  const data = JSON.stringify([{
    tags: {
      SubIdxNM: process.env.SUB_IDX_NM
    },
    events: [
      {
        timestamp: logEvent.timestamp,
        timezone: 'America/Denver',
        attributes: JSON.parse(logEvent.message)
      }
    ]
  }])

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

exports.handler = async function (event) {
  console.debug('Event: ' + JSON.stringify(event, null, 2))

  const payload = new Buffer.from(event.awslogs.data, 'base64')
  zlib.gunzip(payload, function (e, decodedEvent) {
    console.debug('Decoded event: ' + decodedEvent)
    decodedEvent = JSON.parse(decodedEvent.toString('ascii'))
    const humioPromises = []
    for (const logEvent of decodedEvent.logEvents) {
      humioPromises.push(sendLogEventToHumio(logEvent))
    }

    return Promise.all(humioPromises)
  })
}