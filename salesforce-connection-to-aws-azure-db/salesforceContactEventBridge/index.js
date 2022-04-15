const { Client } = require("pg");

const client = new Client({
  host: "dtdashboard8-doubletime-cluster.cluster-cvvzf3ch5kgs.us-east-1.rds.amazonaws.com",
  database: "doubletime",
  user: "doubletime",
  password: "e7C^)h&(1IUOF$<Mx`Tb^zYa4mX#<T",
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
