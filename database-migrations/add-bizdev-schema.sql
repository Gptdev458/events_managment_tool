-- Add BizDev Schema Migration
-- Created: December 13, 2025
-- Purpose: Add projects and tasks tables for BizDev Pipeline functionality

-- Create projects table
CREATE TABLE IF NOT EXISTS projects (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at timestamptz DEFAULT now(),
    user_id uuid REFERENCES auth.users(id),
    name text NOT NULL,
    description text,
    rating numeric,
    priority text CHECK (priority IN ('high', 'medium', 'low')),
    status text CHECK (status IN ('potential', 'active', 'on-hold', 'completed', 'archived')),
    is_ian_collaboration boolean NOT NULL DEFAULT false,
    detailed_ratings_data jsonb
);

-- Create tasks table with hierarchical structure
CREATE TABLE IF NOT EXISTS tasks (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at timestamptz DEFAULT now(),
    project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    user_id uuid REFERENCES auth.users(id),
    text text NOT NULL,
    completed boolean NOT NULL DEFAULT false,
    parent_task_id uuid REFERENCES tasks(id) ON DELETE SET NULL,
    "order" integer,
    status text DEFAULT 'todo' CHECK (status IN ('todo', 'doing', 'waiting', 'done'))
);

-- Enable RLS on both tables
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for projects table
CREATE POLICY "Users can view all projects" ON projects
    FOR SELECT USING (true);

CREATE POLICY "Users can insert their own projects" ON projects
    FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can update their own projects" ON projects
    FOR UPDATE USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can delete their own projects" ON projects
    FOR DELETE USING (auth.uid() = user_id OR user_id IS NULL);

-- Create RLS policies for tasks table
CREATE POLICY "Users can view all tasks" ON tasks
    FOR SELECT USING (true);

CREATE POLICY "Users can insert tasks for accessible projects" ON tasks
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM projects 
            WHERE id = project_id 
            AND (auth.uid() = user_id OR user_id IS NULL)
        )
    );

CREATE POLICY "Users can update tasks for accessible projects" ON tasks
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM projects 
            WHERE id = project_id 
            AND (auth.uid() = user_id OR user_id IS NULL)
        )
    );

CREATE POLICY "Users can delete tasks for accessible projects" ON tasks
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM projects 
            WHERE id = project_id 
            AND (auth.uid() = user_id OR user_id IS NULL)
        )
    );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_priority ON projects(priority);
CREATE INDEX IF NOT EXISTS idx_projects_is_ian_collaboration ON projects(is_ian_collaboration);

CREATE INDEX IF NOT EXISTS idx_tasks_project_id ON tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_parent_task_id ON tasks(parent_task_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_completed ON tasks(completed);
CREATE INDEX IF NOT EXISTS idx_tasks_order ON tasks("order");

-- Add comments for documentation
COMMENT ON TABLE projects IS 'BizDev initiatives and opportunities with detailed rating system';
COMMENT ON TABLE tasks IS 'Tasks associated with projects, supports hierarchical subtasks and kanban workflow';

COMMENT ON COLUMN projects.detailed_ratings_data IS 'JSON object storing granular ratings with weights for revenue potential, strategic fit, effort, timing, etc.';
COMMENT ON COLUMN projects.is_ian_collaboration IS 'Flag to identify projects specifically for Ian collaboration focus';
COMMENT ON COLUMN tasks.parent_task_id IS 'Self-referencing foreign key for creating subtask hierarchies';
COMMENT ON COLUMN tasks.status IS 'Kanban board status: todo, doing, waiting, done'; 