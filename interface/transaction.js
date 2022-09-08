const { getConnection } = require("../helper/dbConnect");
const { QueryTypes } = require("sequelize");

var conn;
var transactionInstance;

class transaction {
  async start() {
    try {
      conn = await getConnection();
      transactionInstance = await conn.transaction();
    } catch (e) {
      return false;
    }
  }
  async doExecute(query, replacements) {
    try {
      return await conn.query(query, {
        replacements: replacements,
        type: QueryTypes.RAW,
        raw: true,
        nest: true,
        transaction: transactionInstance,
      });
    } catch (e) {
      return false;
    }
  }
  async commit() {
    try {
      await transactionInstance.commit();
      return true;
    } catch (e) {
      return false;
    }
  }
  async rollBack() {
    try {
      await transactionInstance.rollback();
      return true;
    } catch (e) {
      return false;
    }
  }
}

module.exports = transaction;
