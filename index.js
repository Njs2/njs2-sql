const { doExecute } = require("./interface/doExecute");
const { doExecuteRawQuery } = require("./interface/doExecuteRawQuery");
const { find } = require("./interface/find");
const { findOne } = require("./interface/findOne");
const { insert } = require("./interface/insert");
const { update } = require("./interface/update");
const transaction = new(require("./interface/transaction"));

class SQLManager {
  /**
   * Database Insert
   * @function insert
   * @param {string} tableName
   * @param {Object} query
   * @returns {Promise<Number>} Number of rows inserted
   */
  static insert = insert;

  /**
   * Database find
   * @function find
   * @param {string} tableName
   * @param {Object} query
   * @param {Object} order
   * @returns {Promise<Object>}
   */
  static find = find;

  /**
   * Database find one record
   * @function findOne
   * @param {string} tableName
   * @param {Object} query
   * @param {Object} order
   * @returns {Promise<Object>}
   */
  static findOne = findOne;

  /**
   * Database Update
   * @function update
   * @param {string} tableName
   * @param {Object} query
   * @param {Object} updates
   * @returns {Promise<Number>} Number of rows affected
   */
  static update = update;
  static doExecute = doExecute;
  static doExecuteRawQuery = doExecuteRawQuery;
  static transaction = transaction;
  static verifyTbl = require("./helper/dbManager").dbManager.verifyTbl;
}

module.exports = SQLManager;