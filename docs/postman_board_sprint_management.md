# Board and Sprint Management Operations

This document provides examples of how to archive/unarchive boards and cancel sprints using Postman. All examples assume you have a valid authorization token.

## Board Archiving

### Archive a Board

Instead of deleting a board that contains sprints or historical data, you can archive it to hide it from active views while preserving all data for reporting.

```http
POST /api/boards/{{boardId}}/archive
Content-Type: application/json
Authorization: Bearer {{authToken}}
```

### Unarchive a Board

If you need to reactivate a previously archived board:

```http
POST /api/boards/{{boardId}}/unarchive
Content-Type: application/json
Authorization: Bearer {{authToken}}
```

### Get Boards Including Archived

By default, the GET board endpoints filter out archived boards. To include archived boards in the response:

```http
GET /api/projects/{{projectId}}/boards?includeArchived=true
Authorization: Bearer {{authToken}}
```

## Sprint Cancellation

### Cancel a Sprint by Direct ID

```http
POST /api/sprints/{{sprintId}}/cancel
Content-Type: application/json
Authorization: Bearer {{authToken}}

{
  "moveUnfinishedToBacklog": true,
  "reason": "Sprint scope changed significantly"
}
```

### Cancel a Sprint via Project/Board Relationship

```http
POST /api/projects/{{projectId}}/boards/{{boardId}}/sprints/{{sprintId}}/cancel
Content-Type: application/json
Authorization: Bearer {{authToken}}

{
  "moveUnfinishedToBacklog": true,
  "reason": "Sprint scope changed significantly"
}
```

## Important Notes

1. **Board Deletion vs Archiving**:
   - Only boards with no sprints can be permanently deleted
   - Boards with historical data (sprints, completed stories) should be archived instead of deleted
   - Archived boards are hidden from default API responses but can still be accessed

2. **Sprint Cancellation**:
   - Only sprints in "Planning" or "Active" status can be cancelled
   - Set `moveUnfinishedToBacklog` to true to automatically move all stories back to the backlog
   - The sprint's status will change to "Cancelled"
   - Cancelled sprints are preserved for reporting purposes

3. **Parameters**:
   - `moveUnfinishedToBacklog` (boolean, optional): Whether to move stories back to backlog (defaults to true)
   - `reason` (string, optional): Reason for cancellation
   - `includeArchived` (boolean, optional): Whether to include archived boards in GET responses 