const fs = require('fs');
const config = require("./database_config.json");

// Create a new, or open an exisitng databse
function Database(databaseName, saveinterval)
{
	this.data = {};
	this.name = databaseName;
	this.interval = saveinterval || -1;
	this.file;
	this.timeout;
	this.path = `${config.data_folder}/${this.name}${config.file_suffix}`;

	console.log(` - Opening database '${this.name}' at "${this.path}"`);

	// Open or create file
	let files = fs.readdirSync(config.data_folder);
	this.file = files.find(f => f === `${this.name}${config.file_suffix}`);

	if (this.file != undefined)
	{
		// read database file
		let content = fs.readFileSync(`${config.data_folder}/${this.file}`);
		this.data = JSON.parse(content);
	}
	else
	{
		// create database file
		this.file = `${this.name}${config.file_suffix}`;
		this.save();
	}

	if (this.interval != -1) {
		this.setSaveInterval(this.interval);
		}
}

// Intervall in milliseconds in which the database is written to the filesystem
Database.prototype.setSaveInterval = function(interval)
{
	if (this.timeout == undefined){
		clearInterval(this.timeout);
	}

	if (interval == -1) {
		console.log(` - Turned off autosave for database '${this.name}'`);
	}

	this.timeout = setInterval(() => this.save(), interval);
	console.log(` - Set autosave interval for database '${this.name}' to ${interval}ms`);
};

Database.prototype.save = function()
{
	fs.writeFileSync(`${config.data_folder}/${this.file}`, JSON.stringify(this.data));
};

Database.prototype.read = function(primaryKey, key)
{
	if (!this.data[primaryKey]) {
		this.data[primaryKey] = {};
	}

	return this.data[primaryKey][key];
};

Database.prototype.write = function(primaryKey, key, value)
{
	if (!this.data[primaryKey]) {
		this.data[primaryKey] = {};
	}

	this.data[primaryKey][key] = value;
};

// Returns an array of Objects with primaryKey and key Elements
Database.prototype.getDataAsArray = function(key)
{
	return Object.keys(this.data).map((k) => {
		return {primaryKey: k, key: this.data[k][key]};
	});
};

module.exports = { Database };