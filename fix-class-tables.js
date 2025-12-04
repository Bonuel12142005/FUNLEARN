import { sequelize } from "./models/db.js";

async function fixClassTables() {
  try {
    console.log("🔧 Fixing class tables structure...");

    // Drop and recreate class_enrollments table with correct structure
    await sequelize.query(`DROP TABLE IF EXISTS class_enrollments`);
    console.log("✅ Dropped existing class_enrollments table");

    // Create class_enrollments table with correct structure
    await sequelize.query(`
      CREATE TABLE class_enrollments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        class_id INT NOT NULL,
        student_id INT NOT NULL,
        enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        status ENUM('active', 'inactive', 'completed', 'dropped') DEFAULT 'active',
        grade DECIMAL(5,2) NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
        FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE KEY unique_class_student (class_id, student_id),
        INDEX idx_class (class_id),
        INDEX idx_student (student_id)
      )
    `);
    console.log("✅ Created class_enrollments table with correct structure");

    // Check if classes table exists and has correct structure
    const [classesTable] = await sequelize.query(`SHOW TABLES LIKE 'classes'`);
    if (classesTable.length === 0) {
      await sequelize.query(`
        CREATE TABLE classes (
          id INT AUTO_INCREMENT PRIMARY KEY,
          teacher_id INT NOT NULL,
          class_name VARCHAR(255) NOT NULL,
          description TEXT,
          class_code VARCHAR(20) UNIQUE NOT NULL,
          academic_year VARCHAR(20),
          semester VARCHAR(20),
          is_active BOOLEAN DEFAULT TRUE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (teacher_id) REFERENCES users(id) ON DELETE CASCADE,
          INDEX idx_teacher (teacher_id),
          INDEX idx_code (class_code)
        )
      `);
      console.log("✅ Created classes table");
    } else {
      console.log("✅ Classes table already exists");
    }

    console.log("🎉 Class tables structure fixed!");

  } catch (error) {
    console.error("❌ Error fixing tables:", error);
  } finally {
    await sequelize.close();
  }
}

fixClassTables();