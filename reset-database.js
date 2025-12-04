import { sequelize } from "./models/db.js";

async function resetDatabase() {
  try {
    console.log("🔄 Resetting database...");
    
    // Test connection
    await sequelize.authenticate();
    console.log("✅ Database connection established");

    // Disable foreign key checks
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 0');
    console.log("✅ Foreign key checks disabled");

    // Drop all tables with force
    await sequelize.drop();
    console.log("✅ All tables dropped");

    // Re-enable foreign key checks
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
    console.log("✅ Foreign key checks re-enabled");

    console.log("\n🎉 Database reset complete!");
    console.log("Now run: node migrate.js");

    process.exit(0);
  } catch (error) {
    console.error("❌ Database reset failed:", error);
    process.exit(1);
  }
}

resetDatabase();