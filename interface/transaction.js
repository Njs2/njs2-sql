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

  async transactionContextCodeBlock(callback) {
    try {
      conn = await getConnection();
      await conn.transaction(async (_) => {
          // all your code will be executed within the DB transaction
          // commit and rollback will be "managed" by sequelize!
          await callback()
      })
    } catch (error) {
      throw error
    }
  }

}

module.exports = transaction;
