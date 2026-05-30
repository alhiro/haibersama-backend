var Sequelize = require('sequelize')
var HaiUser = require('./haiuser')

const defineErpHrModel = (dbSeq, tableName) => {
  const Model = dbSeq.define(tableName, {
    id: { type: Sequelize.INTEGER, allowNull: false, primaryKey: true, autoIncrement: true },
    partner_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'hai_user', key: 'id' } },
    name: { type: Sequelize.STRING(150), allowNull: false },
    description: { type: Sequelize.STRING(1000), allowNull: true },
    status: { type: Sequelize.STRING(40), allowNull: false, defaultValue: 'Draft' },
    meta: { type: Sequelize.STRING(200), allowNull: true },
    amount: { type: Sequelize.STRING(100), allowNull: true },
    employee: { type: Sequelize.STRING(150), allowNull: true },
    employee_email: { type: Sequelize.STRING(120), allowNull: true },
    employee_role: { type: Sequelize.STRING(80), allowNull: true },
    department: { type: Sequelize.STRING(100), allowNull: true },
    work_date: { type: Sequelize.DATE, allowNull: true },
    check_in: { type: Sequelize.DATE, allowNull: true },
    check_out: { type: Sequelize.DATE, allowNull: true },
    shift: { type: Sequelize.STRING(80), allowNull: true },
    location: { type: Sequelize.STRING(200), allowNull: true },
    latitude: { type: Sequelize.STRING(60), allowNull: true },
    longitude: { type: Sequelize.STRING(60), allowNull: true },
    map_url: { type: Sequelize.STRING(500), allowNull: true },
    attendance_type: { type: Sequelize.STRING(80), allowNull: true },
    leave_type: { type: Sequelize.STRING(80), allowNull: true },
    start_date: { type: Sequelize.DATE, allowNull: true },
    end_date: { type: Sequelize.DATE, allowNull: true },
    total_days: { type: Sequelize.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
    overtime_date: { type: Sequelize.DATE, allowNull: true },
    start_time: { type: Sequelize.STRING(20), allowNull: true },
    end_time: { type: Sequelize.STRING(20), allowNull: true },
    total_hours: { type: Sequelize.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
    task_no: { type: Sequelize.STRING(80), allowNull: true },
    priority: { type: Sequelize.STRING(40), allowNull: true },
    due_date: { type: Sequelize.DATE, allowNull: true },
    schedule_date: { type: Sequelize.DATE, allowNull: true },
    announcement_type: { type: Sequelize.STRING(80), allowNull: true },
    publish_date: { type: Sequelize.DATE, allowNull: true },
    period: { type: Sequelize.STRING(80), allowNull: true },
    gross_salary: { type: Sequelize.DECIMAL(18, 2), allowNull: false, defaultValue: 0 },
    deductions: { type: Sequelize.DECIMAL(18, 2), allowNull: false, defaultValue: 0 },
    net_salary: { type: Sequelize.DECIMAL(18, 2), allowNull: false, defaultValue: 0 },
    payment_date: { type: Sequelize.DATE, allowNull: true },
    payment_method: { type: Sequelize.STRING(80), allowNull: true },
    reference: { type: Sequelize.STRING(150), allowNull: true },
    approval_status: { type: Sequelize.STRING(40), allowNull: false, defaultValue: 'Tidak Perlu Approval' },
    approval_id: { type: Sequelize.INTEGER, allowNull: true },
    approved_by: { type: Sequelize.STRING(120), allowNull: true },
    approved_at: { type: Sequelize.DATE, allowNull: true },
    note: { type: Sequelize.STRING(1000), allowNull: true },
    details: { type: Sequelize.TEXT, allowNull: true },
    relations: { type: Sequelize.TEXT, allowNull: true },
    flow_flags: { type: Sequelize.TEXT, allowNull: true },
    active: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
    created_at: { type: Sequelize.DATE, allowNull: true },
    created_by: { type: Sequelize.STRING(50), allowNull: true },
    updated_at: { type: Sequelize.DATE, allowNull: true },
    updated_by: { type: Sequelize.STRING(50), allowNull: true },
  }, {
    tableName,
    freezeTableName: true,
    timestamps: true,
    paranoid: false,
    underscored: true
  });

  Model.belongsTo(HaiUser, { foreignKey: "partner_id" });
  HaiUser.hasMany(Model, { foreignKey: "partner_id" });

  return Model;
}

module.exports = defineErpHrModel
