const Bluebird = require('bluebird')
const { fromCallback } = require('bluebird')
const MongoClient = require('mongodb').MongoClient

function createMongoClient({ connectionString, dbName }) {

  //Initialize connection once
  MongoClient.connect(connectionString,
   { useNewUrlParser: true,useUnifiedTopology: true }, function (err, client) {
    if (err) throw err;

    return client.db(dbName);
  });
}

module.exports = createMongoClient