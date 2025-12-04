import { DataTypes } from "sequelize";
import { sequelize } from "./db.js";

const AuditLog = sequelize.define("AuditLog", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  action: {
    type: DataTypes.STRING,
    allowNull: false
  },
  entityType: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'e.g., Report, User, Facility'
  },
  entityId: {
    type: DataTypes.INTEGER
  },
  oldValue: {
    type: DataTypes.JSON
  },
  newValue: {
    type: DataTypes.JSON
  },
  ipAddress: {
    type: DataTypes.STRING
  },
  userAgent: {
    type: DataTypes.TEXT
  }
});

export default AuditLog;
