const { getConnection } = require('../helper/dbConnect');
const { DATABASE_TYPE } = JSON.parse(process.env.SQL);

module.exports.doExecute = async (sqlObj, replacements) => {
  const conn = await getConnection();
  const res = await conn.query(sqlObj[DATABASE_TYPE], {
    replacements: replacements, raw: true, nest: true
  });
  return res;
};