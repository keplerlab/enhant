
// Primitives

const createEnhantApp = require('./app/enhant');

function loadApps ({ env }) {
  
  const enhantApp = createEnhantApp(env);


  return {
    env,
    enhantApp
  }
}

module.exports = loadApps;
