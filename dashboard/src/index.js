
const createExpressApp = require('./app/express')
const loadApps = require('./load_apps')
const env = require('./env')

const config = loadApps({ env }) 
const app = createExpressApp({ config, env })

function start () { 
  app.listen(env.port, signalAppStart)
}

function signalAppStart () {
  console.log(`${env.appName} started`)
  console.table([['Port', env.port], ['Environment', env.env]])
}

module.exports = {
  app,
  config,
  start
}
