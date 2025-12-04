import { DataTypes } from "sequelize";
import { sequelize } from "./db.js";

const Badge = sequelize.define("Badge", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT
  },
  icon_url: {
    type: DataTypes.STRING(500)
  },
  badge_type: {
    type: DataTypes.ENUM('achievement', 'milestone', 'special'),
    defaultValue: 'achievement'
  },
  criteria: {
    type: DataTypes.JSON
  },
  xp_reward: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  rarity: {
    type: DataTypes.ENUM('common', 'rare', 'epic', 'legendary'),
    defaultValue: 'common'
  }
}, {
  tableName: "badges",
  timestamps: true,
  underscored: true,
  updatedAt: false
});

export default Badge;
