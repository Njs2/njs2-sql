const { doExecute } = require('../interface/doExecute');
const { find } = require('../interface/find');

let dbManager = {};

const DATABSE_QUERY = {
  "getTableSchema": {
    "mysql": "SELECT column_name as column_name, data_type as data_type FROM information_schema.COLUMNS WHERE TABLE_NAME = ? AND TABLE_SCHEMA = ? ;",
    "postgres": "SELECT column_name, data_type FROM information_schema.COLUMNS WHERE TABLE_NAME = ? AND TABLE_SCHEMA = 'public' AND TABLE_CATALOG = ? ;"
  },
}

const { DATABASE_TYPE, SQL_DB_NAME } = JSON.parse(process.env.SQL);

dbManager.verifyTbl = async (tableName, model) => {
  const schema = await doExecute(DATABSE_QUERY['getTableSchema'], [tableName, SQL_DB_NAME]);

  const dbSchema = {};
  let dbResult = [];
  schema.map(fields => dbSchema[fields.column_name] = fields.data_type);

  const DATA_TYPE = require("./dataType");
  if (model[DATABASE_TYPE]) {
    Object.keys(model[DATABASE_TYPE]).map(field => {
      let type = model[DATABASE_TYPE][field];
      if (type.indexOf("$") == 0) {
        type = DATA_TYPE[type.split('$').join('')] ? DATA_TYPE[type.split('$').join('')][DATABASE_TYPE] : type;
      }
      if (type != dbSchema[field]) {
        let result = `Database Schema Error of ${tableName} table : Invalid database field ${field}. ${dbSchema[field] ? `Expected type: ${type}, Current type: ${dbSchema[field]}` : `Missing field ${field} of type ${type}`}`;
        dbResult.push(result);
      }
    });
  } else {
    Object.keys(model['default']).map(field => {
      let type = model['default'][field];
      if (type.indexOf("$") == 0) {
        type = DATA_TYPE[type.split('$').join('')] ? DATA_TYPE[type.split('$').join('')][DATABASE_TYPE] : type;
      }
      if (type != dbSchema[field]) {
        let result = `Database Schema Error of ${tableName} table : Invalid database field ${field}. ${dbSchema[field] ? `Expected type: ${type}, Current type: ${dbSchema[field]}` : `Missing field ${field} of type ${type}`}`;
        dbResult.push(result);
      }
    });
  }

  return dbResult;
};

/**
 * 
 * AUTH_MODE = JWT/JWT_DB/JWT_DB_REFRESH
 * 
 * */
dbManager.verifyAccessToken = async (accessToken) => {
  const jwt = require("@njs2/base/helper/jwt");
  const { AUTH_MODE, JWT_SECRET, JWT_ID_KEY, DB_ID_KEY, DB_TABLE_NAME, DB_ACCESS_KEY } = JSON.parse(process.env.AUTH);
  const decodedVal = await jwt.decodeJwtToken(accessToken, JWT_SECRET);
  if (!decodedVal || !decodedVal[JWT_ID_KEY]) {
    return false;
  }

  if (AUTH_MODE == "JWT_DB") {
    const verifedUser = await find(DB_TABLE_NAME, { [DB_ACCESS_KEY]: accessToken, [DB_ID_KEY]: decodedVal[JWT_ID_KEY] });
    if (verifedUser.length > 0) {
      return verifedUser[0];
    };
  } else {
    return { [DB_ID_KEY]: decodedVal[JWT_ID_KEY] };
  }

  return false;
};

module.exports = { dbManager: dbManager };
