import { DataTypes } from "sequelize";
import { sequelize } from "./db.js";

const Lesson = sequelize.define("Lesson", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  module_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  content_type: {
    type: DataTypes.ENUM('video', 'text', 'interactive', 'quiz', 'simulation', 'game'),
    allowNull: false
  },
  content: {
    type: DataTypes.TEXT
  },
  video_url: {
    type: DataTypes.STRING(500)
  },
  duration: {
    type: DataTypes.INTEGER
  },
  xp_reward: {
    type: DataTypes.INTEGER,
    defaultValue: 10
  },
  order_index: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  is_mandatory: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: "lessons",
  timestamps: true,
  underscored: true
});

export default Lesson;
