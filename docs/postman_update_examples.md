# Project Management API - Update Operations (PUT) Examples

This document provides examples of how to make update (PUT) requests to the API using Postman. All examples assume you have a valid authorization token.

## Board Updates

### Update Board by Direct ID

```http
PUT /api/boards/{{boardId}}
Content-Type: application/json
Authorization: Bearer {{authToken}}

{
  "name": "Updated Board Name",
  "filterJQL": "project=ECOM-001 AND status!=Done"
}
```

### Update Board via Project Relationship

```http
PUT /api/projects/{{projectId}}/boards/{{boardId}}
Content-Type: application/json
Authorization: Bearer {{authToken}}

{
  "name": "Updated Board Name",
  "filterJQL": "project=ECOM-001 AND status!=Done"
}
```

## Sprint Updates

### Update Sprint by Direct ID

```http
PUT /api/sprints/{{sprintId}}
Content-Type: application/json
Authorization: Bearer {{authToken}}

{
  "name": "Updated Sprint Name",
  "goal": "Updated sprint goal",
  "endDate": "2023-12-31T23:59:59.999Z"
}
```

### Update Sprint via Project/Board Relationship

```http
PUT /api/projects/{{projectId}}/boards/{{boardId}}/sprints/{{sprintId}}
Content-Type: application/json
Authorization: Bearer {{authToken}}

{
  "name": "Updated Sprint Name",
  "goal": "Updated sprint goal",
  "endDate": "2023-12-31T23:59:59.999Z"
}
```

### Complete a Sprint by Direct ID

```http
POST /api/sprints/{{sprintId}}/complete
Content-Type: application/json
Authorization: Bearer {{authToken}}

{
  "moveUnfinishedToBacklog": true,
  "retrospectiveNotes": "Sprint went well overall. We need to improve estimation."
}
```

### Complete a Sprint via Project/Board Relationship

```http
POST /api/projects/{{projectId}}/boards/{{boardId}}/sprints/{{sprintId}}/complete
Content-Type: application/json
Authorization: Bearer {{authToken}}

{
  "moveUnfinishedToBacklog": true,
  "retrospectiveNotes": "Sprint went well overall. We need to improve estimation."
}
```

## Story Updates

### Update Story by Direct ID

```http
PUT /api/stories/{{storyId}}
Content-Type: application/json
Authorization: Bearer {{authToken}}

{
  "title": "Updated Story Title",
  "description": "Updated story description",
  "status": "In Progress",
  "priority": "High",
  "points": 5
}
```

### Update Story via Project Relationship

```http
PUT /api/projects/{{projectId}}/stories/{{storyId}}
Content-Type: application/json
Authorization: Bearer {{authToken}}

{
  "title": "Updated Story Title",
  "description": "Updated story description",
  "status": "In Progress",
  "priority": "High",
  "points": 5
}
```

### Mark Story as Ready by Direct ID

```http
PUT /api/stories/{{storyId}}/ready
Content-Type: application/json
Authorization: Bearer {{authToken}}

{
  "isReady": true
}
```

### Mark Story as Ready via Project Relationship

```http
PUT /api/projects/{{projectId}}/stories/{{storyId}}/ready
Content-Type: application/json
Authorization: Bearer {{authToken}}

{
  "isReady": true
}
```

### Assign Story to Sprint by Direct ID

```http
PUT /api/stories/{{storyId}}/sprint
Content-Type: application/json
Authorization: Bearer {{authToken}}

{
  "sprintId": "{{sprintId}}"
}
```

### Assign Story to Sprint via Project Relationship

```http
PUT /api/projects/{{projectId}}/stories/{{storyId}}/sprint
Content-Type: application/json
Authorization: Bearer {{authToken}}

{
  "sprintId": "{{sprintId}}"
}
```

### Remove Story from Sprint (Move to Backlog)

```http
PUT /api/stories/{{storyId}}/sprint
Content-Type: application/json
Authorization: Bearer {{authToken}}

{
  "sprintId": null
}
```

> **Important**: To remove a story from a sprint and move it to the backlog, you must explicitly set `sprintId` to `null` as shown above. This is different from omitting the field.

## Testing Notes

1. Replace all variables in double curly braces (e.g., `{{projectId}}`) with actual UUIDs from your database.
2. Ensure you have a valid authorization token in the `{{authToken}}` variable.
3. You may need to adjust request bodies based on your specific data requirements.
4. All update operations will return the updated object if successful. 