const { doExecute } = require("./helper/doExecute");
const { doExecuteRawQuery } = require("./helper/doExecuteRawQuery");
const { find } = require("./helper/find");
const { findOne } = require("./helper/findOne");
const { insert } = require("./helper/insert");
const { update } = require("./helper/update");

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
}

module.exports = SQLManager;