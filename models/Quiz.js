import { DataTypes } from "sequelize";
import { sequelize } from "./db.js";

const Quiz = sequelize.define("Quiz", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  lesson_id: {
    type: DataTypes.INTEGER
  },
  course_id: {
    type: DataTypes.INTEGER
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT
  },
  time_limit: {
    type: DataTypes.INTEGER
  },
  passing_score: {
    type: DataTypes.INTEGER,
    defaultValue: 70
  },
  max_attempts: {
    type: DataTypes.INTEGER,
    defaultValue: 3
  },
  xp_reward: {
    type: DataTypes.INTEGER,
    defaultValue: 50
  },
  created_by: {
    type: DataTypes.INTEGER
  }
}, {
  tableName: "quizzes",
  timestamps: true,
  underscored: true
});

export default Quiz;
