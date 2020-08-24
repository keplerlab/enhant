
// Primitives

const createHomeApp = require('./app/home')
const createQueryApp = require('./app/query')

function createConfig ({ env }) {
  
  const homeApp = createHomeApp() 
  
  const queryApp = createQueryApp() 


  return {
    env,
    homeApp,
    queryApp
  }
}

module.exports = createConfig
