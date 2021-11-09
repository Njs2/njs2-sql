let conn = null;
// Connecting to DB
const getConnection = async () => {
  if (!conn) {
    const Sequelize = require("sequelize");
    const { SQL_DB_HOST, SQL_DB_NAME, SQL_DB_USER, SQL_DB_PORT, SQL_DB_PASSWORD, DATABASE_TYPE } = JSON.parse(process.env.SQL);
    conn = new Sequelize({
      database: SQL_DB_NAME,
      host: SQL_DB_HOST,
      username: SQL_DB_USER,
      port: SQL_DB_PORT,
      password: SQL_DB_PASSWORD,
      dialect: DATABASE_TYPE,
      dialectOptions: {
        multipleStatements: true
      },
      pool: {
        max: 1,
        min: 0,
        idle: 20000,
        acquire: 20000
      },
      logging: false, // To avoid sql query logs
    });
  }

  return conn;
};

module.exports.getConnection = getConnection;