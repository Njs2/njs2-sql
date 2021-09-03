const { getSQLConnection } = require('./dbConnect');
const { DATABASE_TYPE } = JSON.parse(process.env.SQL);

module.exports.update = async (tableName, query, updates) => {
  const conn = await getSQLConnection();
  let sql = `UPDATE ${{ "postgres": '"public".', "mysql": '' }[DATABASE_TYPE]}"${tableName}" SET `;
  let keys = Object.keys(updates);
  let replacements = [];

  for (let i = 0; i < keys.length; i++) {
    let key = keys[i];
    let value = updates[key];
    let eq = '=';

    if (typeof value == 'object') {
      const fieldVal = Object.keys(value)[0];
      switch (fieldVal) {
        case '$inc':
          eq = ` = "${key}" + `;
          value = value[fieldVal];
          break;

        case '$dec':
          eq = ` = "${key}" + `;
          value = value[fieldVal];
          break;
      }

      if (typeof value == 'object')
        value = JSON.stringify(value);
    }

    sql += ` "${key}" ${eq} ? ${i != keys.length - 1 ? ', ' : ''}`;
    replacements.push(value);
  }

  keys = Object.keys(query);
  for (let i = 0; i < keys.length; i++) {
    if (i == 0) sql += " WHERE ";

    let key = keys[i];
    let value = query[key];
    let eq = '=';

    if (typeof value == 'object') {
      const fieldVal = Object.keys(value)[0];
      switch (fieldVal) {
        case '$lt':
          eq = '<';
          value = value[fieldVal];
          break;

        case '$lte':
          eq = '<=';
          value = value[fieldVal];
          break;

        case '$gt':
          eq = '>';
          value = value[fieldVal];
          break;

        case '$gte':
          eq = '>=';
          value = value[fieldVal];
          break;
      }

      if (typeof value == 'object')
        value = JSON.stringify(value);
    }

    sql += ` "${key}" ${eq} ? ${i != keys.length - 1 ? ' AND ' : ''}`;
    replacements.push(value);
  }

  // Remove double qoutes from mysql query and replace single qoutes to double
  if (DATABASE_TYPE == "postgres") {
    // sql += ' RETURNING * ';
    sql = sql.replace(/'/g, '"');
  } else if (DATABASE_TYPE == "mysql")
    sql = sql.replace(/"/g, '');

  let res = await conn.query(sql, {
    replacements: replacements, raw: true
  });

  // console.log(res);
  return { "postgres": res[1].rowCount, "mysql": res[1].affectedRows }[DATABASE_TYPE];
};