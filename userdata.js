// Module, that others which need access to user data can require
const db = require("./database/database.js");
//var database = new db.Database("users", 600000);
var database = new db.Database("users", 15000); // reduced write rate for testing

module.exports = {database};