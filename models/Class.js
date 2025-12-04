import { DataTypes } from "sequelize";
import { sequelize } from "./db.js";

const Class = sequelize.define("Class", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  teacher_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  class_name: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT
  },
  class_code: {
    type: DataTypes.STRING(20),
    unique: true,
    allowNull: false
  },
  academic_year: {
    type: DataTypes.STRING(20)
  },
  semester: {
    type: DataTypes.STRING(20)
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: "classes",
  timestamps: true,
  underscored: true
});

export default Class;
