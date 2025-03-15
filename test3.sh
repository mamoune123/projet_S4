#!/bin/bash

# Variables
BASE_URL="http://localhost:5001"
NORMAL_USERNAME_1="normal_user_1"
NORMAL_EMAIL_1="minadoussmindaouss@gmail.com"
NORMAL_PASSWORD_1="password1"
NORMAL_USERNAME_2="SALIM BOUTAMENT"
NORMAL_EMAIL_2="sboutament@gmail.com"
NORMAL_PASSWORD_2="password2"
MANAGER_USERNAME="manager_user"
MANAGER_EMAIL="mamoune.abbad-el-andaloussi3@etu.univ-lorraine.fr"
MANAGER_PASSWORD="password"
PROJECT_ID="" # Will be set after creating a project
NORMAL_USER_ID_1="" # Will be set after registering the first normal user
NORMAL_USER_ID_2="" # Will be set after registering the second normal user
MANAGER_USER_ID="" # Will be set after registering the manager
NORMAL_ACCESS_TOKEN_1="" # Will be set after logging in as the first normal user
NORMAL_ACCESS_TOKEN_2="" # Will be set after logging in as the second normal user
MANAGER_ACCESS_TOKEN="" # Will be set after logging in as manager
TASK_ID_1="" # Will be set after creating task 1
TASK_ID_2="" # Will be set after creating task 2
TASK_ID_3="" # Will be set after creating task 3

# Function to print a separator
print_separator() {
  echo "--------------------------------------------------"
}

# 1. Register the First Normal User
echo "Registering the first normal user..."
normal_register_response_1=$(curl -s -X POST "$BASE_URL/auth/register" -H "Content-Type: application/json" -d '{
  "username": "'"$NORMAL_USERNAME_1"'",
  "email": "'"$NORMAL_EMAIL_1"'",
  "password": "'"$NORMAL_PASSWORD_1"'"
}')
echo "First Normal User Register Response: $normal_register_response_1"
NORMAL_USER_ID_1=$(echo $normal_register_response_1 | jq -r '.user.id') # Extract the first normal user ID
print_separator

# 2. Register the Second Normal User
echo "Registering the second normal user..."
normal_register_response_2=$(curl -s -X POST "$BASE_URL/auth/register" -H "Content-Type: application/json" -d '{
  "username": "'"$NORMAL_USERNAME_2"'",
  "email": "'"$NORMAL_EMAIL_2"'",
  "password": "'"$NORMAL_PASSWORD_2"'"
}')
echo "Second Normal User Register Response: $normal_register_response_2"
NORMAL_USER_ID_2=$(echo $normal_register_response_2 | jq -r '.user.id') # Extract the second normal user ID
print_separator

# 3. Register a Manager User
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

# 4. Login as the First Normal User
echo "Logging in as the first normal user..."
normal_login_response_1=$(curl -s -X POST "$BASE_URL/auth/login" -H "Content-Type: application/json" -d '{
  "email": "'"$NORMAL_EMAIL_1"'",
  "password": "'"$NORMAL_PASSWORD_1"'"
}')
echo "First Normal User Login Response: $normal_login_response_1"
NORMAL_ACCESS_TOKEN_1=$(echo $normal_login_response_1 | jq -r '.accessToken') # Extract the first normal user access token
print_separator

# 5. Login as the Second Normal User
echo "Logging in as the second normal user..."
normal_login_response_2=$(curl -s -X POST "$BASE_URL/auth/login" -H "Content-Type: application/json" -d '{
  "email": "'"$NORMAL_EMAIL_2"'",
  "password": "'"$NORMAL_PASSWORD_2"'"
}')
echo "Second Normal User Login Response: $normal_login_response_2"
NORMAL_ACCESS_TOKEN_2=$(echo $normal_login_response_2 | jq -r '.accessToken') # Extract the second normal user access token
print_separator

# 6. Login as Manager
echo "Logging in as manager..."
manager_login_response=$(curl -s -X POST "$BASE_URL/auth/login" -H "Content-Type: application/json" -d '{
  "email": "'"$MANAGER_EMAIL"'",
  "password": "'"$MANAGER_PASSWORD"'"
}')
echo "Manager Login Response: $manager_login_response"
MANAGER_ACCESS_TOKEN=$(echo $manager_login_response | jq -r '.accessToken') # Extract the manager access token
print_separator

# 7. Create a New Project as Manager
echo "Creating a new project as manager..."
project_response=$(curl -s -X POST "$BASE_URL/projects" -H "Content-Type: application/json" -H "Authorization: Bearer $MANAGER_ACCESS_TOKEN" -d '{
  "name": "New Project",
  "description": "This is a new project",
  "created_by": '$MANAGER_USER_ID'
}')
echo "Project Response: $project_response"
PROJECT_ID=$(echo $project_response | jq -r '.id') # Extract the project ID
print_separator

# 8. Add Both Normal Users to the Project as Manager
echo "Adding the first normal user to project ID $PROJECT_ID..."
add_user_response_1=$(curl -s -X POST "$BASE_URL/projects/$PROJECT_ID/users" -H "Content-Type: application/json" -H "Authorization: Bearer $MANAGER_ACCESS_TOKEN" -d '{
  "user_id": '$NORMAL_USER_ID_1',
  "role": "member"
}')
echo "Add First User Response: $add_user_response_1"
print_separator

echo "Adding the second normal user to project ID $PROJECT_ID..."
add_user_response_2=$(curl -s -X POST "$BASE_URL/projects/$PROJECT_ID/users" -H "Content-Type: application/json" -H "Authorization: Bearer $MANAGER_ACCESS_TOKEN" -d '{
  "user_id": '$NORMAL_USER_ID_2',
  "role": "member"
}')
echo "Add Second User Response: $add_user_response_2"
print_separator

# 9. Create Tasks as Manager and Assign to Users
echo "Creating Task 1 and assigning to the first normal user..."
task_response_1=$(curl -s -X POST "$BASE_URL/tasks" -H "Content-Type: application/json" -H "Authorization: Bearer $MANAGER_ACCESS_TOKEN" -d '{
  "title": "Task 1",
  "description": "Description for Task 1",
  "status": "pending",
  "priority": "high",
  "deadline": "2026-12-31T23:59:59Z",
  "project_id": '$PROJECT_ID',
  "assigned_to": ['$NORMAL_USER_ID_1']
}')
echo "Task 1 Response: $task_response_1"
TASK_ID_1=$(echo $task_response_1 | jq -r '.id') # Extract the task 1 ID
print_separator

echo "Creating Task 2 and assigning to the second normal user..."
task_response_2=$(curl -s -X POST "$BASE_URL/tasks" -H "Content-Type: application/json" -H "Authorization: Bearer $MANAGER_ACCESS_TOKEN" -d '{
  "title": "Task 2",
  "description": "Description for Task 2",
  "status": "pending",
  "priority": "medium",
  "deadline": "2026-12-31T23:59:59Z",
  "project_id": '$PROJECT_ID',
  "assigned_to": ['$NORMAL_USER_ID_2']
}')
echo "Task 2 Response: $task_response_2"
TASK_ID_2=$(echo $task_response_2 | jq -r '.id') # Extract the task 2 ID
print_separator

echo "Creating Task 3 and assigning to both normal users..."
task_response_3=$(curl -s -X POST "$BASE_URL/tasks" -H "Content-Type: application/json" -H "Authorization: Bearer $MANAGER_ACCESS_TOKEN" -d '{
  "title": "Task 3",
  "description": "Description for Task 3",
  "status": "pending",
  "priority": "low",
  "deadline": "2026-12-31T23:59:59Z",
  "project_id": '$PROJECT_ID',
  "assigned_to": ['$NORMAL_USER_ID_1', '$NORMAL_USER_ID_2']
}')
echo "Task 3 Response: $task_response_3"
TASK_ID_3=$(echo $task_response_3 | jq -r '.id') # Extract the task 3 ID
print_separator

# 10. First Normal User Updates Task 3 Status to 'in_progress'
echo "First normal user updating Task 3 status to 'in_progress'..."
update_task_response_1=$(curl -s -X PUT "$BASE_URL/tasks/$TASK_ID_3" -H "Content-Type: application/json" -H "Authorization: Bearer $NORMAL_ACCESS_TOKEN_1" -d '{
  "status": "in_progress"
}')
echo "Update Task 3 Response (First User): $update_task_response_1"
print_separator

# 11. Second Normal User Updates Task 3 Status to 'completed'
echo "Second normal user updating Task 3 status to 'completed'..."
update_task_response_2=$(curl -s -X PUT "$BASE_URL/tasks/$TASK_ID_3" -H "Content-Type: application/json" -H "Authorization: Bearer $NORMAL_ACCESS_TOKEN_2" -d '{
  "status": "completed"
}')
echo "Update Task 3 Response (Second User): $update_task_response_2"
print_separator

# 12. Fetch Tasks for the First Normal User
echo "Fetching tasks for the first normal user..."
tasks_response_1=$(curl -s -X GET "$BASE_URL/projects/my/tasks" -H "Authorization: Bearer $NORMAL_ACCESS_TOKEN_1")
echo "Tasks for First Normal User: $tasks_response_1"
print_separator

# 13. Fetch Tasks for the Second Normal User
echo "Fetching tasks for the second normal user..."
tasks_response_2=$(curl -s -X GET "$BASE_URL/projects/my/tasks" -H "Authorization: Bearer $NORMAL_ACCESS_TOKEN_2")
echo "Tasks for Second Normal User: $tasks_response_2"
print_separator

echo "All project management tests completed!"