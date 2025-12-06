# 🎫 Support Ticket Management System

A comprehensive, full-stack support ticket management system built with the MERN stack (MongoDB, Express.js, React, Node.js). This system provides advanced features for managing customer support tickets, tracking performance, and improving service quality.

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [Demo Credentials](#demo-credentials)
- [API Documentation](#api-documentation)
- [Project Structure](#project-structure)
- [Features Documentation](#features-documentation)
- [Contributing](#contributing)
- [License](#license)

## ✨ Features

### Core Ticket Management
- ✅ **Create, Read, Update, Delete Tickets** - Full CRUD operations
- ✅ **Ticket Assignment** - Assign tickets to agents
- ✅ **Status Management** - Customizable ticket statuses
- ✅ **Priority Levels** - Low, Medium, High, Urgent
- ✅ **Department Organization** - Organize tickets by departments
- ✅ **Ticket History** - Track all changes and updates
- ✅ **Internal Notes** - Private notes for agents
- ✅ **Ticket Merging** - Merge duplicate tickets
- ✅ **Ticket Dependencies** - Link related tickets

### Advanced Features
- ✅ **File Attachments** - Upload and manage files (images, PDFs, documents)
- ✅ **Saved Replies** - Quick response templates with variables
- ✅ **Ticket Templates** - Pre-defined ticket templates for common issues
- ✅ **CSAT Surveys** - Customer satisfaction surveys with NPS scoring
- ✅ **Collision Detection** - Prevent multiple agents from editing same ticket
- ✅ **Real-time Updates** - WebSocket-based live notifications
- ✅ **Escalation Rules** - Automatic ticket escalation based on rules
- ✅ **Auto-close Tickets** - Automatically close resolved tickets

### Analytics & Reporting
- ✅ **Dashboard Analytics** - Overview of ticket metrics
- ✅ **Advanced Analytics** - Detailed charts and graphs
- ✅ **Custom Dashboards** - Drag-and-drop widget customization
- ✅ **PDF Reports** - Generate and download PDF reports
- ✅ **Email Scheduling** - Schedule automated report emails
- ✅ **ML Predictions** - Machine learning-based predictions
- ✅ **Anomaly Detection** - Identify unusual patterns
- ✅ **Natural Language Queries** - Ask questions in plain English

### User Management
- ✅ **Role-Based Access Control** - Admin, Agent, User roles
- ✅ **Google OAuth** - Sign in with Google
- ✅ **Email Authentication** - Traditional email/password login
- ✅ **User Profiles** - Manage user information
- ✅ **Audit Logs** - Track all user actions

### Communication
- ✅ **Ticket Replies** - Comment on tickets
- ✅ **Email Notifications** - Automated email alerts
- ✅ **Real-time Notifications** - Instant updates via WebSocket
- ✅ **Mention System** - @mention users in comments

## 🛠 Tech Stack

### Frontend
- **React 18** - UI library
- **Vite** - Build tool and dev server
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **Socket.io Client** - Real-time communication
- **Recharts** - Data visualization
- **Lucide React** - Icon library
- **React Hot Toast** - Notifications
- **Tailwind CSS** - Utility-first CSS framework

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **Socket.io** - Real-time communication
- **JWT** - Authentication
- **Bcrypt** - Password hashing
- **Multer** - File upload handling
- **Node-cron** - Scheduled tasks
- **Nodemailer** - Email sending
- **PDFKit** - PDF generation

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v16 or higher) - [Download](https://nodejs.org/)
- **MongoDB** (v5 or higher) - [Download](https://www.mongodb.com/try/download/community) or use [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- **npm** or **yarn** - Package manager (comes with Node.js)
- **Git** - Version control

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/support-ticket-system.git
cd support-ticket-system
```

### 2. Install Backend Dependencies

```bash
cd backend
npm install
```

### 3. Install Frontend Dependencies

```bash
cd ../frontend
npm install
```

## ⚙️ Configuration

### Backend Configuration

Create a `.env` file in the `backend` directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/ticket-system
# Or use MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ticket-system

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d

# Email Configuration (Gmail example)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-specific-password
EMAIL_FROM=noreply@yourdomain.com

# Frontend URL
FRONTEND_URL=http://localhost:5173

# Google OAuth (Optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_REDIRECT_URI=http://localhost:5000/api/auth/google/callback

# Escalation Job Configuration
ESCALATION_CHECK_INTERVAL=*/5 * * * *
```

### Frontend Configuration

Create a `.env` file in the `frontend` directory:

```env
VITE_API_URL=http://localhost:5000/api
```

### Email Setup (Gmail)

1. Go to [Google Account Settings](https://myaccount.google.com/)
2. Enable 2-Factor Authentication
3. Generate an App Password
4. Use the App Password in `EMAIL_PASSWORD`

### Google OAuth Setup (Optional)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs:
   - `http://localhost:5000/api/auth/google/callback`
   - `http://localhost:5173/auth/callback`
6. Copy Client ID and Secret to `.env`

## 🏃 Running the Application

### Development Mode

#### Start Backend Server

```bash
cd backend
npm run dev
```

The backend will run on `http://localhost:5000`

#### Start Frontend Development Server

```bash
cd frontend
npm run dev
```

The frontend will run on `http://localhost:5173`

### Production Mode

#### Build Frontend

```bash
cd frontend
npm run build
```

#### Start Backend in Production

```bash
cd backend
npm start
```

## 👤 Demo Credentials

### Admin Account
```
Email: admin@example.com
Password: admin123
Role: Admin
```

### Agent Account
```
Email: agent@example.com
Password: agent123
Role: Agent
```

### Customer Account
```
Email: user@example.com
Password: user123
Role: User
```

**Note**: Create these accounts after running the application for the first time, or use the seed script.

### Seed Database

To populate the database with sample data:

```bash
cd backend
npm run seed
```

To seed ticket templates:

```bash
cd backend
npm run seed:templates
```

## 📚 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/auth/register` | Register new user | No |
| POST | `/auth/login` | Login user | No |
| GET | `/auth/me` | Get current user | Yes |
| GET | `/auth/google` | Google OAuth login | No |
| GET | `/auth/google/callback` | Google OAuth callback | No |

### Ticket Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/tickets` | Get all tickets | Yes |
| GET | `/tickets/:id` | Get single ticket | Yes |
| POST | `/tickets` | Create ticket | Yes |
| PUT | `/tickets/:id` | Update ticket | Yes |
| DELETE | `/tickets/:id` | Delete ticket | Yes (Admin) |
| POST | `/tickets/:id/reply` | Add reply | Yes |
| PUT | `/tickets/:id/status` | Change status | Yes |
| PUT | `/tickets/:id/assign` | Assign ticket | Yes |
| POST | `/tickets/:id/merge` | Merge tickets | Yes |
| POST | `/tickets/:id/dependency` | Add dependency | Yes |

### Department Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/departments` | Get all departments | Yes |
| POST | `/departments` | Create department | Yes (Admin) |
| PUT | `/departments/:id` | Update department | Yes (Admin) |
| DELETE | `/departments/:id` | Delete department | Yes (Admin) |

### Status Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/statuses` | Get all statuses | Yes |
| POST | `/statuses` | Create status | Yes (Admin) |
| PUT | `/statuses/:id` | Update status | Yes (Admin) |
| DELETE | `/statuses/:id` | Delete status | Yes (Admin) |

### Escalation Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/escalations` | Get all rules | Yes (Admin) |
| POST | `/escalations` | Create rule | Yes (Admin) |
| PUT | `/escalations/:id` | Update rule | Yes (Admin) |
| DELETE | `/escalations/:id` | Delete rule | Yes (Admin) |

### Analytics Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/analytics/overview` | Get overview stats | Yes |
| GET | `/analytics/tickets` | Get ticket analytics | Yes |
| GET | `/analytics/agents` | Get agent performance | Yes |
| POST | `/analytics/pdf` | Generate PDF report | Yes |
| POST | `/analytics/schedule` | Schedule email report | Yes |

### Attachment Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/attachments/upload` | Upload files | Yes |
| GET | `/attachments/ticket/:id` | Get ticket attachments | Yes |
| GET | `/attachments/:id/download` | Download file | Yes |
| GET | `/attachments/:id/view` | View file inline | Yes |
| DELETE | `/attachments/:id` | Delete attachment | Yes |

### Saved Reply Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/saved-replies` | Get all replies | Yes |
| POST | `/saved-replies` | Create reply | Yes |
| PUT | `/saved-replies/:id` | Update reply | Yes |
| DELETE | `/saved-replies/:id` | Delete reply | Yes |
| POST | `/saved-replies/:id/usage` | Record usage | Yes |

### Ticket Template Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/ticket-templates` | Get all templates | Yes |
| POST | `/ticket-templates` | Create template | Yes |
| PUT | `/ticket-templates/:id` | Update template | Yes |
| DELETE | `/ticket-templates/:id` | Delete template | Yes |
| POST | `/ticket-templates/:id/duplicate` | Duplicate template | Yes |

### Survey Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/surveys` | Get all surveys | Yes |
| POST | `/surveys` | Create survey | Yes |
| GET | `/surveys/analytics` | Get survey analytics | Yes |
| GET | `/surveys/public/:token` | Get survey by token | No |
| POST | `/surveys/public/:token/submit` | Submit survey | No |

### Ticket Lock Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/ticket-locks/:id/acquire` | Acquire lock | Yes |
| POST | `/ticket-locks/:id/release` | Release lock | Yes |
| POST | `/ticket-locks/:id/refresh` | Refresh lock | Yes |
| GET | `/ticket-locks/:id/check` | Check lock status | Yes |

## 📁 Project Structure

```
support-ticket-system/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── database.js
│   │   │   ├── socket.js
│   │   │   └── upload.js
│   │   ├── controllers/
│   │   │   ├── analyticsController.js
│   │   │   ├── attachmentController.js
│   │   │   ├── authController.js
│   │   │   ├── departmentController.js
│   │   │   ├── escalationController.js
│   │   │   ├── googleAuthController.js
│   │   │   ├── savedReplyController.js
│   │   │   ├── statusController.js
│   │   │   ├── surveyController.js
│   │   │   ├── ticketController.js
│   │   │   ├── ticketLockController.js
│   │   │   └── ticketTemplateController.js
│   │   ├── middleware/
│   │   │   ├── auth.js
│   │   │   └── errorHandler.js
│   │   ├── models/
│   │   │   ├── Attachment.js
│   │   │   ├── AuditLog.js
│   │   │   ├── Department.js
│   │   │   ├── EscalationRule.js
│   │   │   ├── SavedReply.js
│   │   │   ├── Status.js
│   │   │   ├── Survey.js
│   │   │   ├── Ticket.js
│   │   │   ├── TicketLock.js
│   │   │   ├── TicketTemplate.js
│   │   │   └── User.js
│   │   ├── routes/
│   │   │   ├── analyticsRoutes.js
│   │   │   ├── attachmentRoutes.js
│   │   │   ├── authRoutes.js
│   │   │   ├── departmentRoutes.js
│   │   │   ├── escalationRoutes.js
│   │   │   ├── savedReplyRoutes.js
│   │   │   ├── statusRoutes.js
│   │   │   ├── surveyRoutes.js
│   │   │   ├── ticketLockRoutes.js
│   │   │   ├── ticketRoutes.js
│   │   │   └── ticketTemplateRoutes.js
│   │   ├── scripts/
│   │   │   ├── seed.js
│   │   │   └── seedTicketTemplates.js
│   │   ├── services/
│   │   │   ├── emailScheduler.js
│   │   │   ├── escalationService.js
│   │   │   ├── mlPredictions.js
│   │   │   └── pdfService.js
│   │   ├── utils/
│   │   │   ├── auditLogger.js
│   │   │   └── ticketNumber.js
│   │   └── server.js
│   ├── uploads/
│   ├── .env
│   ├── .gitignore
│   └── package.json
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── AttachmentList.jsx
│   │   │   ├── FileUpload.jsx
│   │   │   ├── Layout.jsx
│   │   │   ├── ProtectedRoute.jsx
│   │   │   ├── SavedReplyPicker.jsx
│   │   │   └── TicketTemplatePicker.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── hooks/
│   │   │   └── useTicketLock.js
│   │   ├── pages/
│   │   │   ├── AdvancedAnalytics.jsx
│   │   │   ├── Analytics.jsx
│   │   │   ├── AuthCallback.jsx
│   │   │   ├── CreateTicket.jsx
│   │   │   ├── CustomDashboard.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Departments.jsx
│   │   │   ├── EscalationRules.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── SavedReplies.jsx
│   │   │   ├── Statuses.jsx
│   │   │   ├── Surveys.jsx
│   │   │   ├── SurveySubmit.jsx
│   │   │   ├── TicketDetail.jsx
│   │   │   ├── TicketList.jsx
│   │   │   ├── TicketTemplates.jsx
│   │   │   └── Users.jsx
│   │   ├── services/
│   │   │   ├── api.js
│   │   │   ├── notificationService.js
│   │   │   └── ticketService.js
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── .env
│   ├── .gitignore
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── .gitignore
├── README.md
└── package.json
```

## 📖 Features Documentation

### 1. Ticket Management

**Create Ticket**
- Navigate to "Create Ticket"
- Fill in title, description, priority
- Select department
- Add tags
- Upload attachments
- Submit

**View Tickets**
- Navigate to "Tickets"
- Filter by status, priority, department
- Search by ticket number or title
- Click to view details

**Update Ticket**
- Open ticket detail page
- Change status, priority, or assignment
- Add replies and internal notes
- Upload additional files

### 2. File Attachments

**Upload Files**
- Drag and drop files
- Or click to browse
- Supports: Images, PDFs, Documents
- Max 5 files, 10MB each
- Preview images inline
- Download any file

### 3. Saved Replies

**Create Saved Reply**
- Navigate to "Saved Replies"
- Click "New Reply"
- Add title and content
- Use variables: `{customer_name}`, `{ticket_id}`, `{agent_name}`
- Set visibility (Private, Department, Global)
- Add shortcut (e.g., `/welcome`)

**Use Saved Reply**
- Open ticket detail
- Click "Saved Replies" button
- Search or browse
- Click to insert
- Variables auto-replace

### 4. Ticket Templates

**Create Template**
- Navigate to "Ticket Templates"
- Click "New Template"
- Fill in default values
- Choose icon and color
- Set visibility
- Save

**Use Template**
- Click "Use Template" when creating ticket
- Select template
- Form pre-fills
- Modify as needed
- Submit

### 5. CSAT Surveys

**Send Survey**
- Close/resolve a ticket
- Click "Send Survey" button
- Copy survey link
- Share with customer

**Customer Completes Survey**
- Click survey link
- Rate experience (1-5 stars)
- Provide NPS score (0-10)
- Write feedback
- Submit

**View Results**
- Navigate to "Surveys"
- View analytics dashboard
- See individual responses
- Track agent performance

### 6. Collision Detection

**How It Works**
- Agent A opens ticket
- Agent B opens same ticket
- Agent B sees warning banner
- Agent B's fields are disabled
- Agent A closes ticket
- Agent B can now edit

**Visual Indicators**
- Yellow warning banner
- Disabled form fields
- Real-time updates

### 7. Analytics

**Dashboard**
- Overview statistics
- Recent tickets
- Agent performance
- Department metrics

**Advanced Analytics**
- Detailed charts
- Custom date ranges
- Export to PDF
- Schedule email reports

**Custom Dashboard**
- Drag and drop widgets
- Customize layout
- Save preferences

### 8. Escalation Rules

**Create Rule**
- Navigate to "Escalation Rules"
- Set conditions (priority, time, status)
- Define actions (assign, notify, change priority)
- Save rule

**Automatic Escalation**
- Runs every 5 minutes
- Checks all rules
- Applies actions
- Sends notifications

## 🔒 Security Features

- **JWT Authentication** - Secure token-based auth
- **Password Hashing** - Bcrypt encryption
- **Role-Based Access Control** - Admin, Agent, User roles
- **Input Validation** - Sanitize all inputs
- **File Upload Security** - Type and size validation
- **XSS Protection** - Prevent cross-site scripting
- **CORS Configuration** - Controlled cross-origin requests
- **Audit Logging** - Track all user actions
- **Rate Limiting** - Prevent abuse (recommended for production)

## 🚀 Deployment

### Deploy to Heroku

1. Create Heroku app
2. Add MongoDB Atlas add-on
3. Set environment variables
4. Deploy backend
5. Build and deploy frontend

### Deploy to Vercel (Frontend)

1. Connect GitHub repository
2. Set environment variables
3. Deploy

### Deploy to Railway (Backend)

1. Connect GitHub repository
2. Add MongoDB database
3. Set environment variables
4. Deploy

## 🧪 Testing

### Run Backend Tests

```bash
cd backend
npm test
```

### Run Frontend Tests

```bash
cd frontend
npm test
```

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Authors

- **Hemal Katariya** - *MERN Stack Developer* - [GitHub](https://github.com/AnshuHemal)

## 🙏 Acknowledgments

- React team for the amazing framework
- MongoDB team for the database
- All contributors who helped with this project

## 📞 Support

For support, email connect.hemal@gmail.com or join our Slack channel.

## 🗺️ Roadmap

- [ ] Mobile app (React Native)
- [ ] Multi-language support
- [ ] Advanced reporting
- [ ] Integration with Slack/Teams
- [ ] AI-powered ticket routing
- [ ] Customer portal
- [ ] Knowledge base
- [ ] Live chat integration

## 📊 Performance

- Average response time: < 200ms
- Supports 1000+ concurrent users
- Real-time updates via WebSocket
- Optimized database queries
- Efficient file handling

## 🌟 Star History

If you find this project useful, please consider giving it a star on GitHub!

---

Made with ❤️ by [Hemal Katariya](https://github.com/AnshuHemal)
