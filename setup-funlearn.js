import inquirer from "inquirer";
import { sequelize } from "./models/db.js";
import fs from "fs";
import path from "path";

console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   🎓 FUNLEARN: Interactive Learning Platform Setup       ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
`);

async function setup() {
  try {
    // Step 1: Database Configuration
    console.log("\n📋 Step 1: Database Configuration\n");
    
    const dbConfig = await inquirer.prompt([
      {
        type: "input",
        name: "database",
        message: "Database name:",
        default: "funlearn_db"
      },
      {
        type: "input",
        name: "username",
        message: "MySQL username:",
        default: "root"
      },
      {
        type: "password",
        name: "password",
        message: "MySQL password:",
        default: ""
      },
      {
        type: "input",
        name: "host",
        message: "MySQL host:",
        default: "localhost"
      }
    ]);

    // Update db.js file
    const dbFileContent = `/*
    MIT License
    
    Copyright (c) 2025 Christian I. Cabrera || XianFire Framework
    Mindoro State University - Philippines
    */
    
import { Sequelize } from "sequelize";

export const sequelize = new Sequelize("${dbConfig.database}", "${dbConfig.username}", "${dbConfig.password}", {
  host: "${dbConfig.host}",
  dialect: "mysql",
  logging: false,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
});
`;

    fs.writeFileSync("models/db.js", dbFileContent);
    console.log("✅ Database configuration updated");

    // Step 2: Test Connection
    console.log("\n🔌 Step 2: Testing database connection...\n");
    
    try {
      await sequelize.authenticate();
      console.log("✅ Database connection successful!");
    } catch (error) {
      console.error("❌ Database connection failed:", error.message);
      console.log("\n⚠️  Please check your database credentials and ensure MySQL is running.");
      console.log("   You can manually edit models/db.js to fix the configuration.");
      process.exit(1);
    }

    // Step 3: Setup Options
    console.log("\n⚙️  Step 3: Setup Options\n");
    
    const setupOptions = await inquirer.prompt([
      {
        type: "confirm",
        name: "runMigration",
        message: "Run database migration (create tables and default data)?",
        default: true
      },
      {
        type: "confirm",
        name: "createSampleData",
        message: "Create sample courses and content?",
        default: false
      }
    ]);

    if (setupOptions.runMigration) {
      console.log("\n🔄 Running migration...");
      const { execSync } = await import("child_process");
      execSync("node funlearn-migrate.js", { stdio: "inherit" });
    }

    if (setupOptions.createSampleData) {
      console.log("\n📚 Creating sample data...");
      // Import and run sample data creation
      const { createSampleData } = await import("./create-sample-data.js");
      await createSampleData();
    }

    // Step 4: Admin Account
    console.log("\n👤 Step 4: Admin Account Setup\n");
    
    const adminSetup = await inquirer.prompt([
      {
        type: "confirm",
        name: "changeAdminPassword",
        message: "Change default admin password (recommended)?",
        default: true
      }
    ]);

    if (adminSetup.changeAdminPassword) {
      const adminPassword = await inquirer.prompt([
        {
          type: "password",
          name: "password",
          message: "New admin password:",
          validate: (input) => input.length >= 6 || "Password must be at least 6 characters"
        }
      ]);

      const { User } = await import("./models/FunlearnModels.js");
      const admin = await User.findOne({ where: { username: "admin" } });
      if (admin) {
        admin.password = adminPassword.password;
        await admin.save();
        console.log("✅ Admin password updated");
      }
    }

    // Step 5: Complete
    console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   ✅ FUNLEARN Setup Complete!                            ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝

🚀 Next Steps:

1. Start the server:
   npm run xian-start

2. Access the system:
   http://localhost:3000

3. Login with:
   Username: admin
   Password: ${adminSetup.changeAdminPassword ? "[your new password]" : "admin123"}

4. Create your first course:
   Login as teacher and navigate to Course Management

📚 Documentation:
   - System Overview: FUNLEARN_SYSTEM.md
   - Installation Guide: FUNLEARN_INSTALLATION.md
   - Database Schema: DATABASE_SETUP.sql

🎉 Happy Learning!
`);

  } catch (error) {
    console.error("\n❌ Setup failed:", error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

setup();
