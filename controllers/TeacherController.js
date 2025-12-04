import { User, Course, Module, Lesson, Quiz, Class, ClassEnrollment, Assignment, Grade, StudentProgress } from "../models/FunlearnModels.js";
import { sequelize } from "../models/db.js";

class TeacherController {
  // Teacher Dashboard
  static async dashboard(req, res) {
    try {
      const teacherId = req.session.userId;
      
      // Get success message from session
      const successMessage = req.session.successMessage;
      
      // Clear success message from session
      delete req.session.successMessage;
      
      console.log(`📊 Loading dashboard for teacher ID: ${teacherId}`);

      // Fetch real courses from database
      let courses = [];
      try {
        const dbCourses = await Course.findAll({
          where: {
            created_by: teacherId
          },
          order: [['created_at', 'DESC']],
          limit: 10 // Show latest 10 courses on dashboard
        });

        courses = dbCourses.map(course => {
          const courseJson = course.toJSON();
          return {
            id: courseJson.id,
            title: courseJson.title || 'Untitled Course',
            category: courseJson.category || 'Uncategorized',
            difficulty_level: courseJson.difficulty_level || 'beginner',
            is_published: courseJson.is_published || false,
            created_at: courseJson.created_at ? new Date(courseJson.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
          };
        });

        console.log(`✅ Loaded ${courses.length} courses for dashboard`);
      } catch (courseError) {
        console.error('❌ Error loading courses for dashboard:', courseError);
        // Use empty array if courses fail to load
        courses = [];
      }

      // Calculate course statistics
      const courseStats = {
        total: courses.length,
        published: courses.filter(course => course.is_published).length,
        draft: courses.filter(course => !course.is_published).length
      };

      console.log(`📊 Course stats: ${courseStats.total} total, ${courseStats.published} published, ${courseStats.draft} draft`);

      // Fetch real classes from database
      let classes = [];
      try {
        const dbClasses = await Class.findAll({
          where: {
            teacher_id: teacherId
          },
          order: [['created_at', 'DESC']],
          limit: 10 // Show latest 10 classes on dashboard
        });

        // Get student counts for each class
        const classesWithCounts = await Promise.all(
          dbClasses.map(async (classItem) => {
            const classJson = classItem.toJSON();
            
            // Count active students in this class
            const [studentCount] = await sequelize.query(
              'SELECT COUNT(*) as count FROM class_enrollments WHERE class_id = ? AND status = "active"',
              { replacements: [classJson.id] }
            );

            return {
              id: classJson.id,
              class_name: classJson.class_name || 'Untitled Class',
              description: classJson.description || 'No description provided',
              class_code: classJson.class_code,
              academic_year: classJson.academic_year,
              semester: classJson.semester,
              is_active: classJson.is_active,
              created_at: classJson.created_at ? new Date(classJson.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
              student_count: studentCount[0]?.count || 0
            };
          })
        );

        classes = classesWithCounts;
        console.log(`✅ Loaded ${classes.length} classes for dashboard`);
      } catch (classError) {
        console.error('❌ Error loading classes for dashboard:', classError);
        // Use empty array if classes fail to load
        classes = [];
      }

      // Calculate class statistics
      const classStats = {
        total: classes.length,
        active: classes.filter(cls => cls.is_active).length,
        inactive: classes.filter(cls => !cls.is_active).length,
        total_students: classes.reduce((sum, cls) => sum + cls.student_count, 0)
      };

      console.log(`📊 Class stats: ${classStats.total} total, ${classStats.active} active, ${classStats.total_students} students`);

      res.render("teacher/dashboard", { 
        classes: classes, 
        courses: courses,
        courseStats: courseStats,
        classStats: classStats,
        user: req.session.user,
        successMessage: successMessage
      });
    } catch (error) {
      console.error("Teacher dashboard error:", error);
      res.status(500).send("Error loading dashboard");
    }
  }

  // List All Courses
  static async listCourses(req, res) {
    try {
      // Get success message from session
      const successMessage = req.session.successMessage;
      const newCourseId = req.session.newCourseId;
      
      // Clear success message from session
      delete req.session.successMessage;
      delete req.session.newCourseId;

      const teacherId = req.session.userId;

      console.log(`🔍 Fetching courses for teacher ID: ${teacherId}`);

      // Test database connection first
      try {
        await sequelize.authenticate();
        console.log('✅ Database connection OK');
      } catch (dbError) {
        console.error('❌ Database connection failed:', dbError);
        throw new Error('Database connection failed');
      }

      // Fetch courses from database for the current teacher
      const courses = await Course.findAll({
        where: {
          created_by: teacherId
        },
        order: [['created_at', 'DESC']] // Show newest first
      });

      console.log(`📚 Found ${courses.length} courses for teacher ${teacherId}`);

      // Transform courses data for the view
      const coursesData = courses.map(course => {
        try {
          const courseJson = course.toJSON();
          console.log('Processing course:', courseJson); // Debug log
          
          return {
            id: courseJson.id,
            title: courseJson.title || 'Untitled Course',
            description: courseJson.description || 'No description provided',
            category: courseJson.category || 'Uncategorized',
            difficulty_level: courseJson.difficulty_level || 'beginner',
            estimated_duration: courseJson.estimated_duration || 0,
            is_published: courseJson.is_published || false,
            created_at: courseJson.created_at ? new Date(courseJson.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
            lessons_count: 0, // TODO: Count actual lessons when lesson model is implemented
            students_enrolled: 0, // TODO: Count actual enrollments when enrollment model is implemented
            total_xp: courseJson.total_xp || 0
          };
        } catch (courseError) {
          console.error('Error processing course:', courseError);
          return {
            id: course.id || 'unknown',
            title: 'Error Loading Course',
            description: 'There was an error loading this course',
            category: 'Unknown',
            difficulty_level: 'beginner',
            estimated_duration: 0,
            is_published: false,
            created_at: new Date().toISOString().split('T')[0],
            lessons_count: 0,
            students_enrolled: 0,
            total_xp: 0
          };
        }
      });

      res.render("teacher/courses", { 
        courses: coursesData,
        user: req.session.user,
        successMessage: successMessage,
        newCourseId: newCourseId
      });
    } catch (error) {
      console.error("❌ List courses error:", error);
      
      // Fallback to mock data when database fails
      const fallbackCourses = [
        {
          id: 'mock-1',
          title: "Sample Course (Database Error)",
          description: "This is a fallback course shown due to database connection issues",
          category: "Programming",
          difficulty_level: "beginner",
          estimated_duration: 120,
          is_published: true,
          created_at: new Date().toISOString().split('T')[0],
          lessons_count: 0,
          students_enrolled: 0,
          total_xp: 50
        }
      ];
      
      res.render("teacher/courses", { 
        courses: fallbackCourses,
        user: req.session.user,
        errorMessage: `Database connection issue: ${error.message}. Showing sample data.`
      });
    }
  }

  // Show Create Course Form
  static async createCourseForm(req, res) {
    try {
      // Get error message from session
      const errorMessage = req.session.errorMessage;
      
      // Clear error message from session
      delete req.session.errorMessage;

      res.render("teacher/course-create", { 
        user: req.session.user,
        errorMessage: errorMessage
      });
    } catch (error) {
      console.error("Create course form error:", error);
      res.status(500).send("Error loading create course form");
    }
  }

  // Create Course
  static async createCourse(req, res) {
    try {
      const { 
        title, 
        description, 
        category, 
        difficulty_level, 
        estimated_duration,
        xp_reward,
        prerequisites,
        learning_objectives,
        is_published,
        allow_enrollment,
        featured,
        action
      } = req.body;
      
      const teacherId = req.session.userId;

      // Validate required fields
      if (!title || !title.trim()) {
        throw new Error('Course title is required');
      }
      if (!category) {
        throw new Error('Course category is required');
      }
      if (!difficulty_level) {
        throw new Error('Difficulty level is required');
      }

      // Prepare course data for database
      const courseData = {
        title: title.trim(),
        description: description ? description.trim() : null,
        category,
        difficulty_level,
        estimated_duration: estimated_duration ? parseInt(estimated_duration) : null,
        total_xp: xp_reward ? parseInt(xp_reward) : 50,
        is_published: action === 'publish' || is_published === 'true',
        created_by: teacherId
      };

      console.log("💾 Saving course to database:", courseData);
      
      // Save course to database
      const newCourse = await Course.create(courseData);
      
      console.log("✅ Course saved successfully with ID:", newCourse.id);

      // Store success message in session
      if (action === 'publish' || is_published === 'true') {
        req.session.successMessage = `Course "${title}" has been created and published successfully! 🎉`;
      } else {
        req.session.successMessage = `Course "${title}" has been saved as draft successfully! 📝`;
      }

      // Store the new course ID for potential use
      req.session.newCourseId = newCourse.id;

      // Check if user wants to go back to dashboard or courses list
      const redirectTo = req.body.redirect_to || 'courses';
      
      if (redirectTo === 'dashboard') {
        res.redirect('/teacher/dashboard');
      } else {
        res.redirect('/teacher/courses');
      }
    } catch (error) {
      console.error("❌ Create course error:", error);
      
      // Store error message in session
      req.session.errorMessage = `Failed to create course: ${error.message}`;
      
      // Redirect back to create form with error
      res.redirect('/teacher/courses/create');
    }
  }

  // Edit Course
  static async editCourse(req, res) {
    try {
      const { courseId } = req.params;
      const teacherId = req.session.userId;

      console.log(`📝 Loading course ${courseId} for editing by teacher ${teacherId}`);

      // Get success/error messages from session
      const successMessage = req.session.successMessage;
      const errorMessage = req.session.errorMessage;
      
      // Clear messages from session
      delete req.session.successMessage;
      delete req.session.errorMessage;

      // Fetch course from database
      const course = await Course.findOne({
        where: {
          id: courseId,
          created_by: teacherId // Ensure teacher can only edit their own courses
        }
      });

      if (!course) {
        console.log(`❌ Course ${courseId} not found or not owned by teacher ${teacherId}`);
        req.session.errorMessage = 'Course not found or you do not have permission to edit it.';
        return res.redirect('/teacher/courses');
      }

      console.log(`✅ Course loaded: ${course.title}`);

      // Transform course data for the view
      const courseData = {
        id: course.id,
        title: course.title,
        description: course.description,
        category: course.category,
        difficulty_level: course.difficulty_level,
        estimated_duration: course.estimated_duration,
        total_xp: course.total_xp,
        is_published: course.is_published,
        created_at: course.created_at ? new Date(course.created_at).toISOString().split('T')[0] : null,
        updated_at: course.updated_at ? new Date(course.updated_at).toISOString().split('T')[0] : null
      };

      res.render("teacher/course-edit", { 
        course: courseData, 
        user: req.session.user,
        successMessage: successMessage,
        errorMessage: errorMessage
      });
    } catch (error) {
      console.error("❌ Edit course error:", error);
      req.session.errorMessage = `Error loading course: ${error.message}`;
      res.redirect('/teacher/courses');
    }
  }

  // Update Course
  static async updateCourse(req, res) {
    try {
      const { courseId } = req.params;
      const teacherId = req.session.userId;
      
      const { 
        title, 
        description, 
        category, 
        difficulty_level, 
        estimated_duration,
        total_xp,
        is_published,
        action
      } = req.body;

      console.log(`💾 Updating course ${courseId} by teacher ${teacherId}`);

      // Validate required fields
      if (!title || !title.trim()) {
        throw new Error('Course title is required');
      }
      if (!category) {
        throw new Error('Course category is required');
      }
      if (!difficulty_level) {
        throw new Error('Difficulty level is required');
      }

      // Find the course and ensure teacher owns it
      const course = await Course.findOne({
        where: {
          id: courseId,
          created_by: teacherId
        }
      });

      if (!course) {
        throw new Error('Course not found or you do not have permission to edit it');
      }

      // Prepare update data
      const updateData = {
        title: title.trim(),
        description: description ? description.trim() : null,
        category,
        difficulty_level,
        estimated_duration: estimated_duration ? parseInt(estimated_duration) : null,
        total_xp: total_xp ? parseInt(total_xp) : course.total_xp,
        is_published: action === 'publish' || is_published === 'true'
      };

      // Update the course
      await course.update(updateData);

      console.log(`✅ Course ${courseId} updated successfully`);

      // Set success message
      if (action === 'publish' && !course.is_published) {
        req.session.successMessage = `Course "${title}" has been updated and published successfully! 🎉`;
      } else if (action === 'unpublish' && course.is_published) {
        req.session.successMessage = `Course "${title}" has been updated and unpublished successfully! 📝`;
      } else {
        req.session.successMessage = `Course "${title}" has been updated successfully! ✅`;
      }

      // Redirect back to edit page or courses list
      const redirectTo = req.body.redirect_to || 'edit';
      
      if (redirectTo === 'courses') {
        res.redirect('/teacher/courses');
      } else {
        res.redirect(`/teacher/courses/${courseId}/edit`);
      }

    } catch (error) {
      console.error("❌ Update course error:", error);
      
      // Store error message in session
      req.session.errorMessage = `Failed to update course: ${error.message}`;
      
      // Redirect back to edit form
      res.redirect(`/teacher/courses/${courseId}/edit`);
    }
  }

  // Create Module
  static async createModule(req, res) {
    try {
      const { course_id, title, description, order_index } = req.body;

      const module = await Module.create({
        course_id,
        title,
        description,
        order_index
      });

      res.json({ success: true, module });
    } catch (error) {
      console.error("Create module error:", error);
      res.status(500).json({ error: "Error creating module" });
    }
  }

  // Create Lesson
  static async createLesson(req, res) {
    try {
      const { module_id, title, content_type, content, video_url, xp_reward } = req.body;

      const lesson = await Lesson.create({
        module_id,
        title,
        content_type,
        content,
        video_url,
        xp_reward
      });

      res.json({ success: true, lesson });
    } catch (error) {
      console.error("Create lesson error:", error);
      res.status(500).json({ error: "Error creating lesson" });
    }
  }

  // Create Quiz
  static async createQuiz(req, res) {
    try {
      const { lesson_id, title, description, time_limit, passing_score } = req.body;
      const teacherId = req.session.userId;

      const quiz = await Quiz.create({
        lesson_id,
        title,
        description,
        time_limit,
        passing_score,
        created_by: teacherId
      });

      res.json({ success: true, quiz });
    } catch (error) {
      console.error("Create quiz error:", error);
      res.status(500).json({ error: "Error creating quiz" });
    }
  }

  // List All Classes
  static async listClasses(req, res) {
    try {
      const teacherId = req.session.userId;

      console.log(`📚 Loading classes for teacher ID: ${teacherId}`);

      // Get success/error messages from session
      const successMessage = req.session.successMessage;
      const errorMessage = req.session.errorMessage;
      
      // Clear messages from session
      delete req.session.successMessage;
      delete req.session.errorMessage;

      // Fetch classes from database with student count
      const classes = await Class.findAll({
        where: {
          teacher_id: teacherId
        },
        include: [
          {
            model: User,
            as: 'students',
            attributes: ['id', 'first_name', 'last_name', 'email'],
            through: { attributes: [] }
          }
        ],
        order: [['created_at', 'DESC']]
      });

      console.log(`✅ Found ${classes.length} classes for teacher ${teacherId}`);

      // Transform classes data for the view
      const classesData = classes.map(classItem => {
        const classJson = classItem.toJSON();
        return {
          id: classJson.id,
          class_name: classJson.class_name,
          description: classJson.description,
          class_code: classJson.class_code,
          academic_year: classJson.academic_year,
          semester: classJson.semester,
          is_active: classJson.is_active,
          created_at: classJson.created_at ? new Date(classJson.created_at).toISOString().split('T')[0] : null,
          students: classJson.students || [],
          student_count: classJson.students ? classJson.students.length : 0
        };
      });

      res.render("teacher/classes", { 
        classes: classesData,
        user: req.session.user,
        successMessage: successMessage,
        errorMessage: errorMessage
      });
    } catch (error) {
      console.error("❌ List classes error:", error);
      
      // Fallback to empty array on error
      res.render("teacher/classes", { 
        classes: [],
        user: req.session.user,
        errorMessage: `Error loading classes: ${error.message}`
      });
    }
  }

  // View Class
  static async viewClass(req, res) {
    try {
      const { classId } = req.params;
      const teacherId = req.session.userId;

      console.log(`👁️ Loading class ${classId} for teacher ${teacherId}`);

      // Get success/error messages from session
      const successMessage = req.session.successMessage;
      const errorMessage = req.session.errorMessage;
      
      // Clear messages from session
      delete req.session.successMessage;
      delete req.session.errorMessage;

      // Fetch class from database with students
      const classData = await Class.findOne({
        where: {
          id: classId,
          teacher_id: teacherId // Ensure teacher owns this class
        },
        include: [
          {
            model: User,
            as: 'students',
            attributes: ['id', 'first_name', 'last_name', 'email', 'username', 'xp', 'level'],
            through: { 
              attributes: ['enrolled_at', 'status'],
              where: { status: 'active' }
            }
          }
        ]
      });

      if (!classData) {
        console.log(`❌ Class ${classId} not found or not owned by teacher ${teacherId}`);
        req.session.errorMessage = 'Class not found or you do not have permission to view it.';
        return res.redirect('/teacher/classes');
      }

      console.log(`✅ Class loaded: ${classData.class_name} with ${classData.students.length} students`);

      // Transform class data for the view
      const classJson = classData.toJSON();
      const transformedClassData = {
        id: classJson.id,
        class_name: classJson.class_name,
        description: classJson.description,
        class_code: classJson.class_code,
        academic_year: classJson.academic_year,
        semester: classJson.semester,
        is_active: classJson.is_active,
        created_at: classJson.created_at ? new Date(classJson.created_at).toISOString().split('T')[0] : null,
        students: classJson.students.map(student => ({
          id: student.id,
          first_name: student.first_name,
          last_name: student.last_name,
          email: student.email,
          student_id: student.username, // Using username as student ID for now
          xp: student.xp || 0,
          level: student.level || 1,
          enrolled_at: student.ClassEnrollment ? student.ClassEnrollment.enrolled_at : null
        }))
      };

      res.render("teacher/class-detail", { 
        classData: transformedClassData,
        user: req.session.user,
        successMessage: successMessage,
        errorMessage: errorMessage
      });
    } catch (error) {
      console.error("❌ View class error:", error);
      req.session.errorMessage = `Error loading class: ${error.message}`;
      res.redirect('/teacher/classes');
    }
  }

  // Add Student to Class
  static async addStudent(req, res) {
    try {
      const { classId } = req.params;
      const { studentEmail, studentId } = req.body;
      const teacherId = req.session.userId;

      console.log(`➕ Adding student to class ${classId}: ${studentEmail}`);

      // Validate input
      if (!studentEmail || !studentEmail.trim()) {
        throw new Error('Student email is required');
      }

      // Check if class exists and belongs to teacher
      const classData = await Class.findOne({
        where: {
          id: classId,
          teacher_id: teacherId
        }
      });

      if (!classData) {
        throw new Error('Class not found or you do not have permission to modify it');
      }

      // Find student by email
      const student = await User.findOne({
        where: {
          email: studentEmail.trim(),
          role: 'student'
        }
      });

      if (!student) {
        throw new Error(`No student found with email: ${studentEmail}`);
      }

      // Check if student is already enrolled
      const existingEnrollment = await ClassEnrollment.findOne({
        where: {
          class_id: classId,
          student_id: student.id
        }
      });

      if (existingEnrollment) {
        if (existingEnrollment.status === 'active') {
          throw new Error(`${student.first_name} ${student.last_name} is already enrolled in this class`);
        } else {
          // Reactivate enrollment
          await existingEnrollment.update({ status: 'active' });
          console.log(`✅ Reactivated enrollment for student ${student.id} in class ${classId}`);
        }
      } else {
        // Create new enrollment
        await ClassEnrollment.create({
          class_id: classId,
          student_id: student.id,
          status: 'active'
        });
        console.log(`✅ Created new enrollment for student ${student.id} in class ${classId}`);
      }

      req.session.successMessage = `${student.first_name} ${student.last_name} (${studentEmail}) has been added to the class successfully! 🎉`;

      res.redirect(`/teacher/classes/${classId}`);
    } catch (error) {
      console.error("❌ Add student error:", error);
      req.session.errorMessage = `Failed to add student: ${error.message}`;
      res.redirect(`/teacher/classes/${classId}`);
    }
  }

  // View Student Progress
  static async viewStudentProgress(req, res) {
    try {
      const { classId, studentId } = req.params;
      const teacherId = req.session.userId;

      console.log(`📊 Loading progress for student ${studentId} in class ${classId}`);

      // Verify class belongs to teacher
      const classData = await Class.findOne({
        where: {
          id: classId,
          teacher_id: teacherId
        }
      });

      if (!classData) {
        req.session.errorMessage = 'Class not found or you do not have permission to view it.';
        return res.redirect('/teacher/classes');
      }

      // Verify student is enrolled in class
      const enrollment = await ClassEnrollment.findOne({
        where: {
          class_id: classId,
          student_id: studentId,
          status: 'active'
        }
      });

      if (!enrollment) {
        req.session.errorMessage = 'Student not found in this class.';
        return res.redirect(`/teacher/classes/${classId}`);
      }

      // Get student data with progress
      const student = await User.findOne({
        where: {
          id: studentId,
          role: 'student'
        },
        include: [
          {
            model: StudentProgress,
            as: 'progress',
            include: [
              {
                model: Lesson,
                as: 'lesson',
                include: [
                  {
                    model: Module,
                    as: 'module',
                    include: [
                      {
                        model: Course,
                        as: 'course'
                      }
                    ]
                  }
                ]
              }
            ]
          }
        ]
      });

      if (!student) {
        req.session.errorMessage = 'Student not found.';
        return res.redirect(`/teacher/classes/${classId}`);
      }

      // Calculate progress statistics
      const completedLessons = student.progress.filter(p => p.status === 'completed').length;
      const totalXP = student.progress.reduce((sum, p) => sum + (p.xp_earned || 0), 0);
      
      // Group progress by course
      const courseProgress = {};
      student.progress.forEach(progress => {
        if (progress.lesson && progress.lesson.module && progress.lesson.module.course) {
          const course = progress.lesson.module.course;
          if (!courseProgress[course.id]) {
            courseProgress[course.id] = {
              id: course.id,
              title: course.title,
              lessons: [],
              completed: 0,
              total_xp: 0
            };
          }
          courseProgress[course.id].lessons.push(progress);
          if (progress.status === 'completed') {
            courseProgress[course.id].completed++;
            courseProgress[course.id].total_xp += progress.xp_earned || 0;
          }
        }
      });

      // Transform data for view
      const studentData = {
        id: student.id,
        first_name: student.first_name,
        last_name: student.last_name,
        email: student.email,
        student_id: student.username,
        progress: {
          overall_progress: completedLessons > 0 ? Math.round((completedLessons / student.progress.length) * 100) : 0,
          total_xp: student.xp || totalXP,
          level: student.level || 1,
          badges_earned: 0, // TODO: Calculate from badges table
          lessons_completed: completedLessons,
          total_lessons: student.progress.length,
          courses: Object.values(courseProgress).map(course => ({
            id: course.id,
            title: course.title,
            progress: course.lessons.length > 0 ? Math.round((course.completed / course.lessons.length) * 100) : 0,
            xp_earned: course.total_xp,
            status: course.completed === course.lessons.length ? 'completed' : 'in_progress'
          })),
          recent_activity: student.progress
            .filter(p => p.completed_at)
            .sort((a, b) => new Date(b.completed_at) - new Date(a.completed_at))
            .slice(0, 5)
            .map(p => ({
              type: 'lesson_completed',
              title: p.lesson ? p.lesson.title : 'Unknown Lesson',
              date: new Date(p.completed_at).toISOString().split('T')[0],
              xp: p.xp_earned || 0
            }))
        }
      };

      const classInfo = {
        id: classData.id,
        class_name: classData.class_name,
        class_code: classData.class_code
      };

      res.render("teacher/student-progress", { 
        student: studentData,
        classData: classInfo,
        user: req.session.user
      });
    } catch (error) {
      console.error("❌ View student progress error:", error);
      req.session.errorMessage = `Error loading student progress: ${error.message}`;
      res.redirect(`/teacher/classes/${classId}`);
    }
  }

  // Create New Class
  static async createClass(req, res) {
    try {
      const { class_name, description, academic_year, semester } = req.body;
      const teacherId = req.session.userId;

      console.log(`➕ Creating new class: ${class_name} for teacher ${teacherId}`);

      // Validate required fields
      if (!class_name || !class_name.trim()) {
        throw new Error('Class name is required');
      }

      // Generate unique class code
      const generateClassCode = () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let result = '';
        for (let i = 0; i < 6; i++) {
          result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
      };

      let classCode = generateClassCode();
      
      // Ensure class code is unique
      let existingClass = await Class.findOne({ where: { class_code: classCode } });
      while (existingClass) {
        classCode = generateClassCode();
        existingClass = await Class.findOne({ where: { class_code: classCode } });
      }

      // Create new class
      const newClass = await Class.create({
        teacher_id: teacherId,
        class_name: class_name.trim(),
        description: description ? description.trim() : null,
        class_code: classCode,
        academic_year: academic_year || null,
        semester: semester || null,
        is_active: true
      });

      console.log(`✅ Class created successfully with ID: ${newClass.id} and code: ${classCode}`);

      req.session.successMessage = `Class "${class_name}" has been created successfully! Class code: ${classCode} 🎉`;

      // Check if user wants to go to dashboard or classes list
      const redirectTo = req.body.redirect_to || 'dashboard';
      
      if (redirectTo === 'classes') {
        res.redirect('/teacher/classes');
      } else {
        res.redirect('/teacher/dashboard');
      }
    } catch (error) {
      console.error("❌ Create class error:", error);
      req.session.errorMessage = `Failed to create class: ${error.message}`;
      res.redirect('/teacher/classes');
    }
  }

  // Show Create Class Form
  static async createClassForm(req, res) {
    try {
      // Get error message from session
      const errorMessage = req.session.errorMessage;
      
      // Clear error message from session
      delete req.session.errorMessage;

      res.render("teacher/class-create", { 
        user: req.session.user,
        errorMessage: errorMessage
      });
    } catch (error) {
      console.error("Create class form error:", error);
      res.status(500).send("Error loading create class form");
    }
  }

  // Class Management Dashboard
  static async classManagement(req, res) {
    try {
      const { classId } = req.params;
      const teacherId = req.session.userId;

      console.log(`🎯 Loading class management for class ${classId} by teacher ${teacherId}`);

      // Get success/error messages from session
      const successMessage = req.session.successMessage;
      const errorMessage = req.session.errorMessage;
      
      // Clear messages from session
      delete req.session.successMessage;
      delete req.session.errorMessage;

      // Fetch class from database with students
      const classData = await Class.findOne({
        where: {
          id: classId,
          teacher_id: teacherId
        },
        include: [
          {
            model: User,
            as: 'students',
            attributes: ['id', 'first_name', 'last_name', 'email'],
            through: { 
              attributes: ['enrolled_at', 'status'],
              where: { status: 'active' }
            }
          }
        ]
      });

      if (!classData) {
        console.log(`❌ Class ${classId} not found or not owned by teacher ${teacherId}`);
        req.session.errorMessage = 'Class not found or you do not have permission to manage it.';
        return res.redirect('/teacher/classes');
      }

      console.log(`✅ Class management loaded: ${classData.class_name}`);

      // Transform class data for the view
      const classInfo = {
        id: classData.id,
        class_name: classData.class_name,
        description: classData.description,
        class_code: classData.class_code,
        academic_year: classData.academic_year,
        semester: classData.semester,
        is_active: classData.is_active,
        students: classData.students || []
      };

      // Mock statistics (TODO: Calculate from real data)
      const assignmentStats = {
        total: 5,
        active: 3,
        completed: 2
      };

      const progressStats = {
        average: 78,
        active: classData.students ? classData.students.length : 0,
        completed: 0
      };

      const gradeStats = {
        average: 85,
        graded: 12,
        pending: 3
      };

      res.render("teacher/class-management", { 
        classData: classInfo,
        assignmentStats: assignmentStats,
        progressStats: progressStats,
        gradeStats: gradeStats,
        user: req.session.user,
        successMessage: successMessage,
        errorMessage: errorMessage
      });
    } catch (error) {
      console.error("❌ Class management error:", error);
      req.session.errorMessage = `Error loading class management: ${error.message}`;
      res.redirect('/teacher/classes');
    }
  }

  // Class Assignments
  static async classAssignments(req, res) {
    try {
      const { classId } = req.params;
      const teacherId = req.session.userId;

      // Verify class belongs to teacher
      const classData = await Class.findOne({
        where: { id: classId, teacher_id: teacherId }
      });

      if (!classData) {
        req.session.errorMessage = 'Class not found or you do not have permission to view it.';
        return res.redirect('/teacher/classes');
      }

      res.render("teacher/assignments", { 
        classData: classData.toJSON(),
        user: req.session.user
      });
    } catch (error) {
      console.error("❌ Class assignments error:", error);
      req.session.errorMessage = `Error loading assignments: ${error.message}`;
      res.redirect('/teacher/classes');
    }
  }

  // Class Grades
  static async classGrades(req, res) {
    try {
      const { classId } = req.params;
      const teacherId = req.session.userId;

      // Verify class belongs to teacher
      const classData = await Class.findOne({
        where: { id: classId, teacher_id: teacherId }
      });

      if (!classData) {
        req.session.errorMessage = 'Class not found or you do not have permission to view it.';
        return res.redirect('/teacher/classes');
      }

      res.render("teacher/grades", { 
        classData: classData.toJSON(),
        user: req.session.user
      });
    } catch (error) {
      console.error("❌ Class grades error:", error);
      req.session.errorMessage = `Error loading grades: ${error.message}`;
      res.redirect('/teacher/classes');
    }
  }

  // Class Settings
  static async classSettings(req, res) {
    try {
      const { classId } = req.params;
      const teacherId = req.session.userId;

      // Get success/error messages from session
      const successMessage = req.session.successMessage;
      const errorMessage = req.session.errorMessage;
      
      // Clear messages from session
      delete req.session.successMessage;
      delete req.session.errorMessage;

      // Verify class belongs to teacher
      const classData = await Class.findOne({
        where: { id: classId, teacher_id: teacherId }
      });

      if (!classData) {
        req.session.errorMessage = 'Class not found or you do not have permission to view it.';
        return res.redirect('/teacher/classes');
      }

      res.render("teacher/class-settings", { 
        classData: classData.toJSON(),
        user: req.session.user,
        successMessage: successMessage,
        errorMessage: errorMessage
      });
    } catch (error) {
      console.error("❌ Class settings error:", error);
      req.session.errorMessage = `Error loading settings: ${error.message}`;
      res.redirect('/teacher/classes');
    }
  }

  // Update Class Settings
  static async updateClassSettings(req, res) {
    try {
      const { classId } = req.params;
      const teacherId = req.session.userId;
      const { class_name, description, academic_year, semester, is_active } = req.body;

      // Verify class belongs to teacher
      const classData = await Class.findOne({
        where: { id: classId, teacher_id: teacherId }
      });

      if (!classData) {
        req.session.errorMessage = 'Class not found or you do not have permission to modify it.';
        return res.redirect('/teacher/classes');
      }

      // Update class settings
      await classData.update({
        class_name: class_name.trim(),
        description: description ? description.trim() : null,
        academic_year: academic_year || null,
        semester: semester || null,
        is_active: is_active === 'true'
      });

      req.session.successMessage = `Class settings updated successfully! ✅`;
      res.redirect(`/teacher/classes/${classId}/settings`);
    } catch (error) {
      console.error("❌ Update class settings error:", error);
      req.session.errorMessage = `Failed to update settings: ${error.message}`;
      res.redirect(`/teacher/classes/${classId}/settings`);
    }
  }

  // View Student Details
  static async viewStudentDetails(req, res) {
    try {
      const { classId, studentId } = req.params;
      const teacherId = req.session.userId;

      console.log(`👤 Loading details for student ${studentId} in class ${classId}`);

      // Verify class belongs to teacher
      const classData = await Class.findOne({
        where: {
          id: classId,
          teacher_id: teacherId
        }
      });

      if (!classData) {
        req.session.errorMessage = 'Class not found or you do not have permission to view it.';
        return res.redirect('/teacher/classes');
      }

      // Verify student is enrolled in class and get enrollment details
      const enrollment = await ClassEnrollment.findOne({
        where: {
          class_id: classId,
          student_id: studentId
        },
        include: [
          {
            model: User,
            as: 'student',
            include: [
              {
                model: StudentProgress,
                as: 'progress',
                include: [
                  {
                    model: Lesson,
                    as: 'lesson',
                    include: [
                      {
                        model: Module,
                        as: 'module',
                        include: [
                          {
                            model: Course,
                            as: 'course'
                          }
                        ]
                      }
                    ]
                  }
                ]
              }
            ]
          }
        ]
      });

      if (!enrollment || !enrollment.student) {
        req.session.errorMessage = 'Student not found in this class.';
        return res.redirect(`/teacher/classes/${classId}`);
      }

      const student = enrollment.student;

      // Calculate statistics
      const completedLessons = student.progress.filter(p => p.status === 'completed').length;
      const inProgressLessons = student.progress.filter(p => p.status === 'in_progress').length;
      const totalTimeSpent = student.progress.reduce((sum, p) => sum + (p.time_spent || 0), 0);
      
      // Group by courses
      const courseStats = {};
      student.progress.forEach(progress => {
        if (progress.lesson && progress.lesson.module && progress.lesson.module.course) {
          const course = progress.lesson.module.course;
          if (!courseStats[course.id]) {
            courseStats[course.id] = {
              title: course.title,
              completed: 0,
              total: 0
            };
          }
          courseStats[course.id].total++;
          if (progress.status === 'completed') {
            courseStats[course.id].completed++;
          }
        }
      });

      const coursesCompleted = Object.values(courseStats).filter(c => c.completed === c.total).length;
      const coursesInProgress = Object.values(courseStats).filter(c => c.completed > 0 && c.completed < c.total).length;

      // Transform data for view
      const studentData = {
        id: student.id,
        first_name: student.first_name,
        last_name: student.last_name,
        email: student.email,
        student_id: student.username,
        joined_date: enrollment.enrolled_at ? new Date(enrollment.enrolled_at).toISOString().split('T')[0] : null,
        last_active: student.last_login ? new Date(student.last_login).toISOString().split('T')[0] : 'Never',
        profile: {
          grade_level: null, // TODO: Add to user model if needed
          school: null, // TODO: Add to user model if needed
          interests: [] // TODO: Add to user model if needed
        },
        stats: {
          total_xp: student.xp || 0,
          level: student.level || 1,
          badges_earned: 0, // TODO: Calculate from badges
          courses_completed: coursesCompleted,
          courses_in_progress: coursesInProgress,
          average_score: 0, // TODO: Calculate from quiz attempts
          time_spent: Math.round(totalTimeSpent / 3600) + ' hours' // Convert seconds to hours
        },
        achievements: [] // TODO: Get from badges table
      };

      const classInfo = {
        id: classData.id,
        class_name: classData.class_name,
        class_code: classData.class_code
      };

      res.render("teacher/student-details", { 
        student: studentData,
        classData: classInfo,
        user: req.session.user
      });
    } catch (error) {
      console.error("❌ View student details error:", error);
      req.session.errorMessage = `Error loading student details: ${error.message}`;
      res.redirect(`/teacher/classes/${classId}`);
    }
  }

  // Track Student Progress
  static async trackProgress(req, res) {
    try {
      const { classId } = req.params;
      const teacherId = req.session.userId;

      console.log(`📊 Loading progress tracking for class ${classId} by teacher ${teacherId}`);

      // Get success/error messages from session
      const successMessage = req.session.successMessage;
      const errorMessage = req.session.errorMessage;
      
      // Clear messages from session
      delete req.session.successMessage;
      delete req.session.errorMessage;

      // Fetch class from database with students and their progress
      const classData = await Class.findOne({
        where: {
          id: classId,
          teacher_id: teacherId // Ensure teacher owns this class
        },
        include: [
          {
            model: User,
            as: 'students',
            attributes: ['id', 'first_name', 'last_name', 'email', 'username', 'xp', 'level'],
            through: { 
              attributes: ['enrolled_at', 'status'],
              where: { status: 'active' }
            },
            include: [
              {
                model: StudentProgress,
                as: 'progress',
                attributes: ['status', 'progress_percentage', 'xp_earned', 'completed_at'],
                include: [
                  {
                    model: Lesson,
                    as: 'lesson',
                    attributes: ['id', 'title']
                  }
                ]
              }
            ]
          }
        ]
      });

      if (!classData) {
        console.log(`❌ Class ${classId} not found or not owned by teacher ${teacherId}`);
        req.session.errorMessage = 'Class not found or you do not have permission to view it.';
        return res.redirect('/teacher/classes');
      }

      console.log(`✅ Class loaded: ${classData.class_name} with ${classData.students.length} students`);

      // Calculate progress statistics for each student
      const studentsWithProgress = classData.students.map(student => {
        const completedLessons = student.progress.filter(p => p.status === 'completed').length;
        const totalLessons = student.progress.length;
        const overallProgress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
        const totalXPEarned = student.progress.reduce((sum, p) => sum + (p.xp_earned || 0), 0);

        return {
          id: student.id,
          first_name: student.first_name,
          last_name: student.last_name,
          email: student.email,
          student_id: student.username,
          progress: overallProgress,
          xp: student.xp || totalXPEarned,
          level: student.level || 1,
          lessons_completed: completedLessons,
          total_lessons: totalLessons,
          enrolled_at: student.ClassEnrollment ? student.ClassEnrollment.enrolled_at : null
        };
      });

      // Transform class data for the view
      const classInfo = {
        id: classData.id,
        class_name: classData.class_name,
        description: classData.description,
        class_code: classData.class_code,
        students: studentsWithProgress
      };

      // Calculate class-wide statistics
      const classStats = {
        total_students: studentsWithProgress.length,
        average_progress: studentsWithProgress.length > 0 
          ? Math.round(studentsWithProgress.reduce((sum, s) => sum + s.progress, 0) / studentsWithProgress.length)
          : 0,
        total_lessons_completed: studentsWithProgress.reduce((sum, s) => sum + s.lessons_completed, 0),
        active_this_week: studentsWithProgress.length // TODO: Calculate based on recent activity
      };

      res.render("teacher/progress-tracking", { 
        classData: classInfo,
        classStats: classStats,
        user: req.session.user,
        successMessage: successMessage,
        errorMessage: errorMessage
      });
    } catch (error) {
      console.error("❌ Track progress error:", error);
      req.session.errorMessage = `Error loading progress: ${error.message}`;
      res.redirect('/teacher/classes');
    }
  }

  // Generate Report
  static async generateReport(req, res) {
    try {
      const { classId } = req.params;

      // Mock class data for demo
      const mockClassData = {
        id: classId || 1,
        class_name: "Advanced JavaScript Programming",
        description: "Learn modern JavaScript concepts and frameworks",
        class_code: "JS2024A",
        students: [
          {
            id: 1,
            first_name: "Alice",
            last_name: "Johnson",
            email: "alice.johnson@email.com"
          },
          {
            id: 2,
            first_name: "Bob",
            last_name: "Smith",
            email: "bob.smith@email.com"
          },
          {
            id: 3,
            first_name: "Carol",
            last_name: "Davis",
            email: "carol.davis@email.com"
          }
        ]
      };

      const mockReportData = [
        {
          title: "Overall Class Performance",
          description: "The class is performing well with an average completion rate of 85%. Most students are actively engaged."
        },
        {
          title: "Top Performers",
          description: "Alice Johnson and Carol Davis are leading the class with excellent progress and high XP scores."
        },
        {
          title: "Areas for Improvement",
          description: "Some students need additional support with advanced JavaScript concepts. Consider additional practice sessions."
        }
      ];

      res.render("teacher/report", { classData: mockClassData, reportData: mockReportData });
    } catch (error) {
      console.error("Generate report error:", error);
      res.status(500).send("Error generating report");
    }
  }

  // ============================================
  // CLASS MANAGEMENT METHODS
  // ============================================

  // Class Management Dashboard
  static async classManagement(req, res) {
    try {
      const { classId } = req.params;
      const teacherId = req.session.userId;

      console.log(`🎯 Loading class management for class ${classId} by teacher ${teacherId}`);

      // Verify class belongs to teacher
      const classData = await Class.findOne({
        where: {
          id: classId,
          teacher_id: teacherId
        },
        include: [
          {
            model: User,
            as: 'students',
            attributes: ['id', 'first_name', 'last_name', 'email'],
            through: { 
              attributes: [],
              where: { status: 'active' }
            }
          }
        ]
      });

      if (!classData) {
        req.session.errorMessage = 'Class not found or you do not have permission to access it.';
        return res.redirect('/teacher/classes');
      }

      console.log(`✅ Class management loaded: ${classData.class_name}`);

      // Get class statistics
      const [assignmentCount] = await sequelize.query(
        'SELECT COUNT(*) as count FROM assignments WHERE class_id = ?',
        { replacements: [classId] }
      );

      const [gradeCount] = await sequelize.query(
        'SELECT COUNT(*) as count FROM grades g JOIN assignments a ON g.assignment_id = a.id WHERE a.class_id = ?',
        { replacements: [classId] }
      );

      const [activeAssignments] = await sequelize.query(
        'SELECT COUNT(*) as count FROM assignments WHERE class_id = ? AND status = "published"',
        { replacements: [classId] }
      );

      const [avgProgress] = await sequelize.query(
        'SELECT AVG(percentage) as avg FROM grades g JOIN assignments a ON g.assignment_id = a.id WHERE a.class_id = ? AND g.status = "graded"',
        { replacements: [classId] }
      );

      const classInfo = {
        id: classData.id,
        class_name: classData.class_name,
        description: classData.description,
        class_code: classData.class_code,
        students: classData.students || []
      };

      // Statistics for the management cards
      const assignmentStats = {
        total: assignmentCount[0]?.count || 0,
        active: activeAssignments[0]?.count || 0
      };

      const progressStats = {
        average: Math.round(avgProgress[0]?.avg || 0),
        active: classData.students.length
      };

      const gradeStats = {
        average: Math.round(avgProgress[0]?.avg || 0),
        graded: gradeCount[0]?.count || 0
      };

      res.render("teacher/class-management", { 
        classData: classInfo,
        assignmentStats: assignmentStats,
        progressStats: progressStats,
        gradeStats: gradeStats,
        user: req.session.user
      });
    } catch (error) {
      console.error("❌ Class management error:", error);
      req.session.errorMessage = `Error loading class management: ${error.message}`;
      res.redirect('/teacher/classes');
    }
  }

  // Assignments Management
  static async manageAssignments(req, res) {
    try {
      const { classId } = req.params;
      const teacherId = req.session.userId;

      // Verify class belongs to teacher
      const classData = await Class.findOne({
        where: { id: classId, teacher_id: teacherId }
      });

      if (!classData) {
        req.session.errorMessage = 'Class not found.';
        return res.redirect('/teacher/classes');
      }

      // Get assignments for this class
      const assignments = await Assignment.findAll({
        where: { class_id: classId },
        include: [
          {
            model: Grade,
            as: 'grades',
            attributes: ['id', 'status', 'points_earned', 'max_points']
          }
        ],
        order: [['created_at', 'DESC']]
      });

      const assignmentsData = assignments.map(assignment => {
        const assignmentJson = assignment.toJSON();
        const submissionCount = assignmentJson.grades ? assignmentJson.grades.length : 0;
        const gradedCount = assignmentJson.grades ? assignmentJson.grades.filter(g => g.status === 'graded').length : 0;
        
        return {
          ...assignmentJson,
          submission_count: submissionCount,
          graded_count: gradedCount,
          due_date_formatted: assignmentJson.due_date ? new Date(assignmentJson.due_date).toISOString().split('T')[0] : null
        };
      });

      // Calculate assignment statistics
      const assignmentStats = {
        total: assignments.length,
        active: assignments.filter(a => a.status === 'published').length,
        draft: assignments.filter(a => a.status === 'draft').length,
        total_submissions: assignments.reduce((sum, a) => sum + (a.grades ? a.grades.length : 0), 0),
        pending_review: assignments.reduce((sum, a) => sum + (a.grades ? a.grades.filter(g => g.status === 'submitted').length : 0), 0)
      };

      res.render("teacher/assignments", { 
        classData: classData.toJSON(),
        assignments: assignmentsData,
        assignmentStats: assignmentStats,
        user: req.session.user
      });
    } catch (error) {
      console.error("❌ Manage assignments error:", error);
      req.session.errorMessage = `Error loading assignments: ${error.message}`;
      res.redirect(`/teacher/classes/${classId}/manage`);
    }
  }

  // Grades Management
  static async manageGrades(req, res) {
    try {
      const { classId } = req.params;
      const teacherId = req.session.userId;

      // Verify class belongs to teacher
      const classData = await Class.findOne({
        where: { id: classId, teacher_id: teacherId },
        include: [
          {
            model: User,
            as: 'students',
            attributes: ['id', 'first_name', 'last_name', 'email'],
            through: { 
              attributes: [],
              where: { status: 'active' }
            }
          }
        ]
      });

      if (!classData) {
        req.session.errorMessage = 'Class not found.';
        return res.redirect('/teacher/classes');
      }

      // Get assignments and grades for this class
      const assignments = await Assignment.findAll({
        where: { class_id: classId },
        include: [
          {
            model: Grade,
            as: 'grades',
            include: [
              {
                model: User,
                as: 'student',
                attributes: ['id', 'first_name', 'last_name']
              }
            ]
          }
        ],
        order: [['created_at', 'DESC']]
      });

      // Calculate grade statistics
      const gradeStats = {
        total_assignments: assignments.length,
        total_submissions: assignments.reduce((sum, a) => sum + a.grades.length, 0),
        graded_submissions: assignments.reduce((sum, a) => sum + a.grades.filter(g => g.status === 'graded').length, 0),
        average_grade: 0 // TODO: Calculate actual average
      };

      res.render("teacher/grades", { 
        classData: classData.toJSON(),
        assignments: assignments.map(a => a.toJSON()),
        gradeStats: gradeStats,
        user: req.session.user
      });
    } catch (error) {
      console.error("❌ Manage grades error:", error);
      req.session.errorMessage = `Error loading grades: ${error.message}`;
      res.redirect(`/teacher/classes/${classId}/manage`);
    }
  }

  // Class Settings
  static async classSettings(req, res) {
    try {
      const { classId } = req.params;
      const teacherId = req.session.userId;

      // Get success/error messages from session
      const successMessage = req.session.successMessage;
      const errorMessage = req.session.errorMessage;
      
      // Clear messages from session
      delete req.session.successMessage;
      delete req.session.errorMessage;

      // Verify class belongs to teacher
      const classData = await Class.findOne({
        where: { id: classId, teacher_id: teacherId }
      });

      if (!classData) {
        req.session.errorMessage = 'Class not found.';
        return res.redirect('/teacher/classes');
      }

      res.render("teacher/class-settings", { 
        classData: classData.toJSON(),
        user: req.session.user,
        successMessage: successMessage,
        errorMessage: errorMessage
      });
    } catch (error) {
      console.error("❌ Class settings error:", error);
      req.session.errorMessage = `Error loading class settings: ${error.message}`;
      res.redirect(`/teacher/classes/${classId}/manage`);
    }
  }

  // Update Class Settings
  static async updateClassSettings(req, res) {
    try {
      const { classId } = req.params;
      const teacherId = req.session.userId;
      const { class_name, description, academic_year, semester, is_active } = req.body;

      // Verify class belongs to teacher
      const classData = await Class.findOne({
        where: { id: classId, teacher_id: teacherId }
      });

      if (!classData) {
        req.session.errorMessage = 'Class not found.';
        return res.redirect('/teacher/classes');
      }

      // Update class settings
      await classData.update({
        class_name: class_name || classData.class_name,
        description: description || classData.description,
        academic_year: academic_year || classData.academic_year,
        semester: semester || classData.semester,
        is_active: is_active === 'true'
      });

      req.session.successMessage = 'Class settings updated successfully! ✅';
      res.redirect(`/teacher/classes/${classId}/settings`);
    } catch (error) {
      console.error("❌ Update class settings error:", error);
      req.session.errorMessage = `Error updating class settings: ${error.message}`;
      res.redirect(`/teacher/classes/${classId}/settings`);
    }
  }

  // Create Assignment
  static async createAssignment(req, res) {
    try {
      const { classId } = req.params;
      const teacherId = req.session.userId;
      const { 
        title, 
        description, 
        instructions, 
        due_date, 
        max_points, 
        xp_reward, 
        assignment_type,
        allow_late_submission,
        late_penalty 
      } = req.body;

      // Verify class belongs to teacher
      const classData = await Class.findOne({
        where: { id: classId, teacher_id: teacherId }
      });

      if (!classData) {
        req.session.errorMessage = 'Class not found.';
        return res.redirect('/teacher/classes');
      }

      // Create assignment
      const assignment = await Assignment.create({
        class_id: classId,
        teacher_id: teacherId,
        title: title,
        description: description,
        instructions: instructions,
        due_date: due_date ? new Date(due_date) : null,
        max_points: parseInt(max_points) || 100,
        xp_reward: parseInt(xp_reward) || 0,
        assignment_type: assignment_type || 'homework',
        allow_late_submission: allow_late_submission === 'true',
        late_penalty: parseInt(late_penalty) || 0,
        status: 'published'
      });

      req.session.successMessage = `Assignment "${title}" created successfully! 🎉`;
      res.redirect(`/teacher/classes/${classId}/assignments`);
    } catch (error) {
      console.error("❌ Create assignment error:", error);
      req.session.errorMessage = `Error creating assignment: ${error.message}`;
      res.redirect(`/teacher/classes/${classId}/assignments`);
    }
  }
}

export default TeacherController;
