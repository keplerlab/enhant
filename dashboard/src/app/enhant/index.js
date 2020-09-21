const express = require('express');
const path = require("path");

function createHandlers () { 
    function home (req, res, next) {
      
      res.sendFile(path.join(__dirname, "index.html"));
  
    }
    return {
      home
    }
  }

function createEnhant (env) { 

    const handlers = createHandlers();
  
    const router = express.Router()
  
    router.route('/').get(handlers.home)
    
    return { handlers, router }
  }
  
  module.exports = createEnhant 
