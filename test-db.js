import { sequelize } from "./models/db.js";
import { User } from "./models/FunlearnModels.js";

async function testDatabase() {
  try {
    console.log("Testing database connection...");
    
    // Test connection
    await sequelize.authenticate();
    console.log("✅ Database connection successful");
    
    // Sync models (this will create tables if they don't exist)
    await sequelize.sync({ alter: true });
    console.log("✅ Database sync successful");
    
    // Test User model
    console.log("User model attributes:", Object.keys(User.rawAttributes));
    
    // Try to create a test user
    const testUser = {
      first_name: "Test",
      last_name: "User",
      username: "testuser123",
      email: "test@example.com",
      role: "student",
      password: "password123",
      xp: 0,
      level: 1
    };
    
    console.log("Attempting to create test user...");
    const user = await User.create(testUser);
    console.log("✅ Test user created successfully:", user.id);
    
    // Clean up test user
    await user.destroy();
    console.log("✅ Test user cleaned up");
    
    process.exit(0);
  } catch (error) {
    console.error("❌ Database test failed:", error);
    process.exit(1);
  }
}

testDatabase();