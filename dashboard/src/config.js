
// Primitives

const createMongoClient = require('./mongo-client')
const createHomeApp = require('./app/home')

function createConfig ({ env }) {

  const db = createMongoClient({ 
    connectionString: env.databaseUrl
  })
  
  const homeApp = createHomeApp({ db }) 
  return {
    env,
    homeApp,
    db    
  }
}

module.exports = createConfig
