# Deletion API Examples for Postman

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

## 1. Delete a Project

**Request:**
```
DELETE {{base_url}}/projects/{{projectId}}
```

**Example:**
```
DELETE http://localhost:5000/api/projects/6e2d6775-1d50-4681-b8ba-4885321e69d1
```

**Headers:**
```
Authorization: Bearer your_jwt_token_here
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Project deleted successfully"
}
```

## 2. Delete a Board

**Request:**
```
DELETE {{base_url}}/boards/{{boardId}}
```

**Example:**
```
DELETE http://localhost:5000/api/boards/215ae979-d61a-403a-928d-c1360d2e1c76
```

**Headers:**
```
Authorization: Bearer your_jwt_token_here
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Board deleted successfully"
}
```

## 3. Delete a Sprint

**Request:**
```
DELETE {{base_url}}/sprints/{{sprintId}}
```

**Example:**
```
DELETE http://localhost:5000/api/sprints/9e98a5bc-8414-4660-ac02-d42db3b8ef35
```

**Headers:**
```
Authorization: Bearer your_jwt_token_here
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Sprint deleted successfully"
}
```

**Notes:**
- Can only delete sprints in Planning status
- Cannot delete active or completed sprints

## 4. Delete a Story

**Request:**
```
DELETE {{base_url}}/stories/{{storyId}}
```

**Example:**
```
DELETE http://localhost:5000/api/stories/db21dd8c-6ff1-4936-bea1-b89c56a9d3a9
```

**Headers:**
```
Authorization: Bearer your_jwt_token_here
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Story deleted successfully"
}
```

## 5. Delete a Task

**Request:**
```
DELETE {{base_url}}/tasks/{{taskId}}
```

**Example:**
```
DELETE http://localhost:5000/api/tasks/504a3e30-9f8b-4c02-b1e5-24fa6f1f3613
```

**Headers:**
```
Authorization: Bearer your_jwt_token_here
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Task deleted successfully"
}
```

## 6. Delete an Epic

**Request:**
```
DELETE {{base_url}}/epics/{{epicId}}
```

**Example:**
```
DELETE http://localhost:5000/api/epics/c896b3d0-6d83-4fdb-8b3e-eb69b95ce990
```

**Headers:**
```
Authorization: Bearer your_jwt_token_here
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Epic deleted successfully"
}
```

## 7. Delete a Budget Item

**Request:**
```
DELETE {{base_url}}/projects/{{projectId}}/budgets/{{budgetId}}
```

**Example:**
```
DELETE http://localhost:5000/api/projects/6e2d6775-1d50-4681-b8ba-4885321e69d1/budgets/570f9d39-9884-455b-ba31-4f28f6a15133
```

**Headers:**
```
Authorization: Bearer your_jwt_token_here
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Budget item deleted successfully"
}
```

## 8. Delete an Expense

**Request:**
```
DELETE {{base_url}}/expenses/{{expenseId}}
```

**Example:**
```
DELETE http://localhost:5000/api/expenses/ffd98728-8de3-4839-aae8-73a32326a67e
```

**Headers:**
```
Authorization: Bearer your_jwt_token_here
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Expense deleted successfully"
}
```

## 9. Remove Stories from Sprint

**Request:**
```
DELETE {{base_url}}/sprints/{{sprintId}}/stories
```

**Example:**
```
DELETE http://localhost:5000/api/sprints/9e98a5bc-8414-4660-ac02-d42db3b8ef35/stories
```

**Headers:**
```
Authorization: Bearer your_jwt_token_here
Content-Type: application/json
```

**Body:**
```json
{
  "storyIds": ["db21dd8c-6ff1-4936-bea1-b89c56a9d3a9"]
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Stories removed from sprint"
}
```

## 10. Remove Labels from a Story

**Request:**
```
DELETE {{base_url}}/stories/{{storyId}}/labels
```

**Example:**
```
DELETE http://localhost:5000/api/stories/db21dd8c-6ff1-4936-bea1-b89c56a9d3a9/labels
```

**Headers:**
```
Authorization: Bearer your_jwt_token_here
Content-Type: application/json
```

**Body:**
```json
{
  "labelIds": ["label-uuid-here"]
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Labels removed from story"
}
```

## 11. Cancel a Sprint

**Request:**
```
POST {{base_url}}/sprints/{{sprintId}}/cancel
```

**Example:**
```
POST http://localhost:5000/api/sprints/9e98a5bc-8414-4660-ac02-d42db3b8ef35/cancel
```

**Headers:**
```
Authorization: Bearer your_jwt_token_here
Content-Type: application/json
```

**Body:**
```json
{
  "moveUnfinishedToBacklog": true,
  "reason": "Sprint scope changed significantly"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Sprint cancelled successfully",
  "data": {
    "id": "9e98a5bc-8414-4660-ac02-d42db3b8ef35",
    "status": "Cancelled",
    "metadata": {
      "cancelReason": "Sprint scope changed significantly",
      "cancelledAt": "2023-06-15T12:00:00.000Z"
    }
  }
}
```

**Notes:**
- Only sprints in "Planning" or "Active" status can be cancelled
- Set `moveUnfinishedToBacklog` to true to automatically move all stories back to the backlog
- Can also use the project-specific endpoint: `POST /api/projects/{{projectId}}/boards/{{boardId}}/sprints/{{sprintId}}/cancel`

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