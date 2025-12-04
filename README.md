# FUNLEARN - Gamified Learning Management System

A modern, interactive learning management system with gamification features built with Node.js, Express, and MySQL.

## Features

### 👨‍🎓 Student Features
- **Interactive Dashboard** - View courses, progress, XP, and level
- **Course Browsing** - Explore and enroll in published courses
- **Progress Tracking** - Track lesson completion and earn XP
- **Gamification** - Earn badges, level up, and compete on leaderboards
- **Personalized Learning** - Continue where you left off

### 👨‍🏫 Teacher Features
- **Course Management** - Create, edit, and publish courses
- **Module & Lesson Creation** - Organize content into structured modules
- **Class Management** - Create and manage classes with students
- **Assignment System** - Create and grade assignments
- **Progress Tracking** - Monitor student performance and progress
- **Reporting** - Generate detailed class and student reports

### 👨‍💼 Admin Features
- **User Management** - Create and manage users (students, teachers, admins)
- **Analytics Dashboard** - View system-wide statistics and insights
- **Course Approval** - Review and approve teacher-created courses
- **Badge Management** - Create and manage achievement badges
- **Audit Logs** - Track system activity and user actions
- **System Settings** - Configure gamification and system preferences

## Tech Stack

- **Backend:** Node.js, Express.js
- **Database:** MySQL with Sequelize ORM
- **Template Engine:** Handlebars (XianFire)
- **Styling:** Tailwind CSS
- **Session Management:** Express-session

## Installation

### Prerequisites
- Node.js (v14 or higher)
- MySQL (v8 or higher)
- npm or yarn

### Setup Steps

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/funlearn.git
cd funlearn
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure database**
- Create a MySQL database named `funlearn_db`
- Update database credentials in `models/db.js`:
```javascript
const sequelize = new Sequelize('funlearn_db', 'root', 'your_password', {
  host: 'localhost',
  dialect: 'mysql'
});
```

4. **Initialize database**
```bash
# Run the SQL setup file
mysql -u root -p funlearn_db < DATABASE_SETUP.sql
```

5. **Start the application**
```bash
node index.js
```

6. **Access the application**
Open your browser and navigate to `http://localhost:3000`

## Default Login Credentials

### Admin
- Username: `admin`
- Password: `admin123`

### Teacher
- Username: `teacher1`
- Password: `teacher123`

### Student
- Username: `student1`
- Password: `student123`

## Project Structure

```
funlearn/
├── controllers/          # Request handlers
│   ├── FunlearnAdminController.js
│   ├── TeacherController.js
│   └── StudentController.js
├── models/              # Database models
│   ├── User.js
│   ├── Course.js
│   ├── Module.js
│   ├── Lesson.js
│   ├── StudentProgress.js
│   └── FunlearnModels.js
├── routes/              # Route definitions
│   └── funlearn.js
├── views/               # Handlebars templates
│   ├── admin/          # Admin views
│   ├── teacher/        # Teacher views
│   ├── student/        # Student views
│   └── partials/       # Reusable components
├── public/             # Static assets
│   ├── tailwind.css
│   └── funlearn-styles.css
├── src/                # Source files
│   └── styles/
├── index.js            # Application entry point
└── package.json        # Dependencies
```

## Key Features Explained

### Gamification System
- **XP (Experience Points):** Earned by completing lessons and quizzes
- **Levels:** Automatically calculated based on XP (100 XP per level)
- **Badges:** Achievement rewards for completing milestones
- **Leaderboard:** Competitive ranking based on XP

### Course Structure
```
Course
└── Modules
    └── Lessons
        └── Content (video, text, quiz, etc.)
```

### User Roles
1. **Admin** - Full system access and management
2. **Teacher** - Course and class management
3. **Student** - Learning and progress tracking

## API Routes

### Public Routes
- `GET /` - Landing page
- `GET /login` - Login page
- `GET /register` - Registration page
- `POST /auth/login` - Login authentication
- `POST /auth/register` - User registration

### Student Routes
- `GET /student/dashboard` - Student dashboard
- `GET /student/courses` - Browse courses
- `GET /student/courses/:id` - Course details
- `GET /student/lessons/:id` - View lesson
- `POST /student/lessons/:id/complete` - Complete lesson
- `GET /student/leaderboard` - View leaderboard
- `GET /student/badges` - View badges

### Teacher Routes
- `GET /teacher/dashboard` - Teacher dashboard
- `GET /teacher/courses` - Manage courses
- `GET /teacher/courses/create` - Create course form
- `POST /teacher/courses` - Create course
- `GET /teacher/courses/:id/edit` - Edit course
- `GET /teacher/classes` - Manage classes
- `GET /teacher/classes/:id` - Class details
- `GET /teacher/classes/:id/progress` - Track progress

### Admin Routes
- `GET /admin/dashboard` - Admin dashboard
- `GET /admin/users` - Manage users
- `GET /admin/courses` - Manage courses
- `GET /admin/analytics` - View analytics
- `GET /admin/badges` - Manage badges
- `GET /admin/audit-logs` - View audit logs
- `GET /admin/settings` - System settings

## Database Schema

### Main Tables
- `users` - User accounts and profiles
- `courses` - Course information
- `modules` - Course modules
- `lessons` - Lesson content
- `student_progress` - Learning progress tracking
- `badges` - Achievement badges
- `classes` - Teacher-managed classes
- `class_enrollments` - Student class enrollments
- `assignments` - Class assignments
- `grades` - Assignment grades

## Development

### Running in Development Mode
```bash
node index.js
```

### Building Tailwind CSS
```bash
npx tailwindcss -i ./src/styles/input.css -o ./public/tailwind.css --watch
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Support

For support, email support@funlearn.com or open an issue in the repository.

## Screenshots

### Student Dashboard
![Student Dashboard](screenshots/student-dashboard.png)
*Interactive dashboard showing courses, progress, XP, and achievements*

### Teacher Course Management
![Teacher Courses](screenshots/teacher-courses.png)
*Create and manage courses with modules and lessons*

### Admin Analytics
![Admin Analytics](screenshots/admin-analytics.png)
*Comprehensive analytics and system insights*

## Features in Detail

### Real-time Progress Tracking
- Automatic XP calculation and level progression
- Visual progress indicators for courses and lessons
- Completion tracking with timestamps
- Performance analytics and insights

### Comprehensive Class Management
- Create and organize classes by semester/year
- Enroll students with unique class codes
- Track individual and class-wide performance
- Generate detailed progress reports

### Flexible Course Creation
- Rich content support (video, text, quizzes)
- Modular course structure for easy organization
- Draft and publish workflow
- Course difficulty levels (Beginner, Intermediate, Advanced)

### Gamification Elements
- XP-based progression system (100 XP per level)
- Achievement badges with rarity levels
- Competitive leaderboards
- Streak tracking for consistent learning

## Troubleshooting

### Database Connection Issues
```bash
# Check MySQL service is running
mysql -u root -p

# Verify database exists
SHOW DATABASES;

# Check user permissions
SHOW GRANTS FOR 'root'@'localhost';
```

### Port Already in Use
```bash
# Change port in index.js
const PORT = process.env.PORT || 3001;
```

### Session Issues
```bash
# Clear browser cookies and cache
# Restart the server
```

## Roadmap

- [ ] Real-time notifications
- [ ] Mobile responsive design improvements
- [ ] Video lesson support
- [ ] Quiz builder with multiple question types
- [ ] Certificate generation
- [ ] Email notifications
- [ ] Advanced analytics and reporting
- [ ] API documentation
- [ ] Multi-language support

## Security

- Password hashing (implement bcrypt)
- Session-based authentication
- Role-based access control (RBAC)
- SQL injection prevention via Sequelize ORM
- XSS protection

## Performance

- Database query optimization
- Session management with express-session
- Efficient data loading with pagination
- Caching strategies for frequently accessed data

## Acknowledgments

- Built with **Express.js** and **Sequelize ORM**
- UI styled with **Tailwind CSS**
- Template engine powered by **XianFire Framework**
- Icons and emojis for enhanced user experience
- Inspired by modern gamified learning platforms

## Authors

- **Your Name** - Initial work - [GitHub Profile](https://github.com/yourusername)

## Version History

- **v1.0.0** (2024) - Initial release
  - Core LMS functionality
  - Gamification system
  - Admin, Teacher, and Student portals
  - Analytics dashboard

---

Made with ❤️ using XianFire Framework
