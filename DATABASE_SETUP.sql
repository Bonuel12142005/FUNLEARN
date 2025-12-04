-- ============================================
-- FUNLEARN: Interactive Learning Platform
-- Database Setup Script for phpMyAdmin
-- ============================================

-- Create Database
CREATE DATABASE IF NOT EXISTS funlearn_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE funlearn_db;

-- ============================================
-- 1. USERS TABLE (Multi-role: Student, Teacher, Admin, Parent)
-- ============================================
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('student', 'teacher', 'admin', 'parent') NOT NULL DEFAULT 'student',
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    avatar_url VARCHAR(500),
    xp INT DEFAULT 0,
    level INT DEFAULT 1,
    streak_days INT DEFAULT 0,
    last_login DATETIME,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_role (role),
    INDEX idx_email (email)
);

-- ============================================
-- 2. COURSES TABLE
-- ============================================
CREATE TABLE courses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    thumbnail_url VARCHAR(500),
    category VARCHAR(100),
    difficulty_level ENUM('beginner', 'intermediate', 'advanced') DEFAULT 'beginner',
    created_by INT,
    is_published BOOLEAN DEFAULT FALSE,
    total_xp INT DEFAULT 0,
    estimated_duration INT, -- in minutes
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_category (category),
    INDEX idx_published (is_published)
);

-- ============================================
-- 3. MODULES TABLE (Course Chapters)
-- ============================================
CREATE TABLE modules (
    id INT AUTO_INCREMENT PRIMARY KEY,
    course_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    order_index INT DEFAULT 0,
    is_locked BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    INDEX idx_course (course_id)
);

-- ============================================
-- 4. LESSONS TABLE
-- ============================================
CREATE TABLE lessons (
    id INT AUTO_INCREMENT PRIMARY KEY,
    module_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    content_type ENUM('video', 'text', 'interactive', 'quiz', 'simulation', 'game') NOT NULL,
    content TEXT,
    video_url VARCHAR(500),
    duration INT, -- in minutes
    xp_reward INT DEFAULT 10,
    order_index INT DEFAULT 0,
    is_mandatory BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (module_id) REFERENCES modules(id) ON DELETE CASCADE,
    INDEX idx_module (module_id)
);

-- ============================================
-- 5. QUIZZES TABLE
-- ============================================
CREATE TABLE quizzes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    lesson_id INT,
    course_id INT,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    time_limit INT, -- in minutes
    passing_score INT DEFAULT 70,
    max_attempts INT DEFAULT 3,
    xp_reward INT DEFAULT 50,
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

-- ============================================
-- 6. QUIZ QUESTIONS TABLE
-- ============================================
CREATE TABLE quiz_questions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    quiz_id INT NOT NULL,
    question_text TEXT NOT NULL,
    question_type ENUM('multiple_choice', 'true_false', 'fill_blank', 'drag_drop') NOT NULL,
    options JSON, -- Store answer options as JSON
    correct_answer TEXT NOT NULL,
    points INT DEFAULT 1,
    order_index INT DEFAULT 0,
    explanation TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE,
    INDEX idx_quiz (quiz_id)
);

-- ============================================
-- 7. STUDENT PROGRESS TABLE
-- ============================================
CREATE TABLE student_progress (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    lesson_id INT NOT NULL,
    status ENUM('not_started', 'in_progress', 'completed') DEFAULT 'not_started',
    progress_percentage INT DEFAULT 0,
    time_spent INT DEFAULT 0, -- in seconds
    xp_earned INT DEFAULT 0,
    completed_at DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE,
    UNIQUE KEY unique_student_lesson (student_id, lesson_id),
    INDEX idx_student (student_id),
    INDEX idx_status (status)
);

-- ============================================
-- 8. STUDENT QUIZ ATTEMPTS TABLE
-- ============================================
CREATE TABLE student_quiz_attempts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    quiz_id INT NOT NULL,
    score INT DEFAULT 0,
    max_score INT NOT NULL,
    percentage DECIMAL(5,2),
    attempt_number INT DEFAULT 1,
    answers JSON, -- Store student answers as JSON
    time_taken INT, -- in seconds
    passed BOOLEAN DEFAULT FALSE,
    xp_earned INT DEFAULT 0,
    started_at DATETIME,
    completed_at DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE,
    INDEX idx_student (student_id),
    INDEX idx_quiz (quiz_id)
);

-- ============================================
-- 9. BADGES TABLE
-- ============================================
CREATE TABLE badges (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    icon_url VARCHAR(500),
    badge_type ENUM('achievement', 'milestone', 'special') DEFAULT 'achievement',
    criteria JSON, -- Conditions to earn badge
    xp_reward INT DEFAULT 0,
    rarity ENUM('common', 'rare', 'epic', 'legendary') DEFAULT 'common',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 10. STUDENT BADGES TABLE
-- ============================================
CREATE TABLE student_badges (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    badge_id INT NOT NULL,
    earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (badge_id) REFERENCES badges(id) ON DELETE CASCADE,
    UNIQUE KEY unique_student_badge (student_id, badge_id),
    INDEX idx_student (student_id)
);

-- ============================================
-- 11. LEADERBOARDS TABLE
-- ============================================
CREATE TABLE leaderboards (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    course_id INT,
    total_xp INT DEFAULT 0,
    rank_position INT,
    period ENUM('daily', 'weekly', 'monthly', 'all_time') DEFAULT 'all_time',
    period_start DATE,
    period_end DATE,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    INDEX idx_student (student_id),
    INDEX idx_period (period),
    INDEX idx_rank (rank_position)
);

-- ============================================
-- 12. NOTIFICATIONS TABLE
-- ============================================
CREATE TABLE notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT,
    type ENUM('info', 'success', 'warning', 'achievement') DEFAULT 'info',
    is_read BOOLEAN DEFAULT FALSE,
    link_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user (user_id),
    INDEX idx_read (is_read)
);

-- ============================================
-- 13. CLASSES TABLE (Teacher Classes)
-- ============================================
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
);

-- ============================================
-- 14. CLASS ENROLLMENTS TABLE
-- ============================================
CREATE TABLE class_enrollments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    class_id INT NOT NULL,
    student_id INT NOT NULL,
    enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('active', 'dropped', 'completed') DEFAULT 'active',
    FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_class_student (class_id, student_id),
    INDEX idx_class (class_id),
    INDEX idx_student (student_id)
);

-- ============================================
-- 15. ASSIGNMENTS TABLE
-- ============================================
CREATE TABLE assignments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    class_id INT NOT NULL,
    teacher_id INT NOT NULL,
    course_id INT,
    module_id INT,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    due_date DATETIME,
    xp_reward INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
    FOREIGN KEY (teacher_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE SET NULL,
    FOREIGN KEY (module_id) REFERENCES modules(id) ON DELETE SET NULL,
    INDEX idx_class (class_id),
    INDEX idx_due_date (due_date)
);

-- ============================================
-- 16. FEEDBACK TABLE
-- ============================================
CREATE TABLE feedback (
    id INT AUTO_INCREMENT PRIMARY KEY,
    teacher_id INT NOT NULL,
    student_id INT NOT NULL,
    assignment_id INT,
    quiz_attempt_id INT,
    feedback_text TEXT,
    rating INT CHECK (rating BETWEEN 1 AND 5),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (teacher_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (assignment_id) REFERENCES assignments(id) ON DELETE CASCADE,
    FOREIGN KEY (quiz_attempt_id) REFERENCES student_quiz_attempts(id) ON DELETE CASCADE,
    INDEX idx_student (student_id),
    INDEX idx_teacher (teacher_id)
);

-- ============================================
-- 17. CONTENT MEDIA TABLE
-- ============================================
CREATE TABLE content_media (
    id INT AUTO_INCREMENT PRIMARY KEY,
    lesson_id INT,
    media_type ENUM('image', 'video', 'audio', 'document', 'interactive') NOT NULL,
    file_url VARCHAR(500) NOT NULL,
    file_name VARCHAR(255),
    file_size INT, -- in bytes
    mime_type VARCHAR(100),
    uploaded_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE,
    FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_lesson (lesson_id)
);

-- ============================================
-- 18. GAMIFICATION RULES TABLE
-- ============================================
CREATE TABLE gamification_rules (
    id INT AUTO_INCREMENT PRIMARY KEY,
    rule_name VARCHAR(100) NOT NULL,
    rule_type ENUM('xp_per_lesson', 'xp_per_quiz', 'level_threshold', 'streak_bonus') NOT NULL,
    value INT NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ============================================
-- 19. AUDIT LOGS TABLE
-- ============================================
CREATE TABLE audit_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    action VARCHAR(255) NOT NULL,
    entity_type VARCHAR(100),
    entity_id INT,
    details JSON,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_user (user_id),
    INDEX idx_action (action),
    INDEX idx_created (created_at)
);

-- ============================================
-- INSERT DEFAULT DATA
-- ============================================

-- Default Admin User (password: admin123)
INSERT INTO users (username, email, password, role, first_name, last_name, level, xp) VALUES
('admin', 'admin@funlearn.com', '$2b$10$rBV2kHf7Gu/FQ8xqZ5vLOeYvZxJxqX5vZxJxqX5vZxJxqX5vZxJxq', 'admin', 'System', 'Administrator', 1, 0);

-- Default Gamification Rules
INSERT INTO gamification_rules (rule_name, rule_type, value, description) VALUES
('Lesson Completion XP', 'xp_per_lesson', 10, 'XP earned for completing a lesson'),
('Quiz Pass XP', 'xp_per_quiz', 50, 'XP earned for passing a quiz'),
('Level 2 Threshold', 'level_threshold', 100, 'XP needed to reach level 2'),
('Level 3 Threshold', 'level_threshold', 250, 'XP needed to reach level 3'),
('Level 4 Threshold', 'level_threshold', 500, 'XP needed to reach level 4'),
('Level 5 Threshold', 'level_threshold', 1000, 'XP needed to reach level 5'),
('Daily Streak Bonus', 'streak_bonus', 5, 'Bonus XP for daily login streak');

-- Default Badges
INSERT INTO badges (name, description, icon_url, badge_type, xp_reward, rarity) VALUES
('First Steps', 'Complete your first lesson', '/images/badges/first-steps.png', 'milestone', 10, 'common'),
('Quiz Master', 'Pass 10 quizzes', '/images/badges/quiz-master.png', 'achievement', 50, 'rare'),
('Speed Learner', 'Complete a course in under 1 week', '/images/badges/speed-learner.png', 'achievement', 100, 'epic'),
('Perfect Score', 'Get 100% on any quiz', '/images/badges/perfect-score.png', 'achievement', 25, 'rare'),
('Dedicated Student', 'Maintain a 7-day login streak', '/images/badges/dedicated.png', 'milestone', 50, 'rare'),
('Knowledge Seeker', 'Complete 5 courses', '/images/badges/knowledge-seeker.png', 'milestone', 200, 'epic'),
('Champion', 'Reach #1 on the leaderboard', '/images/badges/champion.png', 'special', 500, 'legendary');

-- ============================================
-- VIEWS FOR ANALYTICS
-- ============================================

-- Student Performance View
CREATE VIEW vw_student_performance AS
SELECT 
    u.id AS student_id,
    u.username,
    u.first_name,
    u.last_name,
    u.xp,
    u.level,
    u.streak_days,
    COUNT(DISTINCT sp.lesson_id) AS lessons_completed,
    COUNT(DISTINCT sqa.quiz_id) AS quizzes_taken,
    AVG(sqa.percentage) AS avg_quiz_score,
    COUNT(DISTINCT sb.badge_id) AS badges_earned
FROM users u
LEFT JOIN student_progress sp ON u.id = sp.student_id AND sp.status = 'completed'
LEFT JOIN student_quiz_attempts sqa ON u.id = sqa.student_id
LEFT JOIN student_badges sb ON u.id = sb.student_id
WHERE u.role = 'student'
GROUP BY u.id;

-- Course Popularity View
CREATE VIEW vw_course_popularity AS
SELECT 
    c.id AS course_id,
    c.title,
    c.category,
    c.difficulty_level,
    COUNT(DISTINCT sp.student_id) AS enrolled_students,
    AVG(sp.progress_percentage) AS avg_progress,
    COUNT(DISTINCT CASE WHEN sp.status = 'completed' THEN sp.student_id END) AS completed_students
FROM courses c
LEFT JOIN modules m ON c.id = m.course_id
LEFT JOIN lessons l ON m.id = l.module_id
LEFT JOIN student_progress sp ON l.id = sp.lesson_id
GROUP BY c.id;

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX idx_student_progress_completed ON student_progress(student_id, status, completed_at);
CREATE INDEX idx_quiz_attempts_student_score ON student_quiz_attempts(student_id, score, completed_at);
CREATE INDEX idx_leaderboard_rank ON leaderboards(period, rank_position, total_xp);

-- ============================================
-- END OF DATABASE SETUP
-- ============================================
