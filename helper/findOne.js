const { getSQLConnection } = require('./dbConnect');
const { DATABASE_TYPE } = JSON.parse(process.env.SQL);

module.exports.findOne = async (tableName, query, order = {}, attributes = []) => {
  const conn = await getSQLConnection();
  let sql = `SELECT ${attributes.length ? attributes.join(',') : '*'} FROM ${{ "postgres": '"public".', "mysql": '' }[DATABASE_TYPE]}"${tableName}" `;
  let keys = Object.keys(query);
  let replacements = [];
  if(keys.length) {
    sql += ` WHERE `;
  }

  for (let i = 0; i < keys.length; i++) {
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

        case '$in':
          eq = 'IN';
          value = `(${value[fieldVal].join(',')})`;
          break;
      }

      if (typeof value == 'object')
        value = JSON.stringify(value);
    }

    sql += ` "${key}" ${eq} ? ${i != keys.length - 1 ? ' AND ' : ''}`;
    replacements.push(value);
  }

  keys = Object.keys(order);
  for (let i = 0; i < keys.length; i++) {
    if (i == 0) sql += " ORDER BY ";
    let key = keys[i];
    let value = order[key];

    sql += ` "${key}" ${value == 1 ? ' ASC ' : ' DESC '} ${i != keys.length - 1 ? ', ' : ''}`;
  }

  sql += ` LIMIT 1`;
  // Remove double qoutes from mysql query and replace single qoutes to double
  if (DATABASE_TYPE == "postgres")
    sql = sql.replace(/'/g, '"');
  else if (DATABASE_TYPE == "mysql")
    sql = sql.replace(/"/g, '');

  const res = await conn.query(sql, {
    replacements: replacements, raw: true, nest: true
  });
  return res;
};