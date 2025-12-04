import { DataTypes } from "sequelize";
import { sequelize } from "./db.js";

const ClassEnrollment = sequelize.define("ClassEnrollment", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  class_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'classes',
      key: 'id'
    }
  },
  student_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  enrolled_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive', 'completed', 'dropped'),
    defaultValue: 'active'
  },
  grade: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true
  }
}, {
  tableName: "class_enrollments",
  timestamps: true,
  underscored: true,
  indexes: [
    {
      unique: true,
      fields: ['class_id', 'student_id']
    }
  ]
});

export default ClassEnrollment;