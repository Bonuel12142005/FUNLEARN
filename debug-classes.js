import { sequelize } from "./models/db.js";
import { User, Class, ClassEnrollment } from "./models/FunlearnModels.js";

async function debugClasses() {
  try {
    console.log("🔍 Debugging class display issue...");

    // Check database connection
    await sequelize.authenticate();
    console.log("✅ Database connection OK");

    // Check if teacher exists
    const teacher = await User.findOne({ where: { username: 'teacher1' } });
    if (teacher) {
      console.log(`✅ Teacher found: ID ${teacher.id}, Name: ${teacher.first_name} ${teacher.last_name}`);
      
      // Check classes for this teacher
      const classes = await Class.findAll({
        where: { teacher_id: teacher.id }
      });
      
      console.log(`📊 Found ${classes.length} classes for teacher ${teacher.id}`);
      
      if (classes.length > 0) {
        classes.forEach(cls => {
          console.log(`   - Class: ${cls.class_name} (ID: ${cls.id}, Code: ${cls.class_code})`);
        });
      } else {
        console.log("❌ No classes found for this teacher");
        
        // Check if there are any classes in the database at all
        const allClasses = await Class.findAll();
        console.log(`📊 Total classes in database: ${allClasses.length}`);
        
        if (allClasses.length > 0) {
          console.log("Classes found for other teachers:");
          allClasses.forEach(cls => {
            console.log(`   - Class: ${cls.class_name} (Teacher ID: ${cls.teacher_id})`);
          });
        }
      }
      
      // Check class enrollments
      const enrollments = await ClassEnrollment.findAll();
      console.log(`📊 Total enrollments in database: ${enrollments.length}`);
      
    } else {
      console.log("❌ Teacher not found");
    }

  } catch (error) {
    console.error("❌ Debug error:", error);
  } finally {
    await sequelize.close();
  }
}

debugClasses();