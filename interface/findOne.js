const { getConnection } = require("../helper/dbConnect");
const { DATABASE_TYPE } = JSON.parse(process.env.SQL);

module.exports.findOne = async (
  tableName,
  query,
  order = {},
  attributes = []
) => {
  const conn = await getConnection();
  let sql = `SELECT ${attributes.length ? attributes.join(",") : "*"} FROM ${
    { postgres: '"public".', mysql: "" }[DATABASE_TYPE]
  }"${tableName}" `;
  let keys = Object.keys(query);

  if (keys.length) {
    sql += ` WHERE `;
  }
  let replacements = [];
  let isIn = false;

  for (let i = 0; i < keys.length; i++) {
    let key = keys[i];
    let fixedvalue = (value = query[key]);
    let eq = "=";

    // if value is object , i.e {$in: [1,2,3],$gte:5} then we need to check if it is $in or $gte
    if (typeof value == "object") {
      //for each condition in value, ($in,$gte,$lte,$gt,$lt)
      Object.keys(fixedvalue).forEach((condition, k) => {
        switch (condition) {
          case "$lt":
            eq = "<";
            value = fixedvalue[condition];
            break;
          case "$lte":
            eq = "<=";
            value = fixedvalue[condition];
            break;

          case "$gt":
            eq = ">";
            value = fixedvalue[condition];
            break;

          case "$gte":
            eq = ">=";
            value = fixedvalue[condition];
            break;

          case "$in":
            eq = "IN";
            value = `(${fixedvalue[condition].map((d) => `'${d}'`).join(",")})`;
            sql += ` "${key}" ${eq} ${value} ${
              k != Object.keys(fixedvalue).length - 1 ? " AND " : ""
            }`; //if 'IN' case then instead of ?, add full array directly
            isIn = true;
            break;
        }

        //if not 'IN' case then add ?
        if (!isIn) {
          if (typeof value == "object") value = JSON.stringify(value);

          sql += ` "${key}" ${eq} ? ${
            k != Object.keys(fixedvalue).length - 1 ? " AND " : ""
          }`;
          replacements.push(value);
        }
        isIn = false;
      });
    } else {
      //if not object then it is direct value as a string. i.e user_id=1
      sql += ` "${key}" ${eq} ?`;
      replacements.push(value);
    }
    sql += ` ${i != keys.length - 1 ? " AND " : ""}`;
  }

  //set order by clause
  keys = Object.keys(order);
  for (let i = 0; i < keys.length; i++) {
    if (i == 0) sql += " ORDER BY ";
    let key = keys[i];
    let value = order[key];
    sql += ` "${key}" ${value == 1 ? " ASC " : " DESC "} ${
      i != keys.length - 1 ? ", " : ""
    }`;
  }
  // Remove double qoutes from mysql query and replace single qoutes to double
  if (DATABASE_TYPE == "postgres") sql = sql.replace(/'/g, '"');
  else if (DATABASE_TYPE == "mysql") sql = sql.replace(/"/g, "");

  const res = await conn.query(sql, {
    replacements: replacements,
    raw: true,
    nest: true,
  });
  return res[0];
};
