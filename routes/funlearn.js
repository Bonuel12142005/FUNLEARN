import express from "express";
import StudentController from "../controllers/StudentController.js";
import TeacherController from "../controllers/TeacherController.js";
import FunlearnAdminController from "../controllers/FunlearnAdminController.js";

const router = express.Router();

// Public routes
router.get("/", (req, res) => res.render("landing"));
router.get("/login", (req, res) => res.render("login"));
router.get("/register", (req, res) => res.render("register"));

// Temporary auth routes (basic implementation)
router.post("/auth/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Simple demo login - in production, use proper authentication
    const demoAccounts = {
      'admin': { password: 'admin123', role: 'admin', id: 1, first_name: 'System', last_name: 'Administrator' },
      'teacher1': { password: 'teacher123', role: 'teacher', id: 2, first_name: 'John', last_name: 'Teacher' },
      'student1': { password: 'student123', role: 'student', id: 3, first_name: 'Jane', last_name: 'Student', xp: 250, level: 3 }
    };
    
    const user = demoAccounts[username];
    if (user && user.password === password) {
      req.session.userId = user.id;
      req.session.user = user;
      
      // Redirect based on role
      if (user.role === 'admin') {
        res.redirect('/admin/dashboard');
      } else if (user.role === 'teacher') {
        res.redirect('/teacher/dashboard');
      } else {
        res.redirect('/student/dashboard');
      }
    } else {
      res.render("login", { error: "Invalid username or password" });
    }
  } catch (error) {
    console.error("Login error:", error);
    res.render("login", { error: "Login failed" });
  }
});

router.post("/auth/register", (req, res) => {
  // Simple demo registration
  res.render("register", { error: "Registration is currently disabled in demo mode. Use demo accounts." });
});

router.get("/logout", (req, res) => {
  req.session.destroy();
  res.redirect("/");
});

// Middleware to check authentication
const requireAuth = (req, res, next) => {
  if (req.session.userId) {
    next();
  } else {
    res.redirect("/login");
  }
};

const requireRole = (role) => (req, res, next) => {
  if (req.session.user && req.session.user.role === role) {
    next();
  } else {
    res.status(403).send("Access denied");
  }
};

// Student routes
router.get("/student/dashboard", requireAuth, requireRole('student'), StudentController.dashboard);
router.get("/student/courses", requireAuth, requireRole('student'), StudentController.browseCourses);
router.get("/student/courses/:courseId", requireAuth, requireRole('student'), StudentController.viewCourse);
router.get("/student/lessons/:lessonId", requireAuth, requireRole('student'), StudentController.startLesson);
router.post("/student/lessons/:lessonId/complete", requireAuth, requireRole('student'), StudentController.completeLesson);
router.get("/student/leaderboard", requireAuth, requireRole('student'), StudentController.leaderboard);
router.get("/student/badges", requireAuth, requireRole('student'), StudentController.viewBadges);

// Teacher routes
router.get("/teacher/dashboard", requireAuth, requireRole('teacher'), TeacherController.dashboard);
router.get("/teacher/courses", requireAuth, requireRole('teacher'), TeacherController.listCourses);
router.get("/teacher/courses/create", requireAuth, requireRole('teacher'), TeacherController.createCourseForm);
router.post("/teacher/courses", requireAuth, requireRole('teacher'), TeacherController.createCourse);
router.get("/teacher/courses/:courseId/edit", requireAuth, requireRole('teacher'), TeacherController.editCourse);
router.post("/teacher/courses/:courseId/edit", requireAuth, requireRole('teacher'), TeacherController.updateCourse);
router.post("/teacher/modules", requireAuth, requireRole('teacher'), TeacherController.createModule);
router.post("/teacher/lessons", requireAuth, requireRole('teacher'), TeacherController.createLesson);
router.post("/teacher/quizzes", requireAuth, requireRole('teacher'), TeacherController.createQuiz);
router.get("/teacher/classes", requireAuth, requireRole('teacher'), TeacherController.listClasses);
router.get("/teacher/classes/create", requireAuth, requireRole('teacher'), TeacherController.createClassForm);
router.post("/teacher/classes/create", requireAuth, requireRole('teacher'), TeacherController.createClass);
router.get("/teacher/classes/:classId", requireAuth, requireRole('teacher'), TeacherController.viewClass);
router.get("/teacher/classes/:classId/manage", requireAuth, requireRole('teacher'), TeacherController.classManagement);
router.get("/teacher/classes/:classId/assignments", requireAuth, requireRole('teacher'), TeacherController.manageAssignments);
router.post("/teacher/classes/:classId/assignments", requireAuth, requireRole('teacher'), TeacherController.createAssignment);
router.get("/teacher/classes/:classId/grades", requireAuth, requireRole('teacher'), TeacherController.manageGrades);
router.get("/teacher/classes/:classId/settings", requireAuth, requireRole('teacher'), TeacherController.classSettings);
router.post("/teacher/classes/:classId/settings", requireAuth, requireRole('teacher'), TeacherController.updateClassSettings);
router.post("/teacher/classes/:classId/students", requireAuth, requireRole('teacher'), TeacherController.addStudent);
router.get("/teacher/classes/:classId/students/:studentId/progress", requireAuth, requireRole('teacher'), TeacherController.viewStudentProgress);
router.get("/teacher/classes/:classId/students/:studentId", requireAuth, requireRole('teacher'), TeacherController.viewStudentDetails);
router.get("/teacher/classes/:classId/progress", requireAuth, requireRole('teacher'), TeacherController.trackProgress);
router.get("/teacher/classes/:classId/report", requireAuth, requireRole('teacher'), TeacherController.generateReport);

// Admin routes
router.get("/admin/dashboard", requireAuth, requireRole('admin'), FunlearnAdminController.dashboard);
router.get("/admin/users", requireAuth, requireRole('admin'), FunlearnAdminController.manageUsers);
router.get("/admin/users/create", requireAuth, requireRole('admin'), FunlearnAdminController.createUserForm);
router.get("/admin/users/:userId", requireAuth, requireRole('admin'), FunlearnAdminController.viewUser);
router.post("/admin/users", requireAuth, requireRole('admin'), FunlearnAdminController.createUser);
router.put("/admin/users/:userId", requireAuth, requireRole('admin'), FunlearnAdminController.updateUser);
router.delete("/admin/users/:userId", requireAuth, requireRole('admin'), FunlearnAdminController.deleteUser);
router.get("/admin/courses", requireAuth, requireRole('admin'), FunlearnAdminController.manageCourses);
router.post("/admin/courses/:courseId/approve", requireAuth, requireRole('admin'), FunlearnAdminController.approveCourse);
router.get("/admin/badges", requireAuth, requireRole('admin'), FunlearnAdminController.manageBadges);
router.post("/admin/badges", requireAuth, requireRole('admin'), FunlearnAdminController.createBadge);
router.get("/admin/analytics", requireAuth, requireRole('admin'), FunlearnAdminController.analytics);
router.get("/admin/audit-logs", requireAuth, requireRole('admin'), FunlearnAdminController.auditLogs);
router.get("/admin/settings", requireAuth, requireRole('admin'), FunlearnAdminController.settings);

export default router;