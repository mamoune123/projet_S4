#!/bin/bash

# Variables
BASE_URL="http://localhost:5001"
USERNAME="azert"
EMAIL="azert@azert.com"
PASSWORD="azert"
PROJECT_ID="" # Will be set after creating a project
USER_ID="" # Will be set after registering a user
ACCESS_TOKEN="" # Will be set after logging in

# Function to print a separator
print_separator() {
  echo "--------------------------------------------------"
}

# 1. Register a New User
echo "Registering a new user..."
register_response=$(curl -s -X POST "$BASE_URL/auth/register" -H "Content-Type: application/json" -d '{
  "username": "'"$USERNAME"'",
  "email": "'"$EMAIL"'",
  "password": "'"$PASSWORD"'"
}')
echo "Register Response: $register_response"
USER_ID=$(echo $register_response | jq -r '.user.id') # Extract the user ID from the response
print_separator

# 2. Login to Get Access Token
echo "Logging in to get access token..."
login_response=$(curl -s -X POST "$BASE_URL/auth/login" -H "Content-Type: application/json" -d '{
  "email": "'"$EMAIL"'",
  "password": "'"$PASSWORD"'"
}')
echo "Login Response: $login_response"
ACCESS_TOKEN=$(echo $login_response | jq -r '.accessToken') # Extract the access token from the response
print_separator

# 3. Create a New Project
echo "Creating a new project..."
project_response=$(curl -s -X POST "$BASE_URL/projects" -H "Content-Type: application/json" -H "Authorization: Bearer $ACCESS_TOKEN" -d '{
  "name": " Project",
  "description": "This a new project",
  "created_by": '$USER_ID'
}')
echo "Project Response: $project_response"
PROJECT_ID=$(echo $project_response | jq -r '.id') # Extract the project ID from the response
print_separator

# 4. Add a User to the Project
echo "Adding a user to project ID $PROJECT_ID..."
add_user_response=$(curl -s -X POST "$BASE_URL/projects/$PROJECT_ID/users" -H "Content-Type: application/json" -H "Authorization: Bearer $ACCESS_TOKEN" -d '{
  "user_id": '$USER_ID',
  "role": "member"
}')
echo "Add User Response: $add_user_response"
print_separator

# 5. Get All Projects for the User
echo "Fetching all projects for user ID $USER_ID..."
curl -s -X GET "$BASE_URL/projects/$USER_ID/projects" -H "Authorization: Bearer $ACCESS_TOKEN"
print_separator

# 6. Create a Task for the Project
echo "Creating a task for project ID $PROJECT_ID..."
task_response=$(curl -s -X POST "$BASE_URL/tasks" -H "Content-Type: application/json" -H "Authorization: Bearer $ACCESS_TOKEN" -d '{
  "title": "Finish project",
  "description": "Complete the task management app",
  "status": "pending",
  "priority": "high",
  "deadline": "2023-12-31T23:59:59Z",
  "user_id": '$USER_ID',
  "project_id": '$PROJECT_ID'
}')
echo "Task Response: $task_response"
TASK_ID=$(echo $task_response | jq -r '.id') # Extract the task ID from the response
print_separator

# 7. Get All Tasks for the Project
echo "Fetching all tasks for project ID $PROJECT_ID..."
curl -s -X GET "$BASE_URL/projects/$PROJECT_ID/tasks" -H "Authorization: Bearer $ACCESS_TOKEN"
print_separator

echo "All project management tests completed!"