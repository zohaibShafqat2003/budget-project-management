# Database Scripts

This directory contains scripts for managing the database and testing the application workflow.

## Scripts Overview

### 1. Reset Database (`reset-database.js`)

Drops all tables in the database and recreates them based on the current models, then runs the main seed script to populate the database with initial data.

```bash
node scripts/reset-database.js
```

### 2. Seed Boards (`seed-boards.js`)

Creates a default board for each project in the database. This script is useful if you add new projects and want to ensure they all have boards.

```bash
node scripts/seed-boards.js
```

### 3. Test Workflow (`test-workflow.js`)

Tests the workflow of Board-Sprint-Story-Task structure by retrieving and displaying the relationships between these entities. This helps verify that the data model and relationships are working correctly.

```bash
node scripts/test-workflow.js
```

## Reset & Test Workflow

To completely reset your database and test the workflow, run these commands in sequence:

```bash
# Reset the database (drops all tables and recreates them with seed data)
node scripts/reset-database.js

# Test the workflow to ensure everything is set up correctly
node scripts/test-workflow.js
```

## Data Model Hierarchy

Our project management system follows this hierarchy:

1. **Project** - Top-level container for all work
2. **Board** - Organizes work within a project
3. **Epic** - Large body of work that can be broken down into stories
4. **Sprint** - Time-boxed period in which specific work is completed
5. **Story** - User-focused descriptions of functionality
6. **Task** - Specific actionable items that implement a story

Stories can either be:
- Assigned to a Sprint (active work)
- In the Backlog (not yet assigned to a sprint)

## Sample Data

The seed script creates:
- 5 users with different roles
- 2 projects
- 2 boards (one per project)
- 3 epics
- 2 sprints (one active, one in planning)
- 6 stories (3 in sprint, 3 in backlog)
- Multiple tasks for various stories 