import { User, Course, Badge, Class, AuditLog } from "../models/FunlearnModels.js";
import { sequelize } from "../models/db.js";

class FunlearnAdminController {
  // Admin Dashboard
  static async dashboard(req, res) {
    try {
      // Fetch real stats from database
      const total_students = await User.count({ where: { role: 'student' } });
      const total_teachers = await User.count({ where: { role: 'teacher' } });
      const total_courses = await Course.count({ where: { is_published: true } });
      const total_classes = await Class.count();
      
      const completionsResult = await sequelize.query(
        'SELECT COUNT(*) as count FROM student_progress WHERE status = "completed"',
        { type: sequelize.QueryTypes.SELECT }
      );
      const total_completions = completionsResult[0].count;

      const stats = {
        total_students,
        total_teachers,
        total_courses,
        total_classes,
        total_completions
      };

      // Fetch recent users
      const recentUsers = await User.findAll({
        order: [['created_at', 'DESC']],
        limit: 5
      });

      res.render("admin/dashboard", { 
        stats, 
        recentUsers,
        user: req.session.user
      });
    } catch (error) {
      console.error("Admin dashboard error:", error);
      res.status(500).send("Error loading dashboard");
    }
  }

  // User Management
  static async manageUsers(req, res) {
    try {
      // Mock users data
      const mockUsers = [
        { 
          id: 1, 
          first_name: "System", 
          last_name: "Administrator", 
          email: "admin@funlearn.com", 
          username: "admin",
          role: "admin", 
          xp: 0, 
          level: 1, 
          is_active: true,
          created_at: "2025-01-01"
        },
        { 
          id: 2, 
          first_name: "John", 
          last_name: "Teacher", 
          email: "teacher@funlearn.com", 
          username: "teacher1",
          role: "teacher", 
          xp: 0, 
          level: 1, 
          is_active: true,
          created_at: "2025-01-02"
        },
        { 
          id: 3, 
          first_name: "Jane", 
          last_name: "Student", 
          email: "student@funlearn.com", 
          username: "student1",
          role: "student", 
          xp: 250, 
          level: 3, 
          is_active: true,
          created_at: "2025-01-03"
        },
        { 
          id: 4, 
          first_name: "Alice", 
          last_name: "Johnson", 
          email: "alice@example.com", 
          username: "alice_j",
          role: "student", 
          xp: 1250, 
          level: 5, 
          is_active: true,
          created_at: "2025-01-04"
        },
        { 
          id: 5, 
          first_name: "Bob", 
          last_name: "Smith", 
          email: "bob@example.com", 
          username: "bob_s",
          role: "student", 
          xp: 980, 
          level: 4, 
          is_active: true,
          created_at: "2025-01-05"
        }
      ];

      res.render("admin/users", { users: mockUsers, user: req.session.user });
    } catch (error) {
      console.error("Manage users error:", error);
      res.status(500).send("Error loading users");
    }
  }

  // Show Create User Form
  static async createUserForm(req, res) {
    try {
      res.render("admin/user-create", { 
        user: req.session.user,
        error: null
      });
    } catch (error) {
      console.error("Create user form error:", error);
      res.status(500).send("Error loading form");
    }
  }

  // View User Details
  static async viewUser(req, res) {
    try {
      const { userId } = req.params;
      
      const viewedUser = await User.findByPk(userId);
      
      if (!viewedUser) {
        return res.status(404).send("User not found");
      }

      res.render("admin/user-detail", {
        user: req.session.user,
        viewedUser
      });
    } catch (error) {
      console.error("View user error:", error);
      res.status(500).send("Error loading user");
    }
  }

  // Create User
  static async createUser(req, res) {
    try {
      const { username, email, password, role, first_name, last_name } = req.body;

      const user = await User.create({
        username,
        email,
        password,
        role,
        first_name,
        last_name
      });

      res.redirect("/admin/users");
    } catch (error) {
      console.error("Create user error:", error);
      res.render("admin/user-create", {
        user: req.session.user,
        error: error.message || "Error creating user"
      });
    }
  }

  // Update User
  static async updateUser(req, res) {
    try {
      const { userId } = req.params;
      const { username, email, role, first_name, last_name, is_active } = req.body;

      const user = await User.findByPk(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      await user.update({
        username,
        email,
        role,
        first_name,
        last_name,
        is_active
      });

      res.json({ success: true, user });
    } catch (error) {
      console.error("Update user error:", error);
      res.status(500).json({ error: "Error updating user" });
    }
  }

  // Delete User
  static async deleteUser(req, res) {
    try {
      const { userId } = req.params;

      const user = await User.findByPk(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      await user.destroy();
      res.json({ success: true });
    } catch (error) {
      console.error("Delete user error:", error);
      res.status(500).json({ error: "Error deleting user" });
    }
  }

  // Course Management
  static async manageCourses(req, res) {
    try {
      const courses = await Course.findAll({
        include: [{ model: User, as: 'creator' }],
        order: [['created_at', 'DESC']]
      });

      res.render("admin/courses", { courses });
    } catch (error) {
      console.error("Manage courses error:", error);
      res.status(500).send("Error loading courses");
    }
  }

  // Approve Course
  static async approveCourse(req, res) {
    try {
      const { courseId } = req.params;

      const course = await Course.findByPk(courseId);
      if (!course) {
        return res.status(404).json({ error: "Course not found" });
      }

      course.is_published = true;
      await course.save();

      res.json({ success: true, course });
    } catch (error) {
      console.error("Approve course error:", error);
      res.status(500).json({ error: "Error approving course" });
    }
  }

  // Badge Management
  static async manageBadges(req, res) {
    try {
      const badges = await Badge.findAll({
        order: [['created_at', 'DESC']]
      });

      res.render("admin/badges", { badges });
    } catch (error) {
      console.error("Manage badges error:", error);
      res.status(500).send("Error loading badges");
    }
  }

  // Create Badge
  static async createBadge(req, res) {
    try {
      const { name, description, badge_type, xp_reward, rarity } = req.body;

      const badge = await Badge.create({
        name,
        description,
        badge_type,
        xp_reward,
        rarity
      });

      res.json({ success: true, badge });
    } catch (error) {
      console.error("Create badge error:", error);
      res.status(500).json({ error: "Error creating badge" });
    }
  }

  // System Analytics
  static async analytics(req, res) {
    try {
      // Get total counts
      const totalStudents = await User.count({ where: { role: 'student' } });
      const totalTeachers = await User.count({ where: { role: 'teacher' } });
      const totalCourses = await Course.count({ where: { is_published: true } });
      const totalCompletions = await sequelize.query(
        'SELECT COUNT(*) as count FROM student_progress WHERE status = "completed"',
        { type: sequelize.QueryTypes.SELECT }
      );

      // Get course difficulty breakdown
      const beginnerCourses = await Course.count({ where: { difficulty_level: 'beginner', is_published: true } });
      const intermediateCourses = await Course.count({ where: { difficulty_level: 'intermediate', is_published: true } });
      const advancedCourses = await Course.count({ where: { difficulty_level: 'advanced', is_published: true } });

      // Get popular courses
      const popularCourses = await sequelize.query(`
        SELECT 
          c.id,
          c.title,
          c.category,
          c.difficulty_level,
          c.total_xp,
          COUNT(DISTINCT sp.student_id) as student_count
        FROM courses c
        LEFT JOIN modules m ON c.id = m.course_id
        LEFT JOIN lessons l ON m.id = l.module_id
        LEFT JOIN student_progress sp ON l.id = sp.lesson_id
        WHERE c.is_published = true
        GROUP BY c.id
        ORDER BY student_count DESC
        LIMIT 5
      `, { type: sequelize.QueryTypes.SELECT });

      // Get top students
      const topStudents = await sequelize.query(`
        SELECT 
          u.id,
          u.first_name,
          u.last_name,
          u.xp,
          u.level,
          COUNT(sp.id) as completed_lessons
        FROM users u
        LEFT JOIN student_progress sp ON u.id = sp.student_id AND sp.status = 'completed'
        WHERE u.role = 'student'
        GROUP BY u.id
        ORDER BY u.xp DESC
        LIMIT 5
      `, { type: sequelize.QueryTypes.SELECT });

      const stats = {
        totalStudents,
        totalTeachers,
        totalCourses,
        totalCompletions: totalCompletions[0].count,
        beginnerCourses,
        intermediateCourses,
        advancedCourses
      };

      res.render("admin/analytics", { 
        stats, 
        popularCourses, 
        topStudents,
        user: req.session.user
      });
    } catch (error) {
      console.error("Analytics error:", error);
      res.status(500).send("Error loading analytics");
    }
  }

  // Audit Logs
  static async auditLogs(req, res) {
    try {
      // Fetch recent activity logs from database
      const logs = await sequelize.query(`
        SELECT 
          'user_created' as action,
          CONCAT(u.first_name, ' ', u.last_name) as user_name,
          u.role as details,
          u.created_at as timestamp
        FROM users u
        ORDER BY u.created_at DESC
        LIMIT 50
      `, { type: sequelize.QueryTypes.SELECT });

      res.render("admin/audit-logs", { 
        logs,
        user: req.session.user
      });
    } catch (error) {
      console.error("Audit logs error:", error);
      res.status(500).send("Error loading audit logs");
    }
  }

  // System Settings
  static async settings(req, res) {
    try {
      const settings = {
        systemName: "FUNLEARN",
        xpPerLesson: 10,
        xpPerQuiz: 25,
        levelUpThreshold: 100,
        enableBadges: true,
        enableLeaderboard: true
      };

      res.render("admin/settings", { 
        settings,
        user: req.session.user
      });
    } catch (error) {
      console.error("Settings error:", error);
      res.status(500).send("Error loading settings");
    }
  }
}

export default FunlearnAdminController;
