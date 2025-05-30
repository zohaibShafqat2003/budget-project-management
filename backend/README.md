# Budget Project Management API

A comprehensive project management API with budget tracking capabilities, inspired by Jira.

## Features

- User authentication with JWT
- Project management (Epics, Stories, Tasks)
- Sprint planning and tracking
- Budget tracking and expense management
- Client management
- File attachments
- Role-based permissions
- Activity logging
- Reporting

## Tech Stack

- Node.js
- Express.js
- PostgreSQL
- Sequelize ORM
- JWT Authentication
- Winston Logging
- Jest Testing

## Getting Started

### Prerequisites

- Node.js (>= 14.x)
- PostgreSQL (>= 13.x)
- npm (>= 7.x)

### Installation

1. Clone the repository
2. Install dependencies
   ```bash
   cd backend
   npm install
   ```
3. Set up environment variables
   ```bash
   cp env.example .env
   # Edit .env with your configuration
   ```
4. Create the database
   ```bash
   # In PostgreSQL
   CREATE DATABASE budget_project_db;
   ```
5. Run migrations
   ```bash
   npm run migrate
   ```
6. (Optional) Seed the database
   ```bash
   npm run seed
   ```

### Running the API

**Development mode**
```bash
npm run dev
```

**Production mode**
```bash
npm start
```

## API Documentation

### Authentication Endpoints

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login and get tokens
- `POST /api/auth/refresh-token` - Refresh the access token

### User Endpoints

- `GET /api/users/profile` - Get current user profile
- `PUT /api/users/profile` - Update current user profile
- `GET /api/users` - Get all users (admin only)
- `PUT /api/users/:id/role` - Update user role (admin only)

### Project Endpoints

- `GET /api/projects` - Get all projects
- `POST /api/projects` - Create a new project
- `GET /api/projects/:id` - Get project details
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project

### Epic Endpoints

- `GET /api/epics` - Get all epics
- `POST /api/epics` - Create a new epic
- `GET /api/epics/:id` - Get epic details
- `PUT /api/epics/:id` - Update epic
- `DELETE /api/epics/:id` - Delete epic

### Story Endpoints

- `GET /api/stories` - Get all stories
- `POST /api/stories` - Create a new story
- `GET /api/stories/:id` - Get story details
- `PUT /api/stories/:id` - Update story
- `DELETE /api/stories/:id` - Delete story

### Task Endpoints

- `GET /api/tasks` - Get all tasks
- `POST /api/tasks` - Create a new task
- `GET /api/tasks/:id` - Get task details
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task

### Sprint Endpoints

- `GET /api/sprints` - Get all sprints
- `POST /api/sprints` - Create a new sprint
- `GET /api/sprints/:id` - Get sprint details
- `PUT /api/sprints/:id` - Update sprint
- `DELETE /api/sprints/:id` - Delete sprint

### Budget Endpoints

- `GET /api/budgets` - Get all budget items
- `POST /api/budgets` - Create a new budget item
- `GET /api/budgets/:id` - Get budget item details
- `PUT /api/budgets/:id` - Update budget item
- `DELETE /api/budgets/:id` - Delete budget item

### Expense Endpoints

- `GET /api/expenses/project/:projectId` - Get all expenses for a project
- `POST /api/expenses` - Create a new expense
- `PUT /api/expenses/:id` - Update expense
- `PUT /api/expenses/:id/approve` - Approve expense
- `PUT /api/expenses/:id/reject` - Reject expense
- `DELETE /api/expenses/:id` - Delete expense

## Project Structure

```
backend/
├── src/
│   ├── config/         # Configuration files
│   ├── controllers/    # Request handlers
│   ├── middleware/     # Express middleware
│   ├── models/         # Sequelize models
│   ├── routes/         # Express routes
│   ├── services/       # Business logic
│   ├── utils/          # Utility functions
│   ├── app.js          # Express app setup
├── tests/              # Jest tests
├── uploads/            # File uploads
├── logs/               # Application logs
├── .env                # Environment variables
└── package.json        # Dependencies and scripts
```

## Database Schema

The API uses the following main models:

- User
- Project
- Epic
- Story
- Task
- Sprint
- BudgetItem
- Expense
- Client
- Attachment
- Comment
- Label

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the ISC License. 

## API Routes

The API uses RESTful conventions with the following base paths:

### Board Routes
- `GET /api/boards/:id` - Get board by ID
- `GET /api/boards/:boardId/backlog` - Get board backlog
- `PUT /api/boards/:id` - Update a board
- `DELETE /api/boards/:id` - Delete a board
- `POST /api/boards/:id/archive` - Archive a board
- `POST /api/boards/:id/unarchive` - Unarchive a board
- `GET /api/projects/:projectId/boards` - Get all boards for a project
- `GET /api/projects/:projectId/boards?includeArchived=true` - Get all boards including archived
- `POST /api/projects/:projectId/boards` - Create a new board for a project
- `PUT /api/projects/:projectId/boards/:boardId` - Update a board within a project

### Story Routes
- `GET /api/stories/:id` - Get story by ID
- `GET /api/epics/:epicId/stories` - Get all stories for an epic
- `GET /api/projects/:projectId/stories` - Get all stories for a project
- `GET /api/projects/:projectId/stories?sprintId=backlog` - Get backlog stories
- `GET /api/projects/:projectId/stories?sprintId=:sprintId` - Get sprint stories
- `POST /api/stories` - Create a new story
- `PUT /api/stories/:id` - Update a story
- `PUT /api/stories/:id/ready` - Mark story as ready/not ready
- `PUT /api/stories/:id/sprint` - Assign story to sprint
- `DELETE /api/stories/:id` - Delete a story

### Sprint Routes
- `GET /api/sprints/:id` - Get sprint by ID
- `PUT /api/sprints/:id` - Update a sprint
- `DELETE /api/sprints/:id` - Delete a sprint
- `POST /api/sprints/:id/start` - Start a sprint
- `POST /api/sprints/:id/complete` - Complete a sprint
- `POST /api/sprints/:id/cancel` - Cancel a sprint
- `POST /api/sprints/:id/stories` - Add stories to a sprint
- `DELETE /api/sprints/:id/stories` - Remove stories from a sprint
- `GET /api/projects/:projectId/sprints` - Get all sprints for a project
- `GET /api/boards/:boardId/sprints` - Get all sprints for a board
- `POST /api/projects/:projectId/boards/:boardId/sprints` - Create a sprint for a board
- `PUT /api/projects/:projectId/boards/:boardId/sprints/:sprintId` - Update a sprint
- `POST /api/projects/:projectId/boards/:boardId/sprints/:sprintId/complete` - Complete a sprint
- `POST /api/projects/:projectId/boards/:boardId/sprints/:sprintId/cancel` - Cancel a sprint

### Budget and Expense Routes
- `GET /api/projects/:projectId/budgets/summary` - Get budget summary
- `GET /api/projects/:projectId/expenses` - Get all expenses for a project
- `GET /api/expenses/:id` - Get expense details
- `POST /api/expenses/:id/approve` - Approve an expense
- `POST /api/expenses/:id/reject` - Reject an expense 