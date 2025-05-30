# Creation API Examples for Postman

## Authentication

All requests require authentication. Add this header to all requests:

```
Authorization: Bearer your_jwt_token_here
```

You can get a token by making a POST request to `/api/auth/login` with:
```json
{
  "email": "admin@example.com",
  "password": "your_password"
}
```

## 1. Create a Project

**Request:**
```
POST {{base_url}}/projects
```

**Example:**
```
POST http://localhost:5000/api/projects
```

**Headers:**
```
Authorization: Bearer your_jwt_token_here
Content-Type: application/json
```

**Body:**
```json
{
  "name": "New Project",
  "startDate": "2023-07-01",
  "completionDate": "2023-12-31",
  "type": "Scrum",
  "status": "Active",
  "priority": "Medium",
  "totalBudget": 100000.00,
  "metadata": {
    "customFields": {},
    "workflowConfig": {
      "statuses": ["Created", "To Do", "In Progress", "Review", "Done", "Closed"],
      "defaultStatus": "To Do"
    }
  }
}
```

**Response (Success):**
```json
{
  "success": true,
  "data": {
    "id": "generated-uuid",
    "projectIdStr": "PROJ-001",
    "name": "New Project",
    "ownerId": "user-uuid",
    "startDate": "2023-07-01T00:00:00.000Z",
    "completionDate": "2023-12-31T00:00:00.000Z",
    "type": "Scrum",
    "status": "Active",
    "progress": 0,
    "priority": "Medium",
    "totalBudget": "100000.00",
    "usedBudget": "0.00",
    "metadata": {
      "customFields": {},
      "workflowConfig": {
        "statuses": ["Created", "To Do", "In Progress", "Review", "Done", "Closed"],
        "defaultStatus": "To Do"
      }
    },
    "createdAt": "2023-06-15T12:00:00.000Z",
    "updatedAt": "2023-06-15T12:00:00.000Z"
  }
}
```

## 2. Create a Board

**Request:**
```
POST {{base_url}}/projects/{{projectId}}/boards
```

**Example:**
```
POST http://localhost:5000/api/projects/6e2d6775-1d50-4681-b8ba-4885321e69d1/boards
```

**Headers:**
```
Authorization: Bearer your_jwt_token_here
Content-Type: application/json
```

**Body:**
```json
{
  "name": "New Board",
  "filterJQL": "project=PROJ-001"
}
```

**Response (Success):**
```json
{
  "success": true,
  "data": {
    "id": "generated-uuid",
    "name": "New Board",
    "filterJQL": "project=PROJ-001",
    "projectId": "6e2d6775-1d50-4681-b8ba-4885321e69d1",
    "createdAt": "2023-06-15T12:00:00.000Z",
    "updatedAt": "2023-06-15T12:00:00.000Z"
  }
}
```

## 3. Create a Sprint

**Request:**
```
POST {{base_url}}/sprints
```

**Example:**
```
POST http://localhost:5000/api/sprints
```

**Headers:**
```
Authorization: Bearer your_jwt_token_here
Content-Type: application/json
```

**Body:**
```json
{
  "boardId": "215ae979-d61a-403a-928d-c1360d2e1c76",
  "name": "Sprint 2",
  "goal": "Backend API Implementation",
  "startDate": "2023-07-01",
  "endDate": "2023-07-15"
}
```

**Response (Success):**
```json
{
  "success": true,
  "data": {
    "id": "generated-uuid",
    "boardId": "215ae979-d61a-403a-928d-c1360d2e1c76",
    "ownerId": "user-uuid",
    "name": "Sprint 2",
    "goal": "Backend API Implementation",
    "startDate": "2023-07-01T00:00:00.000Z",
    "endDate": "2023-07-15T00:00:00.000Z",
    "status": "Planning",
    "isLocked": false,
    "completedPoints": 0,
    "totalPoints": 0,
    "retrospective": null,
    "velocity": 0,
    "order": 0,
    "metadata": {},
    "createdAt": "2023-06-15T12:00:00.000Z",
    "updatedAt": "2023-06-15T12:00:00.000Z"
  }
}
```

## 4. Create an Epic

**Request:**
```
POST {{base_url}}/epics
```

**Example:**
```
POST http://localhost:5000/api/epics
```

**Headers:**
```
Authorization: Bearer your_jwt_token_here
Content-Type: application/json
```

**Body:**
```json
{
  "projectId": "6e2d6775-1d50-4681-b8ba-4885321e69d1",
  "name": "Authentication System",
  "description": "User authentication and authorization features",
  "status": "To Do",
  "startDate": "2023-07-01",
  "endDate": "2023-07-31",
  "color": "#FF5733"
}
```

**Response (Success):**
```json
{
  "success": true,
  "data": {
    "id": "generated-uuid",
    "projectId": "6e2d6775-1d50-4681-b8ba-4885321e69d1",
    "ownerId": "user-uuid",
    "name": "Authentication System",
    "description": "User authentication and authorization features",
    "status": "To Do",
    "startDate": "2023-07-01T00:00:00.000Z",
    "endDate": "2023-07-31T00:00:00.000Z",
    "color": "#FF5733",
    "order": 0,
    "metadata": {},
    "createdAt": "2023-06-15T12:00:00.000Z",
    "updatedAt": "2023-06-15T12:00:00.000Z"
  }
}
```

## 5. Create a Story

**Request:**
```
POST {{base_url}}/stories
```

**Example:**
```
POST http://localhost:5000/api/stories
```

**Headers:**
```
Authorization: Bearer your_jwt_token_here
Content-Type: application/json
```

**Body:**
```json
{
  "projectId": "6e2d6775-1d50-4681-b8ba-4885321e69d1",
  "epicId": "c896b3d0-6d83-4fdb-8b3e-eb69b95ce990",
  "title": "Implement User Registration",
  "description": "Create signup endpoint with email verification",
  "status": "To Do",
  "priority": "High",
  "isReady": false,
  "points": 5,
  "acceptanceCriteria": "Should validate email, password strength, and send verification email"
}
```

**Response (Success):**
```json
{
  "success": true,
  "data": {
    "id": "generated-uuid",
    "projectId": "6e2d6775-1d50-4681-b8ba-4885321e69d1",
    "epicId": "c896b3d0-6d83-4fdb-8b3e-eb69b95ce990",
    "assigneeId": null,
    "reporterId": "user-uuid",
    "title": "Implement User Registration",
    "description": "Create signup endpoint with email verification",
    "status": "To Do",
    "priority": "High",
    "isReady": false,
    "points": 5,
    "acceptanceCriteria": "Should validate email, password strength, and send verification email",
    "startDate": null,
    "dueDate": null,
    "completedDate": null,
    "sprintId": null,
    "order": 0,
    "businessValue": 0,
    "metadata": {},
    "createdAt": "2023-06-15T12:00:00.000Z",
    "updatedAt": "2023-06-15T12:00:00.000Z"
  }
}
```

## 6. Create a Task

**Request:**
```
POST {{base_url}}/tasks
```

**Example:**
```
POST http://localhost:5000/api/tasks
```

**Headers:**
```
Authorization: Bearer your_jwt_token_here
Content-Type: application/json
```

**Body:**
```json
{
  "projectId": "6e2d6775-1d50-4681-b8ba-4885321e69d1",
  "storyId": "db21dd8c-6ff1-4936-bea1-b89c56a9d3a9",
  "title": "Implement Password Hashing",
  "description": "Hash user passwords using bcrypt",
  "status": "To Do",
  "priority": "High",
  "estimatedHours": 3,
  "type": "Task"
}
```

**Response (Success):**
```json
{
  "success": true,
  "data": {
    "id": "generated-uuid",
    "projectId": "6e2d6775-1d50-4681-b8ba-4885321e69d1",
    "storyId": "db21dd8c-6ff1-4936-bea1-b89c56a9d3a9",
    "assigneeId": null,
    "reporterId": "user-uuid",
    "title": "Implement Password Hashing",
    "description": "Hash user passwords using bcrypt",
    "status": "To Do",
    "priority": "High",
    "startDate": null,
    "dueDate": null,
    "completedDate": null,
    "estimatedHours": "3.00",
    "actualHours": "0.00",
    "order": 0,
    "type": "Task",
    "blockers": null,
    "originalEstimate": 0,
    "remainingEstimate": 0,
    "environment": null,
    "reproduceSteps": null,
    "acceptanceCriteria": null,
    "metadata": {},
    "createdAt": "2023-06-15T12:00:00.000Z",
    "updatedAt": "2023-06-15T12:00:00.000Z"
  }
}
```

## 7. Create a Budget Item

**Request:**
```
POST {{base_url}}/projects/{{projectId}}/budgets
```

**Example:**
```
POST http://localhost:5000/api/projects/6e2d6775-1d50-4681-b8ba-4885321e69d1/budgets
```

**Headers:**
```
Authorization: Bearer your_jwt_token_here
Content-Type: application/json
```

**Body:**
```json
{
  "name": "Frontend Development Budget",
  "description": "Budget for frontend development team",
  "category": "Labor",
  "amount": 50000.00,
  "startDate": "2023-07-01",
  "endDate": "2023-09-30",
  "status": "Active",
  "priority": "High"
}
```

**Response (Success):**
```json
{
  "success": true,
  "data": {
    "id": "generated-uuid",
    "projectId": "6e2d6775-1d50-4681-b8ba-4885321e69d1",
    "name": "Frontend Development Budget",
    "description": "Budget for frontend development team",
    "category": "Labor",
    "amount": "50000.00",
    "usedAmount": "0.00",
    "startDate": "2023-07-01T00:00:00.000Z",
    "endDate": "2023-09-30T00:00:00.000Z",
    "status": "Active",
    "priority": "High",
    "notes": null,
    "metadata": {},
    "createdAt": "2023-06-15T12:00:00.000Z",
    "updatedAt": "2023-06-15T12:00:00.000Z"
  }
}
```

## 8. Create an Expense

**Request:**
```
POST {{base_url}}/expenses
```

**Example:**
```
POST http://localhost:5000/api/expenses
```

**Headers:**
```
Authorization: Bearer your_jwt_token_here
Content-Type: application/json
```

**Body:**
```json
{
  "projectId": "6e2d6775-1d50-4681-b8ba-4885321e69d1",
  "budgetItemId": "570f9d39-9884-455b-ba31-4f28f6a15133",
  "amount": 2500.00,
  "description": "UI/UX design services",
  "date": "2023-06-15",
  "category": "Design",
  "paymentMethod": "Bank Transfer",
  "paymentStatus": "Pending"
}
```

**Response (Success):**
```json
{
  "success": true,
  "data": {
    "id": "generated-uuid",
    "projectId": "6e2d6775-1d50-4681-b8ba-4885321e69d1",
    "budgetItemId": "570f9d39-9884-455b-ba31-4f28f6a15133",
    "amount": "2500.00",
    "description": "UI/UX design services",
    "date": "2023-06-15T00:00:00.000Z",
    "category": "Design",
    "paymentMethod": "Bank Transfer",
    "paymentStatus": "Pending",
    "receiptUrl": null,
    "approvedBy": null,
    "approvedAt": null,
    "createdBy": "user-uuid",
    "notes": null,
    "createdAt": "2023-06-15T12:00:00.000Z",
    "updatedAt": "2023-06-15T12:00:00.000Z"
  }
}
```

## 9. Add Stories to Sprint

**Request:**
```
POST {{base_url}}/sprints/{{sprintId}}/stories
```

**Example:**
```
POST http://localhost:5000/api/sprints/9e98a5bc-8414-4660-ac02-d42db3b8ef35/stories
```

**Headers:**
```
Authorization: Bearer your_jwt_token_here
Content-Type: application/json
```

**Body:**
```json
{
  "storyIds": ["db21dd8c-6ff1-4936-bea1-b89c56a9d3a9", "9d249f3e-449e-4fa2-ad52-1fdb010d0323"]
}
```

**Response (Success):**
```json
{
  "success": true,
  "data": {
    "id": "9e98a5bc-8414-4660-ac02-d42db3b8ef35",
    "boardId": "215ae979-d61a-403a-928d-c1360d2e1c76",
    "ownerId": "12c57265-2d70-4558-ad7c-50f269a3eef3",
    "name": "Sprint 1",
    "goal": "Initial setup",
    "startDate": "2025-06-02T00:00:00.000Z",
    "endDate": "2025-06-16T00:00:00.000Z",
    "status": "Planning",
    "isLocked": false,
    "completedPoints": 0,
    "totalPoints": 8,
    "retrospective": null,
    "velocity": 0,
    "order": 0,
    "metadata": {},
    "createdAt": "2025-05-29T17:40:18.613Z",
    "updatedAt": "2025-05-29T17:41:33.017Z",
    "stories": [
      {
        "id": "db21dd8c-6ff1-4936-bea1-b89c56a9d3a9",
        "title": "Implement Login",
        "status": "To Do",
        "points": 5
      },
      {
        "id": "9d249f3e-449e-4fa2-ad52-1fdb010d0323",
        "title": "Fix Logout Bug",
        "status": "To Do",
        "points": 3
      }
    ]
  }
}
```

## 10. Start a Sprint

**Request:**
```
POST {{base_url}}/sprints/{{sprintId}}/start
```

**Example:**
```
POST http://localhost:5000/api/sprints/9e98a5bc-8414-4660-ac02-d42db3b8ef35/start
```

**Headers:**
```
Authorization: Bearer your_jwt_token_here
Content-Type: application/json
```

**Body:**
```json
{
  "goal": "Complete all authentication features",
  "endDate": "2023-07-15"
}
```

**Response (Success):**
```json
{
  "success": true,
  "data": {
    "id": "9e98a5bc-8414-4660-ac02-d42db3b8ef35",
    "boardId": "215ae979-d61a-403a-928d-c1360d2e1c76",
    "ownerId": "12c57265-2d70-4558-ad7c-50f269a3eef3",
    "name": "Sprint 1",
    "goal": "Complete all authentication features",
    "startDate": "2023-06-15T12:00:00.000Z",
    "endDate": "2023-07-15T00:00:00.000Z",
    "status": "Active",
    "isLocked": true,
    "completedPoints": 0,
    "totalPoints": 8,
    "retrospective": null,
    "velocity": 0,
    "order": 0,
    "metadata": {},
    "createdAt": "2025-05-29T17:40:18.613Z",
    "updatedAt": "2023-06-15T12:00:00.000Z"
  }
}
```

## 11. Create a Sprint via Project/Board Path

**Request:**
```
POST {{base_url}}/projects/{{projectId}}/boards/{{boardId}}/sprints
```

**Example:**
```
POST http://localhost:5000/api/projects/6e2d6775-1d50-4681-b8ba-4885321e69d1/boards/215ae979-d61a-403a-928d-c1360d2e1c76/sprints
```

**Headers:**
```
Authorization: Bearer your_jwt_token_here
Content-Type: application/json
```

**Body:**
```json
{
  "name": "Sprint 2",
  "goal": "Implement User Management",
  "startDate": "2023-07-16",
  "endDate": "2023-07-30"
}
```

**Response (Success):**
```json
{
  "success": true,
  "data": {
    "id": "generated-uuid",
    "boardId": "215ae979-d61a-403a-928d-c1360d2e1c76",
    "ownerId": "user-uuid",
    "name": "Sprint 2",
    "goal": "Implement User Management",
    "startDate": "2023-07-16T00:00:00.000Z",
    "endDate": "2023-07-30T00:00:00.000Z",
    "status": "Planning",
    "isLocked": false,
    "completedPoints": 0,
    "totalPoints": 0,
    "retrospective": null,
    "velocity": 0,
    "order": 0,
    "metadata": {},
    "createdAt": "2023-06-15T12:00:00.000Z",
    "updatedAt": "2023-06-15T12:00:00.000Z"
  }
}
```

## 12. Create a Story with Sprint Assignment

**Request:**
```
POST {{base_url}}/stories
```

**Example:**
```
POST http://localhost:5000/api/stories
```

**Headers:**
```
Authorization: Bearer your_jwt_token_here
Content-Type: application/json
```

**Body:**
```json
{
  "projectId": "6e2d6775-1d50-4681-b8ba-4885321e69d1",
  "epicId": "c896b3d0-6d83-4fdb-8b3e-eb69b95ce990",
  "title": "Implement Password Reset",
  "description": "Create password reset flow with email confirmation",
  "status": "To Do",
  "priority": "High",
  "isReady": true,
  "points": 5,
  "sprintId": "9e98a5bc-8414-4660-ac02-d42db3b8ef35"
}
```

**Response (Success):**
```json
{
  "success": true,
  "data": {
    "id": "generated-uuid",
    "projectId": "6e2d6775-1d50-4681-b8ba-4885321e69d1",
    "epicId": "c896b3d0-6d83-4fdb-8b3e-eb69b95ce990",
    "assigneeId": null,
    "reporterId": "user-uuid",
    "title": "Implement Password Reset",
    "description": "Create password reset flow with email confirmation",
    "status": "To Do",
    "priority": "High",
    "isReady": true,
    "points": 5,
    "sprintId": "9e98a5bc-8414-4660-ac02-d42db3b8ef35",
    "startDate": null,
    "dueDate": null,
    "completedDate": null,
    "order": 0,
    "businessValue": 0,
    "metadata": {},
    "createdAt": "2023-06-15T12:00:00.000Z",
    "updatedAt": "2023-06-15T12:00:00.000Z"
  }
}
```

## Common Error Responses:

### Not Found (404):
```json
{
  "success": false,
  "message": "Resource not found"
}
```

### Unauthorized (401):
```json
{
  "success": false,
  "message": "Unauthorized"
}
```

### Forbidden (403):
```json
{
  "success": false,
  "message": "Permission denied"
}
```

### Bad Request (400):
```json
{
  "success": false,
  "message": "Invalid request",
  "errors": [
    {
      "field": "field_name",
      "message": "Error description"
    }
  ]
}
``` 