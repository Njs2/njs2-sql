
const { getConnection } = require('../helper/dbConnect');
const { DATABASE_TYPE } = JSON.parse(process.env.SQL);

module.exports.insert = async (tableName, query) => {
  const conn = await getConnection();
  let sql = `INSERT into ${{ "postgres": '"public".', "mysql": '' }[DATABASE_TYPE]}"${tableName}" (`;
  let keys = Object.keys(query);
  let replacements = [];

  // Add keys from json to SQL query
  for (let i = 0; i < keys.length; i++) {
    let key = keys[i]
    sql += `"${key}" ${i != keys.length - 1 ? ', ' : ''} `;
  }

  sql += ") VALUES (";

  // Add values from json to SQL query
  for (let i = 0; i < keys.length; i++) {
    let key = keys[i];
    let value = query[key];

    if (typeof value == 'object') {
      value = JSON.stringify(value);
    }
    sql += ` ? ${i != keys.length - 1 ? ', ' : ''} `;
    replacements.push(value);
  }

  sql += `)`;

  // Remove double qoutes from mysql query and replace single qoutes to double
  if (DATABASE_TYPE == "postgres") {
    sql += ' RETURNING * ';
    sql = sql.replace(/'/g, '"');
  } else if (DATABASE_TYPE == "mysql") {
    // sql += `; SELECT LAST_INSERT_ID();`
    sql = sql.replace(/"/g, '');
  }

  let res = await conn.query(sql, {
    replacements: replacements, raw: false
  });

  return { "postgres": res[0][0], "mysql": res[0] }[DATABASE_TYPE];
};