import { sequelize } from "./models/db.js";
import { User, Class, ClassEnrollment, Course, Module, Lesson, StudentProgress } from "./models/FunlearnModels.js";
import bcrypt from "bcrypt";

async function setupClassFunctionality() {
  try {
    console.log("🔄 Setting up class functionality...");

    // Sync database tables
    await sequelize.sync({ force: false });
    console.log("✅ Database tables synced");

    // Create sample users if they don't exist
    const existingTeacher = await User.findOne({ where: { username: 'teacher1' } });
    if (!existingTeacher) {
      const hashedPassword = await bcrypt.hash('teacher123', 10);
      await User.create({
        username: 'teacher1',
        email: 'teacher@funlearn.com',
        password: hashedPassword,
        role: 'teacher',
        first_name: 'John',
        last_name: 'Teacher',
        xp: 0,
        level: 1
      });
      console.log("✅ Created teacher user");
    }

    // Create sample students
    const students = [
      {
        username: 'alice_johnson',
        email: 'alice.johnson@email.com',
        first_name: 'Alice',
        last_name: 'Johnson',
        xp: 1250,
        level: 5
      },
      {
        username: 'bob_smith',
        email: 'bob.smith@email.com',
        first_name: 'Bob',
        last_name: 'Smith',
        xp: 980,
        level: 4
      },
      {
        username: 'carol_davis',
        email: 'carol.davis@email.com',
        first_name: 'Carol',
        last_name: 'Davis',
        xp: 1450,
        level: 6
      }
    ];

    for (const studentData of students) {
      const existingStudent = await User.findOne({ where: { username: studentData.username } });
      if (!existingStudent) {
        const hashedPassword = await bcrypt.hash('student123', 10);
        await User.create({
          ...studentData,
          password: hashedPassword,
          role: 'student'
        });
        console.log(`✅ Created student: ${studentData.first_name} ${studentData.last_name}`);
      }
    }

    // Get teacher and students
    const teacher = await User.findOne({ where: { username: 'teacher1' } });
    const alice = await User.findOne({ where: { username: 'alice_johnson' } });
    const bob = await User.findOne({ where: { username: 'bob_smith' } });
    const carol = await User.findOne({ where: { username: 'carol_davis' } });

    // Create sample class
    const existingClass = await Class.findOne({ where: { class_code: 'JS2024A' } });
    if (!existingClass && teacher) {
      const newClass = await Class.create({
        teacher_id: teacher.id,
        class_name: 'Advanced JavaScript Programming',
        description: 'Learn modern JavaScript concepts and frameworks',
        class_code: 'JS2024A',
        academic_year: '2024-2025',
        semester: 'Fall',
        is_active: true
      });

      console.log("✅ Created sample class: Advanced JavaScript Programming");

      // Enroll students in the class
      if (alice) {
        await ClassEnrollment.create({
          class_id: newClass.id,
          student_id: alice.id,
          status: 'active'
        });
        console.log("✅ Enrolled Alice Johnson");
      }

      if (bob) {
        await ClassEnrollment.create({
          class_id: newClass.id,
          student_id: bob.id,
          status: 'active'
        });
        console.log("✅ Enrolled Bob Smith");
      }

      if (carol) {
        await ClassEnrollment.create({
          class_id: newClass.id,
          student_id: carol.id,
          status: 'active'
        });
        console.log("✅ Enrolled Carol Davis");
      }
    }

    // Create sample course and lessons for progress tracking
    const existingCourse = await Course.findOne({ where: { title: 'JavaScript Fundamentals' } });
    if (!existingCourse && teacher) {
      const course = await Course.create({
        title: 'JavaScript Fundamentals',
        description: 'Learn the basics of JavaScript programming',
        category: 'Programming',
        difficulty_level: 'beginner',
        created_by: teacher.id,
        is_published: true,
        total_xp: 500
      });

      const module = await Module.create({
        course_id: course.id,
        title: 'Getting Started',
        description: 'Introduction to JavaScript',
        order_index: 1
      });

      const lessons = [
        { title: 'Variables and Data Types', xp_reward: 50 },
        { title: 'Functions and Scope', xp_reward: 75 },
        { title: 'Arrays and Objects', xp_reward: 100 },
        { title: 'Control Flow', xp_reward: 75 },
        { title: 'DOM Manipulation', xp_reward: 100 }
      ];

      for (let i = 0; i < lessons.length; i++) {
        const lesson = await Lesson.create({
          module_id: module.id,
          title: lessons[i].title,
          content_type: 'text',
          content: `Content for ${lessons[i].title}`,
          xp_reward: lessons[i].xp_reward,
          order_index: i + 1
        });

        // Add some progress for students
        if (alice) {
          await StudentProgress.create({
            student_id: alice.id,
            lesson_id: lesson.id,
            status: i < 4 ? 'completed' : 'in_progress',
            progress_percentage: i < 4 ? 100 : 60,
            xp_earned: i < 4 ? lessons[i].xp_reward : 0,
            completed_at: i < 4 ? new Date() : null
          });
        }

        if (bob) {
          await StudentProgress.create({
            student_id: bob.id,
            lesson_id: lesson.id,
            status: i < 3 ? 'completed' : 'not_started',
            progress_percentage: i < 3 ? 100 : 0,
            xp_earned: i < 3 ? lessons[i].xp_reward : 0,
            completed_at: i < 3 ? new Date() : null
          });
        }

        if (carol) {
          await StudentProgress.create({
            student_id: carol.id,
            lesson_id: lesson.id,
            status: 'completed',
            progress_percentage: 100,
            xp_earned: lessons[i].xp_reward,
            completed_at: new Date()
          });
        }
      }

      console.log("✅ Created sample course with lessons and progress");
    }

    console.log("\n🎉 Class functionality setup complete!");
    console.log("\n📋 Test Instructions:");
    console.log("1. Start the server: node index.js");
    console.log("2. Login as teacher: username=teacher1, password=teacher123");
    console.log("3. Navigate to Classes section");
    console.log("4. View 'Advanced JavaScript Programming' class");
    console.log("5. Test Add Student, Progress, and View buttons");
    console.log("\n👥 Sample Students Available:");
    console.log("- Alice Johnson (alice.johnson@email.com)");
    console.log("- Bob Smith (bob.smith@email.com)");
    console.log("- Carol Davis (carol.davis@email.com)");

  } catch (error) {
    console.error("❌ Setup failed:", error);
  } finally {
    await sequelize.close();
  }
}

// Run setup
setupClassFunctionality();