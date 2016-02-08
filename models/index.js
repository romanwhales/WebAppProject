
var postgresAdapter = require('sails-postgresql');
var Waterline = require('waterline');
var fs = require('fs');
var path = require("path");


var orm = new Waterline();

var dbPassword = null;
if (process.env.NODE_ENV == "production") dbPassword = 'truppr-admin';

// fetch the current system's database password.
var password = fs.readFileSync('models/db.config');

if (password == null || password == undefined) {
  throw new Error("Invalid db.config file. Please create one in models/");
}

var config = {
  adapters: {
    postgresql: postgresAdapter
  },

  connections: {
    myPostgres: {
      adapter: 'postgresql',
      host: 'localhost',
      user: 'postgres',
      password: new String(password).trim(),
      database: 'authentication'
    }
  }
};

fs
    .readdirSync(__dirname)
    .filter(function(file) {
      return (file.indexOf(".") !== 0) && (file !== "index.js" && file !== 'db.config');
    })
    .forEach(function(file) {
      var model = require(path.join(__dirname, file));
      orm.loadCollection(model);
    });

module.exports = {waterline: orm, config: config};