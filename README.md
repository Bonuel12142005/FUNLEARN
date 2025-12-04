# DOH Sanitation - Integrated Sanitation Monitoring and Reporting System

A comprehensive web-based system for monitoring and reporting sanitation compliance in households, establishments, and water sources.

## Features

### User (Sanitation Inspector)
- Login and authentication
- Dashboard with report statistics
- Create sanitation reports (Household, Establishment, Water Source)
- Upload photos and attachments
- Track report status (Submitted → Under Review → Approved/Returned)
- Receive feedback and revise reports

### Admin (Sanitation Officer/DOH)
- Admin dashboard with pending reports
- Review and validate reports
- Approve, return for revision, or reject reports
- Add feedback and comments
- Access analytics and trends
- Generate compliance reports

## Installation

1. Install dependencies:
```bash
npm install
```

2. Configure database in `models/db.js`:
```javascript
export const sequelize = new Sequelize("mckenllydoh", "root", "", {
  host: "localhost",
  dialect: "mysql"
});
```

3. Run database migration:
```bash
npm run migrate
```

4. Start the server:
```bash
npm run xian-start
```

Or for development with auto-reload:
```bash
npm run xian
```

## Default Login Credentials

**Admin:**
- Username: `admin`
- Password: `admin123`

**Inspector:**
- Username: `inspector`
- Password: `inspector123`

## System Flow

See `SYSTEM_FLOW_DIAGRAM.md` for detailed system flow and architecture.

## Report Types

1. **Household Inspection**
   - Household information
   - Toilet facilities
   - Water source
   - Waste disposal
   - Compliance status

2. **Establishment Inspection**
   - Business details
   - Sanitary permit
   - Food handlers
   - Facilities assessment
   - Overall rating

3. **Water Source Inspection**
   - Source type and quality
   - Protection status
   - Coverage area
   - Maintenance condition
   - Recommendations

## Technology Stack

- **Backend:** Node.js, Express
- **Database:** MySQL with Sequelize ORM
- **Template Engine:** Handlebars (.xian files)
- **Frontend:** Tailwind CSS
- **Authentication:** Express Session with bcrypt

## Project Structure

```
├── controllers/
│   ├── AuthController.js
│   ├── UserController.js
│   └── AdminController.js
├── models/
│   ├── db.js
│   ├── User.js
│   ├── SanitationReport.js
│   ├── ReportAttachment.js
│   └── index.js
├── routes/
│   └── index.js
├── views/
│   ├── auth/
│   │   └── login.xian
│   ├── user/
│   │   ├── dashboard.xian
│   │   └── report-form.xian
│   └── admin/
│       ├── dashboard.xian
│       ├── review-report.xian
│       ├── analytics.xian
│       └── compliance-report.xian
├── public/
│   └── tailwind.css
├── index.js
├── migrate.js
└── package.json
```

## License

MIT License - Copyright (c) 2025 Christian I. Cabrera || XianFire Framework
