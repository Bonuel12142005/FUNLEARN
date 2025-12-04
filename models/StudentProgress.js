import { DataTypes } from "sequelize";
import { sequelize } from "./db.js";

const StudentProgress = sequelize.define("StudentProgress", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  student_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  lesson_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('not_started', 'in_progress', 'completed'),
    defaultValue: 'not_started'
  },
  progress_percentage: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  time_spent: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  xp_earned: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  completed_at: {
    type: DataTypes.DATE
  }
}, {
  tableName: "student_progress",
  timestamps: true,
  underscored: true
});

export default StudentProgress;
