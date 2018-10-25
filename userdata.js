// Module, that others which need access to user data can require

const discord  = require("discord.js"         ); // framework for discord api
const db = require("./database/database.js");

exports.database = new db.Database("users", 600000);
exports.client = new discord.Client();