var dbSeq = require('../config/sequelize')
var defineErpHrModel = require('./erpHrBase')

module.exports = defineErpHrModel(dbSeq, 'erp_work_schedule')
