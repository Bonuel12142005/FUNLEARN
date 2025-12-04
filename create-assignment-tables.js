import { sequelize } from "./models/db.js";

async function createAssignmentTables() {
  try {
    console.log("🔧 Creating assignment and grade tables...");

    // Create assignments table
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS assignments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        class_id INT NOT NULL,
        teacher_id INT NOT NULL,
        course_id INT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        instructions TEXT,
        due_date DATETIME NULL,
        max_points INT DEFAULT 100,
        xp_reward INT DEFAULT 0,
        assignment_type ENUM('homework', 'quiz', 'project', 'exam', 'discussion') DEFAULT 'homework',
        status ENUM('draft', 'published', 'closed') DEFAULT 'draft',
        allow_late_submission BOOLEAN DEFAULT TRUE,
        late_penalty INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
        FOREIGN KEY (teacher_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE SET NULL,
        INDEX idx_class (class_id),
        INDEX idx_teacher (teacher_id),
        INDEX idx_due_date (due_date)
      )
    `);
    console.log("✅ Assignments table created");

    // Create grades table
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS grades (
        id INT AUTO_INCREMENT PRIMARY KEY,
        assignment_id INT NOT NULL,
        student_id INT NOT NULL,
        teacher_id INT NOT NULL,
        points_earned DECIMAL(5,2) NULL,
        max_points INT NOT NULL,
        percentage DECIMAL(5,2) NULL,
        letter_grade VARCHAR(2) NULL,
        feedback TEXT,
        submission_date DATETIME NULL,
        graded_date DATETIME NULL,
        is_late BOOLEAN DEFAULT FALSE,
        status ENUM('not_submitted', 'submitted', 'graded', 'returned') DEFAULT 'not_submitted',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (assignment_id) REFERENCES assignments(id) ON DELETE CASCADE,
        FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (teacher_id) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE KEY unique_assignment_student (assignment_id, student_id),
        INDEX idx_assignment (assignment_id),
        INDEX idx_student (student_id),
        INDEX idx_teacher (teacher_id)
      )
    `);
    console.log("✅ Grades table created");

    console.log("🎉 Assignment and grade tables created successfully!");

  } catch (error) {
    console.error("❌ Error creating tables:", error);
  } finally {
    await sequelize.close();
  }
}

createAssignmentTables();