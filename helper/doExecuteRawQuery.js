const { getSQLConnection } = require('./dbConnect');
const { QueryTypes } = require('sequelize');

module.exports.doExecuteRawQuery = async (sqlQuery, replacements) => {
  const conn = await getSQLConnection();
  const res = await conn.query(sqlQuery, {
    replacements: replacements, type: QueryTypes.RAW, raw: true, nest: true
  });
  return res;
};