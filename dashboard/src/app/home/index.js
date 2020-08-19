const camelCaseKeys = require('camelcase-keys') 
const express = require('express')

function createHandlers () { 
  function home (req, res, next) {

    res.send("calling from home")
  }
  return {
    home
  }
}

function createHome ({ db }) { 

  const handlers = createHandlers()

  const router = express.Router()

  router.route('/').get(handlers.home)
  
  return { handlers, router }
}

module.exports = createHome 
