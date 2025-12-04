import { User, Course, Module, Lesson, StudentProgress } from "../models/FunlearnModels.js";

class StudentController {
  // Student Dashboard
  static async dashboard(req, res) {
    try {
      const student = req.session.user;
      const studentId = student.id;
      
      // Fetch recent lessons in progress
      const recentLessons = await StudentProgress.findAll({
        where: {
          student_id: studentId,
          status: 'in_progress'
        },
        include: [{
          model: Lesson,
          as: 'lesson'
        }],
        order: [['updated_at', 'DESC']],
        limit: 5
      });

      // Count completed lessons
      const completedCount = await StudentProgress.count({
        where: {
          student_id: studentId,
          status: 'completed'
        }
      });

      // Fetch available published courses (limit to 4 for dashboard)
      const availableCourses = await Course.findAll({
        where: {
          is_published: true
        },
        include: [{
          model: Module,
          as: 'modules',
          required: false
        }],
        order: [['created_at', 'DESC']],
        limit: 4
      });

      // Fetch earned badges (using mock data for now as badge system needs implementation)
      const mockBadges = [
        { name: "First Steps", rarity: "common" },
        { name: "Quick Learner", rarity: "rare" }
      ];

      // Get updated user data from database
      const user = await User.findByPk(studentId);

      res.render("student/dashboard", {
        student: user,
        user: user,
        xp: user.xp || 0,
        level: user.level || 1,
        badges: mockBadges,
        recentLessons,
        completedCount,
        availableCourses,
        notifications: []
      });
    } catch (error) {
      console.error("Dashboard error:", error);
      res.status(500).send("Error loading dashboard");
    }
  }

  // Browse Courses
  static async browseCourses(req, res) {
    try {
      // Fetch all published courses from the database with their modules
      const courses = await Course.findAll({
        where: {
          is_published: true
        },
        include: [{
          model: Module,
          as: 'modules',
          required: false
        }],
        order: [['created_at', 'DESC']]
      });

      res.render("student/courses", { courses, user: req.session.user });
    } catch (error) {
      console.error("Browse courses error:", error);
      res.status(500).send("Error loading courses");
    }
  }

  // View Course Details
  static async viewCourse(req, res) {
    try {
      const { courseId } = req.params;
      const studentId = req.session.user.id;

      // Fetch course with modules and lessons
      const course = await Course.findByPk(courseId, {
        include: [{
          model: Module,
          as: 'modules',
          include: [{
            model: Lesson,
            as: 'lessons'
          }]
        }]
      });

      if (!course) {
        return res.status(404).send("Course not found");
      }

      // Fetch student progress for this course
      const progress = await StudentProgress.findAll({
        where: {
          student_id: studentId
        },
        include: [{
          model: Lesson,
          as: 'lesson',
          include: [{
            model: Module,
            as: 'module',
            where: { course_id: courseId }
          }]
        }]
      });

      res.render("student/course-detail", { course, progress, user: req.session.user });
    } catch (error) {
      console.error("View course error:", error);
      res.status(500).send("Error loading course");
    }
  }

  // Start Lesson
  static async startLesson(req, res) {
    try {
      const { lessonId } = req.params;
      const studentId = req.session.user.id;

      // Fetch lesson with module info
      const lesson = await Lesson.findByPk(lessonId, {
        include: [{
          model: Module,
          as: 'module'
        }]
      });

      if (!lesson) {
        return res.status(404).send("Lesson not found");
      }

      // Get or create student progress
      let progress = await StudentProgress.findOne({
        where: {
          student_id: studentId,
          lesson_id: lessonId
        }
      });

      if (!progress) {
        progress = await StudentProgress.create({
          student_id: studentId,
          lesson_id: lessonId,
          status: 'in_progress',
          progress_percentage: 0
        });
      }

      res.render("student/lesson", { lesson, progress, user: req.session.user });
    } catch (error) {
      console.error("Start lesson error:", error);
      res.status(500).send("Error loading lesson");
    }
  }

  // Complete Lesson
  static async completeLesson(req, res) {
    try {
      const { lessonId } = req.params;
      const studentId = req.session.user.id;

      // Get lesson to find XP reward
      const lesson = await Lesson.findByPk(lessonId);
      if (!lesson) {
        return res.status(404).json({ error: "Lesson not found" });
      }

      // Update student progress
      const progress = await StudentProgress.findOne({
        where: {
          student_id: studentId,
          lesson_id: lessonId
        }
      });

      if (progress) {
        await progress.update({
          status: 'completed',
          progress_percentage: 100,
          completed_at: new Date()
        });
      }

      // Update user XP
      const user = await User.findByPk(studentId);
      const xpEarned = lesson.xp_reward || 10;
      const newXp = (user.xp || 0) + xpEarned;
      const oldLevel = user.level || 1;
      const newLevel = Math.floor(newXp / 100) + 1;
      const leveledUp = newLevel > oldLevel;

      await user.update({
        xp: newXp,
        level: newLevel
      });

      // Update session
      req.session.user.xp = newXp;
      req.session.user.level = newLevel;

      res.json({ 
        success: true, 
        xp_earned: xpEarned, 
        new_level: newLevel,
        leveledUp
      });
    } catch (error) {
      console.error("Complete lesson error:", error);
      res.status(500).json({ error: "Error completing lesson" });
    }
  }

  // View Leaderboard
  static async leaderboard(req, res) {
    try {
      // Mock leaderboard data
      const mockStudents = [
        { first_name: "Alice", last_name: "Johnson", xp: 1250, level: 5, streak_days: 15 },
        { first_name: "Bob", last_name: "Smith", xp: 980, level: 4, streak_days: 8 },
        { first_name: "Carol", last_name: "Davis", xp: 750, level: 3, streak_days: 12 },
        { first_name: "David", last_name: "Wilson", xp: 650, level: 3, streak_days: 5 },
        { first_name: "Emma", last_name: "Brown", xp: 500, level: 2, streak_days: 3 }
      ];

      res.render("student/leaderboard", { students: mockStudents, user: req.session.user });
    } catch (error) {
      console.error("Leaderboard error:", error);
      res.status(500).send("Error loading leaderboard");
    }
  }

  // View Badges
  static async viewBadges(req, res) {
    try {
      // Mock badge data
      const earnedBadges = [
        { name: "First Steps", description: "Complete your first lesson", rarity: "common", xp_reward: 10 },
        { name: "Quick Learner", description: "Complete 5 lessons in one day", rarity: "rare", xp_reward: 50 }
      ];

      const allBadges = [
        { name: "First Steps", description: "Complete your first lesson", rarity: "common", xp_reward: 10, earned: true },
        { name: "Quick Learner", description: "Complete 5 lessons in one day", rarity: "rare", xp_reward: 50, earned: true },
        { name: "Quiz Master", description: "Pass 10 quizzes", rarity: "rare", xp_reward: 50, earned: false },
        { name: "Speed Learner", description: "Complete a course in under 1 week", rarity: "epic", xp_reward: 100, earned: false },
        { name: "Perfect Score", description: "Get 100% on any quiz", rarity: "rare", xp_reward: 25, earned: false },
        { name: "Dedicated Student", description: "Maintain a 7-day login streak", rarity: "rare", xp_reward: 50, earned: false },
        { name: "Knowledge Seeker", description: "Complete 5 courses", rarity: "epic", xp_reward: 200, earned: false },
        { name: "Champion", description: "Reach #1 on the leaderboard", rarity: "legendary", xp_reward: 500, earned: false }
      ];

      res.render("student/badges", { 
        earnedBadges,
        allBadges,
        user: req.session.user
      });
    } catch (error) {
      console.error("View badges error:", error);
      res.status(500).send("Error loading badges");
    }
  }
}

export default StudentController;
