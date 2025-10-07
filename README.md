# 🏢 Aqarat - Real Estate CRM System

<div align="center">

[![Next.js](https://img.shields.io/badge/Next.js-15.2.4-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=node.js)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-336791?style=for-the-badge&logo=postgresql)](https://postgresql.org/)

**A comprehensive, modern real estate CRM system built for efficiency and scalability**

[🚀 Demo](#demo) • [✨ Features](#features) • [🛠️ Installation](#installation) • [📖 Documentation](#documentation) • [🤝 Contributing](#contributing)

</div>

---

## 📋 Table of Contents

- [About](#about)
- [Key Features](#key-features)
- [Screenshots](#screenshots)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [API Documentation](#api-documentation)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

---

## 🎯 About

**Aqarat** is a comprehensive Real Estate Customer Relationship Management (CRM) system designed to streamline real estate operations. From lead capture to deal closure, Aqarat provides real estate professionals with all the tools they need to manage their business efficiently.

Built with modern web technologies, Aqarat offers a responsive, intuitive interface with powerful backend capabilities to handle everything from property listings to client communications.

---

## ✨ Key Features

### 🏃‍♂️ **Lead Management**
- **Lead Capture**: Multi-channel lead capture with source tracking
- **Lead Scoring**: Automatic lead scoring based on engagement and profile
- **Lead Nurturing**: Automated follow-up workflows and reminders
- **Lead Conversion**: Seamless conversion from leads to active clients

### 👥 **Contact Management**
- **Comprehensive Profiles**: Detailed client profiles with contact history
- **Communication Tracking**: Complete interaction history across all channels
- **Relationship Mapping**: Family and business relationship connections
- **Client Segmentation**: Advanced filtering and categorization

### 🏠 **Property Management**
- **Property Listings**: Complete property database with rich media support
- **Property Matching**: Intelligent matching between clients and properties
- **Inventory Tracking**: Real-time property status and availability
- **Market Analysis**: Property valuation and market trend analysis

### 💰 **Deal Pipeline**
- **Sales Pipeline**: Visual deal progression through customizable stages
- **Deal Analytics**: Comprehensive reporting on sales performance
- **Contract Management**: Document generation and e-signature integration
- **Commission Tracking**: Automated commission calculations and splits

### ✅ **Task Management**
- **Assignment System**: Task creation and assignment to team members
- **Priority Management**: Task prioritization with due date tracking
- **Automated Reminders**: Smart notification system for upcoming tasks
- **Progress Tracking**: Real-time task completion monitoring

### 📝 **Activity Logging**
- **Communication History**: Complete log of all client interactions
- **Meeting Management**: Schedule and track client meetings
- **Call Logging**: Automatic call logging with duration and notes
- **Email Integration**: Seamless email communication tracking

### 📊 **Analytics Dashboard**
- **Performance Metrics**: Key performance indicators and business metrics
- **Visual Reports**: Interactive charts and graphs for data visualization
- **Sales Analytics**: Detailed sales performance and forecasting
- **Team Performance**: Individual and team productivity tracking

### 📄 **Document Management**
- **File Organization**: Centralized document storage and organization
- **Version Control**: Document versioning and revision history
- **Access Control**: Role-based document access permissions
- **Digital Signatures**: Integrated e-signature capabilities

---

## 📸 Screenshots

> **Note**: Add your screenshots here by replacing the placeholder paths with actual screenshot files

### Dashboard Overview
![Dashboard](./screenshots/dashboard.png)
*Main dashboard showing key metrics and quick actions*

### Lead Management
![Leads](./screenshots/leads.png)
*Lead management interface with filtering and conversion tools*

### Property Listings
![Properties](./screenshots/properties.png)
*Property management with grid and list views*

### Deal Pipeline
![Pipeline](./screenshots/pipeline.png)
*Visual deal pipeline with drag-and-drop functionality*

### Contact Profiles
![Contacts](./screenshots/contacts.png)
*Comprehensive contact profiles and communication history*

---

## 🛠️ Tech Stack

### **Frontend**
- **Framework**: Next.js 15.2.4 with App Router
- **UI Library**: React 19 with TypeScript
- **Styling**: Tailwind CSS with custom design system
- **Components**: Custom UI components with Radix UI primitives
- **State Management**: React Context API with custom hooks
- **Forms**: React Hook Form with Zod validation

### **Backend**
- **Runtime**: Node.js with Express.js framework
- **Database**: PostgreSQL with optimized queries
- **Authentication**: JWT-based authentication system
- **Validation**: Express-validator for API validation
- **File Upload**: Multer for document management
- **Security**: Helmet.js, CORS, and security middleware

### **DevOps & Tools**
- **Database Hosting**: NeonDB (PostgreSQL as a Service)
- **Deployment**: Vercel (Frontend) + Railway/Heroku (Backend)
- **Version Control**: Git with conventional commits
- **Package Management**: npm with lock files
- **Environment**: Environment-based configuration

---

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** 18.0 or higher
- **npm** or **yarn** package manager
- **PostgreSQL** database (local or cloud)
- **Git** for version control

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Jefranulislam/aqarat-Real-estate-CRM.git
   cd aqarat-Real-estate-CRM
   ```

2. **Install dependencies**
   
   **Backend setup:**
   ```bash
   cd server
   npm install
   ```
   
   **Frontend setup:**
   ```bash
   cd ../client
   npm install
   ```

3. **Environment Configuration**
   
   **Backend environment (server/.env):**
   ```env
   NODE_ENV=development
   PORT=5000
   
   # Database Configuration
   DATABASE_URL=postgresql://username:password@localhost:5432/aqarat_db
   
   # JWT Configuration
   JWT_SECRET=your-super-secret-jwt-key
   JWT_EXPIRE=7d
   
   # CORS Configuration
   CLIENT_URL=http://localhost:3000
   
   # File Upload Configuration
   MAX_FILE_SIZE=5242880
   UPLOAD_PATH=./uploads
   ```
   
   **Frontend environment (client/.env.local):**
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:5000/api
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

4. **Database Setup**
   
   Run database migrations:
   ```bash
   cd server
   npm run migrate
   ```

5. **Start Development Servers**
   
   **Backend (Terminal 1):**
   ```bash
   cd server
   npm run dev
   ```
   
   **Frontend (Terminal 2):**
   ```bash
   cd client
   npm run dev
   ```

6. **Access the Application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

---

## 📁 Project Structure

```
aqarat-Real-estate-CRM/
├── 📁 client/                     # Frontend Next.js application
│   ├── 📁 app/                    # Next.js App Router pages
│   │   ├── 📁 auth/               # Authentication pages
│   │   ├── 📁 dashboard/          # Main application pages
│   │   └── layout.tsx             # Root layout component
│   ├── 📁 components/             # Reusable React components
│   │   ├── 📁 ui/                 # Base UI components
│   │   ├── 📁 leads/              # Lead-specific components
│   │   ├── 📁 contacts/           # Contact-specific components
│   │   └── 📁 properties/         # Property-specific components
│   ├── 📁 hooks/                  # Custom React hooks
│   ├── 📁 lib/                    # Utility libraries and API client
│   └── 📁 public/                 # Static assets
├── 📁 server/                     # Backend Node.js application
│   ├── 📁 src/                    # Source code
│   │   ├── 📁 config/             # Database and app configuration
│   │   ├── 📁 middleware/         # Express middleware
│   │   ├── 📁 routes/             # API route handlers
│   │   └── server.js              # Main server file
│   ├── 📁 scripts/                # Database migration scripts
│   └── 📁 uploads/                # File upload directory
├── 📁 screenshots/                # Application screenshots
└── README.md                      # This file
```

---

## 📖 API Documentation

### Authentication Endpoints
```http
POST /api/auth/register    # User registration
POST /api/auth/login       # User login
GET  /api/auth/profile     # Get user profile
```

### Core Business Endpoints
```http
# Leads Management
GET    /api/leads          # Get all leads
POST   /api/leads          # Create new lead
PUT    /api/leads/:id      # Update lead
DELETE /api/leads/:id      # Delete lead
POST   /api/leads/:id/convert  # Convert lead to contact

# Contacts Management  
GET    /api/contacts       # Get all contacts
POST   /api/contacts       # Create new contact
PUT    /api/contacts/:id   # Update contact
DELETE /api/contacts/:id   # Delete contact

# Properties Management
GET    /api/properties     # Get all properties
POST   /api/properties     # Create new property
PUT    /api/properties/:id # Update property
DELETE /api/properties/:id # Delete property

# Deals Management
GET    /api/deals          # Get all deals
POST   /api/deals          # Create new deal
PUT    /api/deals/:id      # Update deal
DELETE /api/deals/:id      # Delete deal

# Tasks Management
GET    /api/tasks          # Get all tasks
POST   /api/tasks          # Create new task
PUT    /api/tasks/:id      # Update task
DELETE /api/tasks/:id      # Delete task

# Activities Management
GET    /api/activities     # Get all activities
POST   /api/activities     # Create new activity
PUT    /api/activities/:id # Update activity
DELETE /api/activities/:id # Delete activity

# Documents Management
GET    /api/documents      # Get all documents
POST   /api/documents      # Upload new document
PUT    /api/documents/:id  # Update document metadata
DELETE /api/documents/:id  # Delete document
```

### Request/Response Format
All API endpoints follow RESTful conventions and return JSON responses:

```json
{
  "success": true,
  "data": { ... },
  "message": "Operation completed successfully",
  "pagination": {
    "total": 100,
    "page": 1,
    "limit": 20
  }
}
```

---

## 🚀 Deployment

### Frontend Deployment (Vercel)

1. **Connect to Vercel**
   ```bash
   npm i -g vercel
   cd client
   vercel
   ```

2. **Environment Variables**
   Set the following in Vercel dashboard:
   ```env
   NEXT_PUBLIC_API_URL=https://your-backend-url.com/api
   NEXT_PUBLIC_APP_URL=https://your-frontend-url.vercel.app
   ```

### Backend Deployment (Railway/Heroku)

1. **Prepare for deployment**
   ```bash
   cd server
   # Ensure all dependencies are in package.json
   ```

2. **Set Environment Variables**
   ```env
   NODE_ENV=production
   DATABASE_URL=your-production-database-url
   JWT_SECRET=your-production-jwt-secret
   CLIENT_URL=https://your-frontend-url.vercel.app
   ```

3. **Deploy to Railway**
   ```bash
   railway login
   railway init
   railway up
   ```

### Database Setup (NeonDB)

1. Create a PostgreSQL database on [NeonDB](https://neon.tech)
2. Run migrations in production:
   ```bash
   npm run migrate
   ```
3. Update your backend environment with the connection string

---

## 🤝 Contributing

We welcome contributions to make Aqarat even better! Here's how you can help:

### Development Workflow

1. **Fork the repository**
   ```bash
   git fork https://github.com/Jefranulislam/aqarat-Real-estate-CRM.git
   ```

2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```

3. **Make your changes**
   - Follow the existing code style
   - Add tests for new features
   - Update documentation as needed

4. **Commit your changes**
   ```bash
   git commit -m "feat: add amazing feature"
   ```

5. **Push to your branch**
   ```bash
   git push origin feature/amazing-feature
   ```

6. **Open a Pull Request**

### Code Style Guidelines

- Use TypeScript for all new code
- Follow the existing component structure
- Use Tailwind CSS for styling
- Write meaningful commit messages
- Add JSDoc comments for complex functions

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Next.js Team** for the amazing React framework
- **Tailwind CSS** for the utility-first CSS framework
- **Radix UI** for accessible component primitives
- **PostgreSQL** for the robust database system
- **All Contributors** who help make this project better

---

## 📞 Support

If you have any questions or need help with setup, please:

1. Check the [Issues](https://github.com/Jefranulislam/aqarat-Real-estate-CRM/issues) page
2. Create a new issue if your problem isn't already listed
3. Provide detailed information about your setup and the issue

---

<div align="center">

**Built with ❤️ for the real estate community**

⭐ **Star this repo if you find it helpful!** ⭐

</div>