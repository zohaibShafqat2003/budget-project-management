# Project Management API - Creation Operations (POST) Examples

This document provides examples of how to make creation (POST) requests to the API using Postman. All examples assume you have a valid authorization token.

## Board Creation

### Create Board for a Project

```http
POST /api/projects/{{projectId}}/boards
Content-Type: application/json
Authorization: Bearer {{authToken}}

{
  "name": "New Board Name",
  "filterJQL": "project=ECOM-001 AND status=Active"
}
```

## Sprint Creation

### Create Sprint by Direct Endpoint

```http
POST /api/sprints
Content-Type: application/json
Authorization: Bearer {{authToken}}

{
  "boardId": "{{boardId}}",
  "name": "Sprint 1",
  "goal": "Complete initial features",
  "startDate": "2023-06-01T00:00:00.000Z",
  "endDate": "2023-06-14T23:59:59.999Z"
}
```

### Create Sprint for a Board in a Project

```http
POST /api/projects/{{projectId}}/boards/{{boardId}}/sprints
Content-Type: application/json
Authorization: Bearer {{authToken}}

{
  "name": "Sprint 1",
  "goal": "Complete initial features",
  "startDate": "2023-06-01T00:00:00.000Z",
  "endDate": "2023-06-14T23:59:59.999Z"
}
```

### Start a Sprint

```http
POST /api/sprints/{{sprintId}}/start
Content-Type: application/json
Authorization: Bearer {{authToken}}

{
  "goal": "Complete core features for June release",
  "endDate": "2023-06-14T23:59:59.999Z"
}
```

### Add Stories to a Sprint

```http
POST /api/sprints/{{sprintId}}/stories
Content-Type: application/json
Authorization: Bearer {{authToken}}

{
  "storyIds": [
    "{{storyId1}}",
    "{{storyId2}}",
    "{{storyId3}}"
  ]
}
```

## Story Creation

### Create Story by Direct Endpoint

```http
POST /api/stories
Content-Type: application/json
Authorization: Bearer {{authToken}}

{
  "projectId": "{{projectId}}",
  "title": "Implement user authentication",
  "description": "As a user, I want to log in to the system so that I can access my data",
  "status": "To Do",
  "priority": "High",
  "points": 5,
  "acceptanceCriteria": "- User can log in with email/password\n- User can reset password\n- User can log out"
}
```

### Create Story for a Project

```http
POST /api/projects/{{projectId}}/stories
Content-Type: application/json
Authorization: Bearer {{authToken}}

{
  "title": "Implement user authentication",
  "description": "As a user, I want to log in to the system so that I can access my data",
  "status": "To Do",
  "priority": "High",
  "points": 5,
  "acceptanceCriteria": "- User can log in with email/password\n- User can reset password\n- User can log out"
}
```

### Create Story for an Epic

```http
POST /api/epics/{{epicId}}/stories
Content-Type: application/json
Authorization: Bearer {{authToken}}

{
  "title": "Implement user authentication",
  "description": "As a user, I want to log in to the system so that I can access my data",
  "status": "To Do",
  "priority": "High",
  "points": 5,
  "acceptanceCriteria": "- User can log in with email/password\n- User can reset password\n- User can log out"
}
```

### Add Labels to a Story

```http
POST /api/stories/{{storyId}}/labels
Content-Type: application/json
Authorization: Bearer {{authToken}}

{
  "labelIds": [
    "{{labelId1}}",
    "{{labelId2}}"
  ]
}
```

## Testing Notes

1. Replace all variables in double curly braces (e.g., `{{projectId}}`) with actual UUIDs from your database.
2. Ensure you have a valid authorization token in the `{{authToken}}` variable.
3. You may need to adjust request bodies based on your specific data requirements.
4. All creation operations will return the created object if successful. 