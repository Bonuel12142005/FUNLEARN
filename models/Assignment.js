import { DataTypes } from "sequelize";
import { sequelize } from "./db.js";

const Assignment = sequelize.define("Assignment", {
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
  teacher_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  course_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'courses',
      key: 'id'
    }
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT
  },
  instructions: {
    type: DataTypes.TEXT
  },
  due_date: {
    type: DataTypes.DATE
  },
  max_points: {
    type: DataTypes.INTEGER,
    defaultValue: 100
  },
  xp_reward: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  assignment_type: {
    type: DataTypes.ENUM('homework', 'quiz', 'project', 'exam', 'discussion'),
    defaultValue: 'homework'
  },
  status: {
    type: DataTypes.ENUM('draft', 'published', 'closed'),
    defaultValue: 'draft'
  },
  allow_late_submission: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  late_penalty: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
}, {
  tableName: "assignments",
  timestamps: true,
  underscored: true
});

export default Assignment;