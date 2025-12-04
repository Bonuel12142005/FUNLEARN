import { sequelize } from "./models/db.js";
import { User, Class, ClassEnrollment, Assignment, Grade, Course, Module, Lesson, StudentProgress } from "./models/FunlearnModels.js";
import bcrypt from "bcrypt";

async function setupCompleteSystem() {
  try {
    console.log("🚀 Setting up complete class management system...");

    // Sync database tables
    await sequelize.sync({ force: false });
    console.log("✅ Database tables synced");

    // Create teacher if doesn't exist
    let teacher = await User.findOne({ where: { username: 'teacher1' } });
    if (!teacher) {
      const hashedPassword = await bcrypt.hash('teacher123', 10);
      teacher = await User.create({
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

    // Create students if they don't exist
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

    const createdStudents = [];
    for (const studentData of students) {
      let student = await User.findOne({ where: { username: studentData.username } });
      if (!student) {
        const hashedPassword = await bcrypt.hash('student123', 10);
        student = await User.create({
          ...studentData,
          password: hashedPassword,
          role: 'student'
        });
        console.log(`✅ Created student: ${studentData.first_name} ${studentData.last_name}`);
      }
      createdStudents.push(student);
    }

    // Create sample classes
    const classesData = [
      {
        class_name: 'Advanced JavaScript Programming',
        description: 'Learn modern JavaScript concepts and frameworks',
        class_code: 'JS2024A',
        academic_year: '2024-2025',
        semester: 'Fall'
      },
      {
        class_name: 'Web Development Fundamentals',
        description: 'HTML, CSS, and JavaScript basics',
        class_code: 'WEB101',
        academic_year: '2024-2025',
        semester: 'Fall'
      }
    ];

    for (const classData of classesData) {
      let existingClass = await Class.findOne({ where: { class_code: classData.class_code } });
      if (!existingClass) {
        const newClass = await Class.create({
          ...classData,
          teacher_id: teacher.id,
          is_active: true
        });

        console.log(`✅ Created class: ${classData.class_name}`);

        // Enroll students in the class
        for (const student of createdStudents) {
          await ClassEnrollment.create({
            class_id: newClass.id,
            student_id: student.id,
            status: 'active'
          });
        }
        console.log(`✅ Enrolled ${createdStudents.length} students in ${classData.class_name}`);

        // Create sample assignments
        const assignments = [
          {
            title: 'JavaScript Variables and Functions',
            description: 'Practice with variables, functions, and scope',
            assignment_type: 'homework',
            max_points: 100,
            xp_reward: 50
          },
          {
            title: 'DOM Manipulation Project',
            description: 'Create an interactive web page using DOM methods',
            assignment_type: 'project',
            max_points: 150,
            xp_reward: 100
          }
        ];

        for (const assignmentData of assignments) {
          const assignment = await Assignment.create({
            ...assignmentData,
            class_id: newClass.id,
            teacher_id: teacher.id,
            due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
            status: 'published'
          });

          // Create sample grades for some students
          for (let i = 0; i < createdStudents.length; i++) {
            const student = createdStudents[i];
            const pointsEarned = Math.floor(Math.random() * 30) + 70; // Random grade between 70-100
            
            await Grade.create({
              assignment_id: assignment.id,
              student_id: student.id,
              teacher_id: teacher.id,
              points_earned: pointsEarned,
              max_points: assignment.max_points,
              percentage: (pointsEarned / assignment.max_points) * 100,
              status: Math.random() > 0.3 ? 'graded' : 'submitted',
              submission_date: new Date(),
              graded_date: Math.random() > 0.3 ? new Date() : null
            });
          }
        }
        console.log(`✅ Created ${assignments.length} assignments with grades`);
      }
    }

    console.log("\n🎉 Complete class management system setup finished!");
    console.log("\n📋 Test Instructions:");
    console.log("1. Start server: node index.js");
    console.log("2. Login as teacher: username=teacher1, password=teacher123");
    console.log("3. Go to Dashboard - see classes appear");
    console.log("4. Click on a class to manage it");
    console.log("5. Test all class management features:");
    console.log("   - Assignments: Create and manage assignments");
    console.log("   - Progress Tracking: Monitor student progress");
    console.log("   - Grades: View and manage grades");
    console.log("   - Settings: Update class settings");

  } catch (error) {
    console.error("❌ Setup failed:", error);
  } finally {
    await sequelize.close();
  }
}

setupCompleteSystem();