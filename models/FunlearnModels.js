import User from "./User.js";
import Course from "./Course.js";
import Module from "./Module.js";
import Lesson from "./Lesson.js";
import Quiz from "./Quiz.js";
import StudentProgress from "./StudentProgress.js";
import Badge from "./Badge.js";
import Class from "./Class.js";
import ClassEnrollment from "./ClassEnrollment.js";
import Assignment from "./Assignment.js";
import Grade from "./Grade.js";
import Notification from "./Notification.js";
import AuditLog from "./AuditLog.js";

// ============================================
// COURSE RELATIONSHIPS
// ============================================
User.hasMany(Course, { foreignKey: 'created_by', as: 'createdCourses' });
Course.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });

Course.hasMany(Module, { foreignKey: 'course_id', as: 'modules' });
Module.belongsTo(Course, { foreignKey: 'course_id', as: 'course' });

Module.hasMany(Lesson, { foreignKey: 'module_id', as: 'lessons' });
Lesson.belongsTo(Module, { foreignKey: 'module_id', as: 'module' });

// ============================================
// QUIZ RELATIONSHIPS
// ============================================
Lesson.hasMany(Quiz, { foreignKey: 'lesson_id', as: 'quizzes' });
Quiz.belongsTo(Lesson, { foreignKey: 'lesson_id', as: 'lesson' });

Course.hasMany(Quiz, { foreignKey: 'course_id', as: 'quizzes' });
Quiz.belongsTo(Course, { foreignKey: 'course_id', as: 'course' });

User.hasMany(Quiz, { foreignKey: 'created_by', as: 'createdQuizzes' });
Quiz.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });

// ============================================
// STUDENT PROGRESS RELATIONSHIPS
// ============================================
User.hasMany(StudentProgress, { foreignKey: 'student_id', as: 'progress' });
StudentProgress.belongsTo(User, { foreignKey: 'student_id', as: 'student' });

Lesson.hasMany(StudentProgress, { foreignKey: 'lesson_id', as: 'studentProgress' });
StudentProgress.belongsTo(Lesson, { foreignKey: 'lesson_id', as: 'lesson' });

// ============================================
// BADGE RELATIONSHIPS
// ============================================
User.belongsToMany(Badge, { 
  through: 'student_badges', 
  foreignKey: 'student_id',
  otherKey: 'badge_id',
  as: 'badges'
});
Badge.belongsToMany(User, { 
  through: 'student_badges', 
  foreignKey: 'badge_id',
  otherKey: 'student_id',
  as: 'students'
});

// ============================================
// CLASS RELATIONSHIPS
// ============================================
User.hasMany(Class, { foreignKey: 'teacher_id', as: 'classes' });
Class.belongsTo(User, { foreignKey: 'teacher_id', as: 'teacher' });

// Class Enrollment relationships
User.hasMany(ClassEnrollment, { foreignKey: 'student_id', as: 'enrollments' });
ClassEnrollment.belongsTo(User, { foreignKey: 'student_id', as: 'student' });

Class.hasMany(ClassEnrollment, { foreignKey: 'class_id', as: 'enrollments' });
ClassEnrollment.belongsTo(Class, { foreignKey: 'class_id', as: 'class' });

// Many-to-many through ClassEnrollment
User.belongsToMany(Class, {
  through: ClassEnrollment,
  foreignKey: 'student_id',
  otherKey: 'class_id',
  as: 'enrolledClasses'
});
Class.belongsToMany(User, {
  through: ClassEnrollment,
  foreignKey: 'class_id',
  otherKey: 'student_id',
  as: 'students'
});

// ============================================
// NOTIFICATION RELATIONSHIPS
// ============================================
User.hasMany(Notification, { foreignKey: 'user_id', as: 'notifications' });
Notification.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// ============================================
// AUDIT LOG RELATIONSHIPS
// ============================================
User.hasMany(AuditLog, { foreignKey: 'user_id', as: 'auditLogs' });
AuditLog.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// ============================================
// ASSIGNMENT RELATIONSHIPS
// ============================================
User.hasMany(Assignment, { foreignKey: 'teacher_id', as: 'createdAssignments' });
Assignment.belongsTo(User, { foreignKey: 'teacher_id', as: 'teacher' });

Class.hasMany(Assignment, { foreignKey: 'class_id', as: 'assignments' });
Assignment.belongsTo(Class, { foreignKey: 'class_id', as: 'class' });

Course.hasMany(Assignment, { foreignKey: 'course_id', as: 'assignments' });
Assignment.belongsTo(Course, { foreignKey: 'course_id', as: 'course' });

// ============================================
// GRADE RELATIONSHIPS
// ============================================
Assignment.hasMany(Grade, { foreignKey: 'assignment_id', as: 'grades' });
Grade.belongsTo(Assignment, { foreignKey: 'assignment_id', as: 'assignment' });

User.hasMany(Grade, { foreignKey: 'student_id', as: 'studentGrades' });
Grade.belongsTo(User, { foreignKey: 'student_id', as: 'student' });

User.hasMany(Grade, { foreignKey: 'teacher_id', as: 'gradedAssignments' });
Grade.belongsTo(User, { foreignKey: 'teacher_id', as: 'teacher' });

export {
  User,
  Course,
  Module,
  Lesson,
  Quiz,
  StudentProgress,
  Badge,
  Class,
  ClassEnrollment,
  Assignment,
  Grade,
  Notification,
  AuditLog
};
