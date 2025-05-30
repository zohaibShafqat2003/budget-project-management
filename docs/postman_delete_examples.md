# Project Management API - Deletion Operations (DELETE) Examples

This document provides examples of how to make deletion (DELETE) requests to the API using Postman. All examples assume you have a valid authorization token.

## Board Deletion

### Delete Board by Direct ID

```http
DELETE /api/boards/{{boardId}}
Authorization: Bearer {{authToken}}
```

### Delete Board via Project Relationship

```http
DELETE /api/projects/{{projectId}}/boards/{{boardId}}
Authorization: Bearer {{authToken}}
```

## Sprint Deletion

### Delete Sprint by Direct ID

```http
DELETE /api/sprints/{{sprintId}}
Authorization: Bearer {{authToken}}
```

### Remove Stories from a Sprint

```http
DELETE /api/sprints/{{sprintId}}/stories
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

## Story Deletion

### Delete Story by Direct ID

```http
DELETE /api/stories/{{storyId}}
Authorization: Bearer {{authToken}}
```

### Delete Story via Project Relationship

```http
DELETE /api/projects/{{projectId}}/stories/{{storyId}}
Authorization: Bearer {{authToken}}
```

### Remove Labels from a Story

```http
DELETE /api/stories/{{storyId}}/labels
Content-Type: application/json
Authorization: Bearer {{authToken}}

{
  "labelIds": [
    "{{labelId1}}",
    "{{labelId2}}"
  ]
}
```

## Important Notes

1. Deleting resources often has cascading effects:
   - Deleting a board will fail if it has any sprints
   - Deleting a sprint will fail if it's not in Planning status
   - Deleting a story will also delete all its tasks

2. You may need appropriate permissions for deletion operations:
   - Board deletion requires Admin or Product Owner role
   - Sprint deletion requires Admin, Product Owner, or Scrum Master role
   - Story deletion requires Admin or Product Owner role

3. Replace all variables in double curly braces (e.g., `{{projectId}}`) with actual UUIDs from your database.

4. Ensure you have a valid authorization token in the `{{authToken}}` variable.

5. Successful deletion operations typically return a 200 status code with a success message. 