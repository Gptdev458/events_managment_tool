# BizDev Database Schema Backup
*Created: December 13, 2025*
*Project ID: imvclloqzzpiukhtozav*

## Database Overview
- **Status**: ACTIVE_HEALTHY
- **Region**: eu-central-1
- **PostgreSQL Version**: 15.8.1.085

## Tables

### 1. projects
**Description**: Main BizDev initiatives or opportunities
- **Size**: 120 kB (33 live rows, 38 dead rows)
- **RLS**: Enabled

**Columns:**
- `id` (uuid, PK) - uuid_generate_v4()
- `created_at` (timestamptz) - now()
- `user_id` (uuid) - References auth.users(id) for ownership
- `name` (text, NOT NULL) - Name of the project/opportunity
- `description` (text) - Detailed description of the project
- `rating` (numeric) - Overall calculated or manually set rating (0.0 to 5.0)
- `priority` (text) - CHECK constraint: 'high', 'medium', 'low'
- `status` (text) - CHECK constraint: 'potential', 'active', 'on-hold', 'completed', 'archived'
- `is_ian_collaboration` (boolean) - default false, NOT NULL - True if this is a project specifically for Ian's collaboration
- `detailed_ratings_data` (jsonb) - JSON object storing granular ratings (Revenue Potential, Weights, Runway etc.)

### 2. tasks
**Description**: Tasks associated with projects, supports subtasks via self-referencing foreign key
- **Size**: 112 kB (35 live rows, 0 dead rows)
- **RLS**: Enabled

**Columns:**
- `id` (uuid, PK) - uuid_generate_v4()
- `created_at` (timestamptz) - now()
- `project_id` (uuid, NOT NULL, FK → projects.id ON DELETE CASCADE) - Foreign key linking to the projects table
- `user_id` (uuid) - References auth.users(id) for task assignment
- `text` (text, NOT NULL) - The description of the task
- `completed` (boolean) - default false, NOT NULL - True if the task is completed
- `parent_task_id` (uuid, FK → tasks.id ON DELETE SET NULL) - Foreign key for subtasks, referencing another task ID in this table
- `order` (integer) - Optional field to define task order within a project/parent task
- `status` (text) - Kanban board status: 'todo', 'doing', 'waiting', 'done' (default 'todo')

## Detailed Ratings Data Structure (JSONB)
Example structure for `detailed_ratings_data` field in projects table:

```json
{
  "revenuePotential": { "value": 5, "weight": 0.3 },
  "insiderSupport": { "value": 4, "weight": 0.2 },
  "strategicFitEvolve": { "value": 5, "weight": 0.15 },
  "strategicFitVerticals": { "value": 4, "weight": 0.1 },
  "clarityClient": { "value": 3, "weight": 0.05 },
  "clarityUs": { "value": 4, "weight": 0.05 },
  "effortPotentialClient": { "value": 3, "weight": 0.05 },
  "effortExistingClient": { "value": null, "weight": 0.0 },
  "timingPotentialClient": { "value": 5, "weight": 0.1 },
  "runway": 12
}
```

## Key Features
1. **Dual List/Tab System**: Separate but integrated views for "BizDev Overview" and "Ian Collaboration Focus"
2. **Project Management**: With detailed rating system and priority management
3. **Task Management**: Hierarchical tasks and subtasks
4. **Kanban Board**: Visual task management with status tracking
5. **Rating System**: Comprehensive scoring mechanism with weighted metrics
6. **Collaboration Filtering**: Special views for Ian collaboration projects

## Constraints
- **Priority**: Must be one of 'high', 'medium', 'low'
- **Status**: Must be one of 'potential', 'active', 'on-hold', 'completed', 'archived'
- **Task Status**: Must be one of 'todo', 'doing', 'waiting', 'done'

## Key Relationships
- Projects → Tasks (one-to-many)
- Tasks → Subtasks (self-referencing, hierarchical)
- Projects → User (for ownership)
- Tasks → User (for assignment)

## Cascade Behavior
- **ON DELETE CASCADE**: If a project is deleted, all its associated tasks are also deleted
- **ON DELETE SET NULL**: If a parent task is deleted, its subtasks become top-level tasks (not deleted) 