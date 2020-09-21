const camelCaseKeys = require('camelcase-keys') 
const express = require('express')


function createHandlers () { 
  function home (req, res, next) {
    
    req.app.locals.db.collection('articles').find({}).toArray()
    .then(response => res.status(200).json(response))
    .catch(error => console.error(error));

  }
  return {
    home
  }
}

function createHome () { 

  const handlers = createHandlers()

  const router = express.Router()

  router.route('/').get(handlers.home)
  
  return { handlers, router }
}

module.exports = createHome 
