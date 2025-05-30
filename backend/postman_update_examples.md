# Update API Examples for Postman

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

## 1. Update a Project

**Request:**
```
PUT {{base_url}}/projects/{{projectId}}
```

**Example:**
```
PUT http://localhost:5000/api/projects/6e2d6775-1d50-4681-b8ba-4885321e69d1
```

**Headers:**
```
Authorization: Bearer your_jwt_token_here
Content-Type: application/json
```

**Body:**
```json
{
  "name": "Updated Project Name",
  "status": "In Progress",
  "priority": "High",
  "progress": 25,
  "totalBudget": 150000.00
}
```

**Response (Success):**
```json
{
  "success": true,
  "data": {
    "id": "6e2d6775-1d50-4681-b8ba-4885321e69d1",
    "name": "Updated Project Name",
    "status": "In Progress",
    "priority": "High",
    "progress": 25,
    "totalBudget": "150000.00",
    "updatedAt": "2023-06-15T12:00:00.000Z"
  }
}
```

## 2. Update a Board

**Request:**
```
PUT {{base_url}}/boards/{{boardId}}
```

**Example:**
```
PUT http://localhost:5000/api/boards/215ae979-d61a-403a-928d-c1360d2e1c76
```

**Headers:**
```
Authorization: Bearer your_jwt_token_here
Content-Type: application/json
```

**Body:**
```json
{
  "name": "Updated Board Name",
  "filterJQL": "project=PROJ-001 AND status IN ('To Do', 'In Progress')"
}
```

**Response (Success):**
```json
{
  "success": true,
  "data": {
    "id": "215ae979-d61a-403a-928d-c1360d2e1c76",
    "name": "Updated Board Name",
    "filterJQL": "project=PROJ-001 AND status IN ('To Do', 'In Progress')",
    "projectId": "6e2d6775-1d50-4681-b8ba-4885321e69d1",
    "updatedAt": "2023-06-15T12:00:00.000Z"
  }
}
```

## 3. Update a Sprint

**Request:**
```
PUT {{base_url}}/sprints/{{sprintId}}
```

**Example:**
```
PUT http://localhost:5000/api/sprints/9e98a5bc-8414-4660-ac02-d42db3b8ef35
```

**Headers:**
```
Authorization: Bearer your_jwt_token_here
Content-Type: application/json
```

**Body:**
```json
{
  "name": "Sprint 1 - Authentication",
  "goal": "Implement user authentication and authorization",
  "endDate": "2023-07-30"
}
```

**Response (Success):**
```json
{
  "success": true,
  "data": {
    "id": "9e98a5bc-8414-4660-ac02-d42db3b8ef35",
    "name": "Sprint 1 - Authentication",
    "goal": "Implement user authentication and authorization",
    "endDate": "2023-07-30T00:00:00.000Z",
    "updatedAt": "2023-06-15T12:00:00.000Z"
  }
}
```

## 4. Update an Epic

**Request:**
```
PUT {{base_url}}/epics/{{epicId}}
```

**Example:**
```
PUT http://localhost:5000/api/epics/c896b3d0-6d83-4fdb-8b3e-eb69b95ce990
```

**Headers:**
```
Authorization: Bearer your_jwt_token_here
Content-Type: application/json
```

**Body:**
```json
{
  "name": "Authentication and Security",
  "description": "User authentication, authorization, and security features",
  "status": "In Progress",
  "color": "#4287f5"
}
```

**Response (Success):**
```json
{
  "success": true,
  "data": {
    "id": "c896b3d0-6d83-4fdb-8b3e-eb69b95ce990",
    "name": "Authentication and Security",
    "description": "User authentication, authorization, and security features",
    "status": "In Progress",
    "color": "#4287f5",
    "updatedAt": "2023-06-15T12:00:00.000Z"
  }
}
```

## 5. Update a Story

**Request:**
```
PUT {{base_url}}/stories/{{storyId}}
```

**Example:**
```
PUT http://localhost:5000/api/stories/db21dd8c-6ff1-4936-bea1-b89c56a9d3a9
```

**Headers:**
```
Authorization: Bearer your_jwt_token_here
Content-Type: application/json
```

**Body:**
```json
{
  "title": "Implement JWT-based Login",
  "description": "Create login endpoint with JWT token generation",
  "status": "In Progress",
  "assigneeId": "17b07464-9e33-4aef-bf88-5dddef7f9da6",
  "points": 8,
  "isReady": true
}
```

**Response (Success):**
```json
{
  "success": true,
  "data": {
    "id": "db21dd8c-6ff1-4936-bea1-b89c56a9d3a9",
    "title": "Implement JWT-based Login",
    "description": "Create login endpoint with JWT token generation",
    "status": "In Progress",
    "assigneeId": "17b07464-9e33-4aef-bf88-5dddef7f9da6",
    "points": 8,
    "isReady": true,
    "updatedAt": "2023-06-15T12:00:00.000Z"
  }
}
```

## 6. Update a Task

**Request:**
```
PUT {{base_url}}/tasks/{{taskId}}
```

**Example:**
```
PUT http://localhost:5000/api/tasks/504a3e30-9f8b-4c02-b1e5-24fa6f1f3613
```

**Headers:**
```
Authorization: Bearer your_jwt_token_here
Content-Type: application/json
```

**Body:**
```json
{
  "title": "Create JWT Token Generation",
  "description": "Implement JWT token generation with proper expiry",
  "status": "In Progress",
  "assigneeId": "17b07464-9e33-4aef-bf88-5dddef7f9da6",
  "estimatedHours": 6,
  "actualHours": 2
}
```

**Response (Success):**
```json
{
  "success": true,
  "data": {
    "id": "504a3e30-9f8b-4c02-b1e5-24fa6f1f3613",
    "title": "Create JWT Token Generation",
    "description": "Implement JWT token generation with proper expiry",
    "status": "In Progress",
    "assigneeId": "17b07464-9e33-4aef-bf88-5dddef7f9da6",
    "estimatedHours": "6.00",
    "actualHours": "2.00",
    "updatedAt": "2023-06-15T12:00:00.000Z"
  }
}
```

## 7. Update a Budget Item

**Request:**
```
PUT {{base_url}}/projects/{{projectId}}/budgets/{{budgetId}}
```

**Example:**
```
PUT http://localhost:5000/api/projects/6e2d6775-1d50-4681-b8ba-4885321e69d1/budgets/570f9d39-9884-455b-ba31-4f28f6a15133
```

**Headers:**
```
Authorization: Bearer your_jwt_token_here
Content-Type: application/json
```

**Body:**
```json
{
  "name": "Development Team Budget",
  "amount": 45000.00,
  "status": "Active",
  "priority": "High",
  "notes": "Increased budget to accommodate new requirements"
}
```

**Response (Success):**
```json
{
  "success": true,
  "data": {
    "id": "570f9d39-9884-455b-ba31-4f28f6a15133",
    "name": "Development Team Budget",
    "amount": "45000.00",
    "status": "Active",
    "priority": "High",
    "notes": "Increased budget to accommodate new requirements",
    "updatedAt": "2023-06-15T12:00:00.000Z"
  }
}
```

## 8. Update an Expense

**Request:**
```
PUT {{base_url}}/expenses/{{expenseId}}
```

**Example:**
```
PUT http://localhost:5000/api/expenses/ffd98728-8de3-4839-aae8-73a32326a67e
```

**Headers:**
```
Authorization: Bearer your_jwt_token_here
Content-Type: application/json
```

**Body:**
```json
{
  "amount": 5500.00,
  "description": "UI/UX design services with additional screens",
  "category": "Design",
  "paymentMethod": "Bank Transfer",
  "paymentStatus": "Paid",
  "notes": "Paid on June 15, 2023"
}
```

**Response (Success):**
```json
{
  "success": true,
  "data": {
    "id": "ffd98728-8de3-4839-aae8-73a32326a67e",
    "amount": "5500.00",
    "description": "UI/UX design services with additional screens",
    "category": "Design",
    "paymentMethod": "Bank Transfer",
    "paymentStatus": "Paid",
    "notes": "Paid on June 15, 2023",
    "updatedAt": "2023-06-15T12:00:00.000Z"
  }
}
```

## 9. Mark Story as Ready/Not Ready

**Request:**
```
PUT {{base_url}}/stories/{{storyId}}/ready
```

**Example:**
```
PUT http://localhost:5000/api/stories/9d249f3e-449e-4fa2-ad52-1fdb010d0323/ready
```

**Headers:**
```
Authorization: Bearer your_jwt_token_here
Content-Type: application/json
```

**Body:**
```json
{
  "isReady": true
}
```

**Response (Success):**
```json
{
  "success": true,
  "data": {
    "id": "9d249f3e-449e-4fa2-ad52-1fdb010d0323",
    "isReady": true,
    "updatedAt": "2023-06-15T12:00:00.000Z"
  }
}
```

## 10. Assign Story to Sprint

**Request:**
```
PUT {{base_url}}/stories/{{storyId}}/sprint
```

**Example:**
```
PUT http://localhost:5000/api/stories/9d249f3e-449e-4fa2-ad52-1fdb010d0323/sprint
```

**Headers:**
```
Authorization: Bearer your_jwt_token_here
Content-Type: application/json
```

**Body:**
```json
{
  "sprintId": "9e98a5bc-8414-4660-ac02-d42db3b8ef35"
}
```

**Response (Success):**
```json
{
  "success": true,
  "data": {
    "id": "9d249f3e-449e-4fa2-ad52-1fdb010d0323",
    "title": "Fix Logout Bug",
    "sprintId": "9e98a5bc-8414-4660-ac02-d42db3b8ef35",
    "updatedAt": "2023-06-15T12:00:00.000Z"
  }
}
```

## 11. Approve an Expense

**Request:**
```
PUT {{base_url}}/expenses/{{expenseId}}/approve
```

**Example:**
```
PUT http://localhost:5000/api/expenses/ffd98728-8de3-4839-aae8-73a32326a67e/approve
```

**Headers:**
```
Authorization: Bearer your_jwt_token_here
Content-Type: application/json
```

**Body:**
```json
{
  "notes": "Approved after verifying with vendor"
}
```

**Response (Success):**
```json
{
  "success": true,
  "data": {
    "id": "ffd98728-8de3-4839-aae8-73a32326a67e",
    "approvedBy": "12c57265-2d70-4558-ad7c-50f269a3eef3",
    "approvedAt": "2023-06-15T12:00:00.000Z",
    "notes": "Approved after verifying with vendor",
    "updatedAt": "2023-06-15T12:00:00.000Z"
  }
}
```

## 12. Archive a Board

**Request:**
```
POST {{base_url}}/boards/{{boardId}}/archive
```

**Example:**
```
POST http://localhost:5000/api/boards/215ae979-d61a-403a-928d-c1360d2e1c76/archive
```

**Headers:**
```
Authorization: Bearer your_jwt_token_here
Content-Type: application/json
```

**Response (Success):**
```json
{
  "success": true,
  "data": {
    "id": "215ae979-d61a-403a-928d-c1360d2e1c76",
    "name": "Main Dev Board",
    "archived": true,
    "updatedAt": "2023-06-15T12:00:00.000Z"
  }
}
```

## 13. Unarchive a Board

**Request:**
```
POST {{base_url}}/boards/{{boardId}}/unarchive
```

**Example:**
```
POST http://localhost:5000/api/boards/215ae979-d61a-403a-928d-c1360d2e1c76/unarchive
```

**Headers:**
```
Authorization: Bearer your_jwt_token_here
Content-Type: application/json
```

**Response (Success):**
```json
{
  "success": true,
  "data": {
    "id": "215ae979-d61a-403a-928d-c1360d2e1c76",
    "name": "Main Dev Board",
    "archived": false,
    "updatedAt": "2023-06-15T12:00:00.000Z"
  }
}
```

## 14. Update Board through Project Route

**Request:**
```
PUT {{base_url}}/projects/{{projectId}}/boards/{{boardId}}
```

**Example:**
```
PUT http://localhost:5000/api/projects/6e2d6775-1d50-4681-b8ba-4885321e69d1/boards/215ae979-d61a-403a-928d-c1360d2e1c76
```

**Headers:**
```
Authorization: Bearer your_jwt_token_here
Content-Type: application/json
```

**Body:**
```json
{
  "name": "Updated Main Board",
  "filterJQL": "project=PROJ-001 AND priority IN ('High', 'Critical')"
}
```

**Response (Success):**
```json
{
  "success": true,
  "data": {
    "id": "215ae979-d61a-403a-928d-c1360d2e1c76",
    "name": "Updated Main Board",
    "filterJQL": "project=PROJ-001 AND priority IN ('High', 'Critical')",
    "projectId": "6e2d6775-1d50-4681-b8ba-4885321e69d1",
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