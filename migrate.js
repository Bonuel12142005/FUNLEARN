import { sequelize } from "./models/db.js";
import {
  User,
  Course,
  Module,
  Lesson,
  Quiz,
  StudentProgress,
  Badge,
  Class,
  Notification,
  AuditLog
} from "./models/FunlearnModels.js";

async function migrate() {
  try {
    console.log("🔄 Starting FUNLEARN database migration...");
    
    // Test connection
    await sequelize.authenticate();
    console.log("✅ Database connection established");

    // Check if we need to handle foreign key constraints
    try {
      // Try to sync normally first
      await sequelize.sync({ force: false, alter: true });
      console.log("✅ All models synchronized");
    } catch (error) {
      if (error.message.includes('foreign key constraint')) {
        console.log("⚠️  Foreign key constraint detected, fixing...");
        
        // Disable foreign key checks temporarily
        await sequelize.query('SET FOREIGN_KEY_CHECKS = 0');
        console.log("✅ Foreign key checks disabled");

        // Drop problematic tables that might have foreign key issues
        try {
          await sequelize.query('DROP TABLE IF EXISTS assignments');
          await sequelize.query('DROP TABLE IF EXISTS class_enrollments');
          await sequelize.query('DROP TABLE IF EXISTS student_badges');
          console.log("✅ Cleaned up problematic tables");
        } catch (cleanupError) {
          console.log("⚠️  Some tables didn't exist, continuing...");
        }

        // Now sync all models
        await sequelize.sync({ force: false, alter: true });
        console.log("✅ All models synchronized after cleanup");

        // Re-enable foreign key checks
        await sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
        console.log("✅ Foreign key checks re-enabled");
      } else {
        throw error;
      }
    }

    // Create default admin user
    const adminExists = await User.findOne({ where: { username: 'admin' } });
    if (!adminExists) {
      await User.create({
        username: 'admin',
        email: 'admin@funlearn.com',
        password: 'admin123',
        role: 'admin',
        first_name: 'System',
        last_name: 'Administrator',
        level: 1,
        xp: 0
      });
      console.log("✅ Default admin user created (username: admin, password: admin123)");
    }

    // Create sample badges
    const badgeCount = await Badge.count();
    if (badgeCount === 0) {
      await Badge.bulkCreate([
        {
          name: 'First Steps',
          description: 'Complete your first lesson',
          icon_url: '/images/badges/first-steps.png',
          badge_type: 'milestone',
          xp_reward: 10,
          rarity: 'common'
        },
        {
          name: 'Quiz Master',
          description: 'Pass 10 quizzes',
          icon_url: '/images/badges/quiz-master.png',
          badge_type: 'achievement',
          xp_reward: 50,
          rarity: 'rare'
        },
        {
          name: 'Speed Learner',
          description: 'Complete a course in under 1 week',
          icon_url: '/images/badges/speed-learner.png',
          badge_type: 'achievement',
          xp_reward: 100,
          rarity: 'epic'
        },
        {
          name: 'Perfect Score',
          description: 'Get 100% on any quiz',
          icon_url: '/images/badges/perfect-score.png',
          badge_type: 'achievement',
          xp_reward: 25,
          rarity: 'rare'
        },
        {
          name: 'Dedicated Student',
          description: 'Maintain a 7-day login streak',
          icon_url: '/images/badges/dedicated.png',
          badge_type: 'milestone',
          xp_reward: 50,
          rarity: 'rare'
        },
        {
          name: 'Knowledge Seeker',
          description: 'Complete 5 courses',
          icon_url: '/images/badges/knowledge-seeker.png',
          badge_type: 'milestone',
          xp_reward: 200,
          rarity: 'epic'
        },
        {
          name: 'Champion',
          description: 'Reach #1 on the leaderboard',
          icon_url: '/images/badges/champion.png',
          badge_type: 'special',
          xp_reward: 500,
          rarity: 'legendary'
        }
      ]);
      console.log("✅ Default badges created");
    }

    // Create sample teacher
    const teacherExists = await User.findOne({ where: { username: 'teacher1' } });
    if (!teacherExists) {
      await User.create({
        username: 'teacher1',
        email: 'teacher@funlearn.com',
        password: 'teacher123',
        role: 'teacher',
        first_name: 'John',
        last_name: 'Teacher',
        level: 1,
        xp: 0
      });
      console.log("✅ Sample teacher created (username: teacher1, password: teacher123)");
    }

    // Create sample student
    const studentExists = await User.findOne({ where: { username: 'student1' } });
    if (!studentExists) {
      await User.create({
        username: 'student1',
        email: 'student@funlearn.com',
        password: 'student123',
        role: 'student',
        first_name: 'Jane',
        last_name: 'Student',
        level: 1,
        xp: 0
      });
      console.log("✅ Sample student created (username: student1, password: student123)");
    }

    console.log("\n🎉 FUNLEARN migration completed successfully!");
    console.log("\n📝 Default Accounts:");
    console.log("   Admin: admin / admin123");
    console.log("   Teacher: teacher1 / teacher123");
    console.log("   Student: student1 / student123");
    console.log("\n🚀 You can now start the server with: npm run xian-start");

    process.exit(0);
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  }
}

migrate();
