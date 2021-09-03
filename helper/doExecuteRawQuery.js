const { getSQLConnection } = require('./dbConnect');

module.exports.doExecuteRawQuery = async (sqlQuery, replacements) => {
  const conn = await getSQLConnection();
  const res = await conn.query(sqlQuery, {
    replacements: replacements, raw: true, nest: true
  });
  return res;
};