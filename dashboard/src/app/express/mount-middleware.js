
const express = require('express')
const { join } = require('path')
const bodyParser = require('body-parser');

const lastResortErrorHandler = require('./last-resort-error-handler')
const primeRequestContext = require('./prime-request-context')
const attachLocals = require('./attach-locals') 

/**
 * @description Mounts all the application-level middleware on our Express
 * application
 * @param {obect} app Express application
 */
function mountMiddleware (app, env) { 
  app.use(lastResortErrorHandler)
  app.use(primeRequestContext)
  app.use(attachLocals)
  app.use(bodyParser.urlencoded({extended:true})); 
  app.use(
    express.static(join(__dirname, '..', 'public'), { maxAge: 86400000 }))
}

module.exports = mountMiddleware
