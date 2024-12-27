/** Database setup for BizTime. */

// filepath: db.js
const { Client } = require("pg");

const client = new Client({
	connectionString: "postgresql://localhost/biztime",
});

client.connect();

module.exports = client;
