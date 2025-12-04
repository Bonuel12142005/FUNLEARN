import { DataTypes } from "sequelize";
import { sequelize } from "./db.js";

const Course = sequelize.define("Course", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT
  },
  thumbnail_url: {
    type: DataTypes.STRING(500)
  },
  category: {
    type: DataTypes.STRING(100)
  },
  difficulty_level: {
    type: DataTypes.ENUM('beginner', 'intermediate', 'advanced'),
    defaultValue: 'beginner'
  },
  created_by: {
    type: DataTypes.INTEGER
  },
  is_published: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  total_xp: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  estimated_duration: {
    type: DataTypes.INTEGER
  }
}, {
  tableName: "courses",
  timestamps: true,
  underscored: true
});

export default Course;
