const { Client } = require("pg");

const client = new Client({
  host: "host_url",
  database: "dt",
  user: "dt",
  password: "password",
  port: "5432",
});

exports.handler = async (event) => {
  // TODO implement
  console.log(event)
  console.log('11111111')
  const response = {
      statusCode: 200,
      body: JSON.stringify('Hello from Lambda!'),
  };
  return response;
};
