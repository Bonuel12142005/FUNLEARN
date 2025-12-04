import { DataTypes } from "sequelize";
import { sequelize } from "./db.js";

const Grade = sequelize.define("Grade", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  assignment_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'assignments',
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
  teacher_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  points_earned: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true
  },
  max_points: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  percentage: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true
  },
  letter_grade: {
    type: DataTypes.STRING(2),
    allowNull: true
  },
  feedback: {
    type: DataTypes.TEXT
  },
  submission_date: {
    type: DataTypes.DATE
  },
  graded_date: {
    type: DataTypes.DATE
  },
  is_late: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  status: {
    type: DataTypes.ENUM('not_submitted', 'submitted', 'graded', 'returned'),
    defaultValue: 'not_submitted'
  }
}, {
  tableName: "grades",
  timestamps: true,
  underscored: true
});

export default Grade;