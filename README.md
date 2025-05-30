# Jira-Inspired Project Management System

A comprehensive project management system inspired by Jira, with features for budget tracking, task management, and team collaboration.

## Features

- User Authentication (JWT-based)
- Project Management
- Epic, Story, and Task Tracking
- Sprint Planning
- Budget Management
- Client Management
- Team Management
- Dashboard and Reporting

## Tech Stack

### Backend
- Node.js with Express
- PostgreSQL with Sequelize ORM
- JWT Authentication

### Frontend
- React with Next.js
- Tailwind CSS
- Shadcn UI Components

## Project Structure

```
├── backend/             # Node.js API
│   ├── src/
│   │   ├── config/      # Database and app configuration
│   │   ├── controllers/ # Business logic
│   │   ├── middleware/  # Authentication middleware
│   │   ├── models/      # Database models
│   │   ├── routes/      # API routes
│   │   ├── utils/       # Helper functions
│   │   └── server.js    # Entry point
│   └── package.json
│
├── app/                 # Next.js frontend
│   ├── api/             # API routes
│   ├── auth/            # Authentication pages
│   ├── dashboard/       # Dashboard views
│   ├── projects/        # Project views
│   ├── tasks/           # Task views
│   └── layout.tsx       # Main layout
│
├── components/          # Reusable UI components
├── lib/                 # Utility functions
└── README.md
```

## Getting Started

### Prerequisites
- Node.js (v14+)
- PostgreSQL (v12+)

### Backend Setup

1. Navigate to the backend directory:
   ```
   cd backend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file based on `.env.example` and configure your environment variables.

4. Create the PostgreSQL database:
   ```
   createdb budget_project_db
   ```

5. Start the development server:
   ```
   npm run dev
   ```

### Frontend Setup

1. Install dependencies from the root directory:
   ```
   npm install
   ```

2. Start the development server:
   ```
   npm run dev
   ```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Authenticate user
- `POST /api/auth/refresh` - Refresh access token
- `GET /api/auth/me` - Get current user

### Projects
- `GET /api/projects` - Get all projects
- `GET /api/projects/:id` - Get project by ID
- `POST /api/projects` - Create a project
- `PUT /api/projects/:id` - Update a project
- `DELETE /api/projects/:id` - Delete a project

### Epics
- `GET /api/projects/:projectId/epics` - Get all epics for a project
- `GET /api/epics/:id` - Get epic by ID
- `POST /api/epics` - Create an epic
- `PUT /api/epics/:id` - Update an epic
- `DELETE /api/epics/:id` - Delete an epic

### Tasks
- `GET /api/tasks` - Get all tasks
- `GET /api/tasks/:id` - Get task by ID
- `POST /api/tasks` - Create a task
- `PUT /api/tasks/:id` - Update a task
- `DELETE /api/tasks/:id` - Delete a task

## License

This project is licensed under the MIT License. 