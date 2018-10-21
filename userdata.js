// Module, that others which need access to user data can require
const db = require("./database/database.js");
var database = new db.Database("users", 600000);

module.exports = {database};