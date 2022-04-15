const AWS = require("aws-sdk");
const { Client } = require("pg");

const sm  = new AWS.SecretsManager({ region: process.env.REGION});

const getSecret = async (SecretId) => {
  return await new Promise((resolve, reject) => {
    sm.getSecretValue({SecretId}, (err, result) => {
      if(err) return reject(err);
      else resolve(result);
    });
    
  });
};

const handleAddress = (address) => {
  let addressData = {
    dt_address_street: address.Street,
    dt_address_state: address.State,
    dt_address_city: address.City,
    dt_address_postal_code: address.PostalCode,
    dt_address_country: address.Country
  };
  
  let parsedAddress = JSON.parse(JSON.stringify(addressData));

  return parsedAddress;
};

exports.handler = async (event, context, callback) => {
  const secretKey = await getSecret(process.env.SECRET_ID);
  const { SecretString } = secretKey;
  const parsedSecretString =  JSON.parse(SecretString);
  
  const client = new Client({
    host: parsedSecretString.host,
    database: parsedSecretString.database,
    user: parsedSecretString.username,
    password: parsedSecretString.password,
    port: parsedSecretString.port,
  });
  

  let databaseConnection = client.connect();

  context.callbackWaitsForEmptyEventLoop = false;
  
  const { detail } = event;
  const {ChangeEventHeader, ...eventDetail} = detail;
  
  console.log(detail);
  
  const billingAddress= eventDetail.BillingAddress && handleAddress(eventDetail.BillingAddress);

  const eventData = Object.assign({}, eventDetail, billingAddress);
  delete eventData.BillingAddress;
  
  if(ChangeEventHeader.changeType === "CREATE" || ChangeEventHeader.changeType === "UNDELETE") {
    eventData['dt_uuid'] = ChangeEventHeader.recordIds[0];
  }
  

  let columnData = [];
  let rowData = [];
  let updateRowData = [];


  Object.keys(eventData).forEach(function (key) {
    columnData.push(key);
    rowData.push(`'${eventData[key]}'`);
    updateRowData.push(key + ` = '${eventData[key]}'`);
  });
  
  switch(ChangeEventHeader.changeType) {
    case "CREATE":
      const createQuery = `INSERT INTO dt_account (${columnData.join(", ")}) VALUES (${rowData.join(", ")})`;
      await client.query(createQuery);
      callback(null, 'SuccessFully Inserted');
      break;
    case "UPDATE":
      const updateQuery = `UPDATE dt_account SET ${updateRowData.join(", ")} WHERE dt_uuid = '${ChangeEventHeader.recordIds[0]}'`;
      await client.query(updateQuery);
      callback(null, 'SuccessFully Updated');
      break;
    case "DELETE":
      const deleteQuery = `DELETE FROM dt_account WHERE dt_uuid = '${ChangeEventHeader.recordIds[0]}';`;
      await client.query(deleteQuery);
      console.log("SuccessFully Deleted");
      callback(null, 'SuccessFully Deleted');
      break;
    case "UNDELETE":
      const undeleteQuery = `INSERT INTO dt_account (${columnData.join(", ")}) VALUES (${rowData.join(", ")})`;
      await client.query(undeleteQuery);
      console.log("SuccessFully Restored");
      callback(null, 'SuccessFully Restored');
      break;
    default:
      callback("Unknown field, unable to resolve", null);
      break;
    }
};