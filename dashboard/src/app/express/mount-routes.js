
/**
 * @description Mounts application routes into the Express application
 * @param {object} app Express app on which to mount the routes
 * @param {object} config A config object will all the parts of the system
 */
function mountRoutes (app, config) {
  app.use('/enhant', (config.enhantApp.router))  
}

module.exports = mountRoutes
