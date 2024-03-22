const { getConnection } = require('../helper/dbConnect');
const { DATABASE_TYPE } = require(process.env.SQL);

/**
 * Database Query for bulk insert data
 * @function bulkInsert
 * @param {string} tableName - Name of the table
 * @param {Object[]} query - Key will be column and value for that column [{columnName: value}]
 * @param {number} [limit=10] - Query is sliced into that many times and executed parallel
 * @returns Promise
 */
module.exports.bulkInsert = async function (tableName, query, limit = 10) {
  try {
    // Database connection for execute the query.
    const conn = await getConnection();

    // Executing the inset query in parts using promise.
    const queryResult = [];

    // 1st Object values will be considered for the columns.
    const columnNames = Object.keys(query[0]);

    // Columns should contain at-least one Key value pair
    if (columnNames.length <= 0) {
      throw Error('MISSING_COLUMNS');
    }

    // Insert Query generation.
    let sql = `INSERT INTO  ${{ "postgres": '"public".', "mysql": '' }[DATABASE_TYPE]}"${tableName}" (`;
    sql += columnNames.join(',');
    sql += ') VALUES'

    if (DATABASE_TYPE == "postgres") sql = sql.replace(/'/g, '"');
    else if (DATABASE_TYPE == "mysql") sql = sql.replace(/"/g, "");


    let currQuery = 0;
    while (currQuery <= query.length) {

      const replacements = [];
      const currQueryObj = query.slice(currQuery, currQuery + limit);
      currQuery += limit;

      let queryString = '';
      for (let queryIndex in currQueryObj) {
        queryString += '(';
        const queryData = currQueryObj[queryIndex];

        for (const column of columnNames) {

          // CHECK IF COLUMN VALUE EXITS  
          if (!(column in queryData)) {
            throw Error(`MISSING_COLUMN '${column}'`)
          }

          queryString += '?';
          if (typeof queryData[column] === 'object') replacements.push(JSON.stringify(queryData[column]))
          else replacements.push(queryData[column]);

          queryString += column === columnNames[columnNames.length - 1] ? ')' : ','
        }

        queryString += currQueryObj.length - 1 == queryIndex ? '' : ',';
      }
      queryResult.push(
        conn.query(`${sql}${queryString}`, {
          replacements,
          raw: false
        })
      );
    }

  } catch (e) {
    console.log("SQL Error", e);
    throw e;
  }
};
