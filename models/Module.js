import { DataTypes } from "sequelize";
import { sequelize } from "./db.js";

const Module = sequelize.define("Module", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  course_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT
  },
  order_index: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  is_locked: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  tableName: "modules",
  timestamps: true,
  underscored: true
});

export default Module;
