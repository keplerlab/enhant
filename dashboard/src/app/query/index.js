const camelCaseKeys = require('camelcase-keys') 
const express = require('express')

function createHandlers () { 
  function query (req, res, next) {

    res.send("calling from query")
  }
  return {
    query
  }
}

function createQuery () { 

  const handlers = createHandlers()

  const router = express.Router()

  router.route('/').get(handlers.query)
  
  return { handlers, router }
}

module.exports = createQuery 
