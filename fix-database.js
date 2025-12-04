import { sequelize } from "./models/db.js";

async function fixDatabase() {
  try {
    console.log("🔧 Fixing database foreign key constraints...");
    
    // Test connection
    await sequelize.authenticate();
    console.log("✅ Database connection established");

    // Disable foreign key checks
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 0');
    console.log("✅ Foreign key checks disabled");

    // Get all table names
    const [tables] = await sequelize.query("SHOW TABLES");
    console.log(`📋 Found ${tables.length} tables`);

    // Drop all tables
    for (const table of tables) {
      const tableName = Object.values(table)[0];
      await sequelize.query(`DROP TABLE IF EXISTS \`${tableName}\``);
      console.log(`🗑️  Dropped table: ${tableName}`);
    }

    // Re-enable foreign key checks
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
    console.log("✅ Foreign key checks re-enabled");

    // Now sync all models to recreate tables
    await sequelize.sync({ force: true });
    console.log("✅ All tables recreated with proper structure");

    console.log("\n🎉 Database fix complete!");
    console.log("You can now run: node migrate.js");

    process.exit(0);
  } catch (error) {
    console.error("❌ Database fix failed:", error);
    
    // Try to re-enable foreign key checks even if there was an error
    try {
      await sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
    } catch (e) {
      console.error("Failed to re-enable foreign key checks:", e.message);
    }
    
    process.exit(1);
  }
}

fixDatabase();