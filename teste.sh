#!/bin/bash

# Variables
BASE_URL="http://localhost:5001"
NORMAL_USERNAME="normal_user"
NORMAL_EMAIL="normal@example.com"
NORMAL_PASSWORD="password"
MANAGER_USERNAME="manager_user"
MANAGER_EMAIL="manager@example.com"
MANAGER_PASSWORD="password"
PROJECT_ID="" # Will be set after creating a project
NORMAL_USER_ID="" # Will be set after registering the normal user
MANAGER_USER_ID="" # Will be set after registering the manager
NORMAL_ACCESS_TOKEN="" # Will be set after logging in as normal user
MANAGER_ACCESS_TOKEN="" # Will be set after logging in as manager
TASK_ID="" # Will be set after creating a task

# Function to print a separator
print_separator() {
  echo "--------------------------------------------------"
}

# 1. Register a Normal User
echo "Registering a normal user..."
normal_register_response=$(curl -s -X POST "$BASE_URL/auth/register" -H "Content-Type: application/json" -d '{
  "username": "'"$NORMAL_USERNAME"'",
  "email": "'"$NORMAL_EMAIL"'",
  "password": "'"$NORMAL_PASSWORD"'"
}')
echo "Normal User Register Response: $normal_register_response"
NORMAL_USER_ID=$(echo $normal_register_response | jq -r '.user.id') # Extract the normal user ID
print_separator

# 2. Register a Manager User
echo "Registering a manager user..."
manager_register_response=$(curl -s -X POST "$BASE_URL/auth/register" -H "Content-Type: application/json" -d '{
  "username": "'"$MANAGER_USERNAME"'",
  "email": "'"$MANAGER_EMAIL"'",
  "password": "'"$MANAGER_PASSWORD"'",
  "role": "manager"
}')
echo "Manager User Register Response: $manager_register_response"
MANAGER_USER_ID=$(echo $manager_register_response | jq -r '.user.id') # Extract the manager user ID
print_separator

# 3. Login as Normal User
echo "Logging in as normal user..."
normal_login_response=$(curl -s -X POST "$BASE_URL/auth/login" -H "Content-Type: application/json" -d '{
  "email": "'"$NORMAL_EMAIL"'",
  "password": "'"$NORMAL_PASSWORD"'"
}')
echo "Normal User Login Response: $normal_login_response"
NORMAL_ACCESS_TOKEN=$(echo $normal_login_response | jq -r '.accessToken') # Extract the normal user access token
print_separator

# 4. Login as Manager
echo "Logging in as manager..."
manager_login_response=$(curl -s -X POST "$BASE_URL/auth/login" -H "Content-Type: application/json" -d '{
  "email": "'"$MANAGER_EMAIL"'",
  "password": "'"$MANAGER_PASSWORD"'"
}')
echo "Manager Login Response: $manager_login_response"
MANAGER_ACCESS_TOKEN=$(echo $manager_login_response | jq -r '.accessToken') # Extract the manager access token
print_separator

# 5. Create a New Project as Manager
echo "Creating a new project as manager..."
project_response=$(curl -s -X POST "$BASE_URL/projects" -H "Content-Type: application/json" -H "Authorization: Bearer $MANAGER_ACCESS_TOKEN" -d '{
  "name": "New aProject",
  "description": "This is aa new project",
  "created_by": '$MANAGER_USER_ID'
}')
echo "Project Response: $project_response"
PROJECT_ID=$(echo $project_response | jq -r '.id') # Extract the project ID
print_separator

# 6. Add Normal User to the Project as Manager
echo "Adding normal user to project ID $PROJECT_ID..."
add_user_response=$(curl -s -X POST "$BASE_URL/projects/$PROJECT_ID/users" -H "Content-Type: application/json" -H "Authorization: Bearer $MANAGER_ACCESS_TOKEN" -d '{
  "user_id": '$NORMAL_USER_ID',
  "role": "member"
}')
echo "Add User Response: $add_user_response"
print_separator

# 7. Create a Task as Manager and Assign to Normal User
echo "Creating a task for project ID $PROJECT_ID and assigning to normal user..."
task_response=$(curl -s -X POST "$BASE_URL/tasks" -H "Content-Type: application/json" -H "Authorization: Bearer $MANAGER_ACCESS_TOKEN" -d '{
  "title": "Finish project",
  "description": "Complete the task management app",
  "status": "pending",
  "priority": "high",
  "deadline": "2026-12-31T23:59:59Z",
  "project_id": '$PROJECT_ID',
  "assigned_to": ['$NORMAL_USER_ID']
}')
echo "Task Response: $task_response"
TASK_ID=$(echo $task_response | jq -r '.id') # Extract the task ID
print_separator

# 8. Normal User Updates Task Status to Completed
echo "Normal user updating task ID $TASK_ID status to 'completed'..."
update_task_response=$(curl -s -X PUT "$BASE_URL/tasks/$TASK_ID" -H "Content-Type: application/json" -H "Authorization: Bearer $NORMAL_ACCESS_TOKEN" -d '{
  "status": "completed"
}')
echo "Update Task Response: $update_task_response"
print_separator

# 9. Get All Tasks for the Project
echo "Fetching projects and assigned tasks for the normal user..."
projects_with_tasks_response=$(curl -s -X GET "$BASE_URL/projects/my/tasks" -H "Authorization: Bearer $NORMAL_ACCESS_TOKEN")
echo "Projects and Tasks Response: $projects_with_tasks_response"
print_separator