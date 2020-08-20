
// Primitives

const createMongoClient = require('./mongo-client')
const createHomeApp = require('./app/home')
const createQueryApp = require('./app/query')

function createConfig ({ env }) {

  const db = createMongoClient({ 
    connectionString: env.databaseUrl
  })
  
  const homeApp = createHomeApp({ db }) 
  
  const queryApp = createQueryApp({ db }) 


  return {
    env,
    homeApp,
    queryApp,
    db    
  }
}

module.exports = createConfig
