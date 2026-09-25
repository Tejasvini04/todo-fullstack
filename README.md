# TaskFlow — Full-Stack To-Do Application

A complete full-stack To-Do application built with:

- React + Vite
- Spring Boot
- Spring Security
- JWT authentication
- BCrypt password hashing
- MySQL
- Spring Data JPA
- REST API
- Axios

## Features

### Authentication
- User registration
- User login
- JWT-based authentication
- BCrypt password hashing
- Protected task APIs
- Logout

### Task management
- Create tasks
- Read/list tasks
- Update tasks
- Mark tasks completed
- Delete tasks
- Filter All / Active / Completed
- Each user can access only their own tasks

## Project structure

```text
todo-fullstack/
├── backend/
│   ├── pom.xml
│   └── src/
├── frontend/
│   ├── package.json
│   └── src/
├── database.sql
└── README.md
```

# 1. Install requirements

Install:

- Java 17 or newer
- Maven
- MySQL 8+
- Node.js 18+ (Node 20+ recommended)
- VS Code (recommended)

Check:

```bash
java -version
mvn -version
node -v
npm -v
```

# 2. Create the database

Start MySQL and run:

```sql
CREATE DATABASE todo_app;
```

Or simply run the included `database.sql`.

The application uses:

```text
Database: todo_app
Username: root
Password: root
Host: localhost
Port: 3306
```

If your MySQL password is different, edit:

```text
backend/src/main/resources/application.properties
```

Change:

```properties
spring.datasource.password=root
```

to your actual MySQL password.

# 3. Start the Spring Boot backend

Open a terminal:

```bash
cd todo-fullstack/backend
mvn spring-boot:run
```

When successful, the API will run at:

```text
http://localhost:8080
```

# 4. Start the React frontend

Open a SECOND terminal:

```bash
cd todo-fullstack/frontend
npm install
npm run dev
```

Vite will show an address similar to:

```text
http://localhost:5173
```

Open that address in your browser.

# 5. Test the application

1. Click Register.
2. Create an account.
3. Login.
4. Add a task.
5. Mark it complete.
6. Edit it.
7. Delete it.
8. Register another account and verify that it does not see the first user's tasks.

## API endpoints

### Authentication

```text
POST /api/auth/register
POST /api/auth/login
```

### Tasks

```text
GET    /api/tasks
POST   /api/tasks
PUT    /api/tasks/{id}
DELETE /api/tasks/{id}
```

Task endpoints require:

```text
Authorization: Bearer <JWT>
```

## Security/data isolation

Passwords are never stored as plain text. Spring Security's BCrypt encoder hashes passwords.

The JWT identifies the logged-in user. Task queries use the authenticated user's database ID:

```text
findByUserIdOrderByCreatedAtDesc(userId)
findByIdAndUserId(taskId, userId)
```

Therefore, a user cannot update/delete a task belonging to another user simply by changing the task ID.

## Important development note

The JWT secret in `application.properties` is a development value. For a real deployment, move secrets into environment variables or a secure secret manager and use a long random secret.

## Common problems

### MySQL connection error

Make sure MySQL is running and that:

```text
todo_app
```

exists.

Then check the username/password in:

```text
backend/src/main/resources/application.properties
```

### Port 8080 already in use

Change:

```properties
server.port=8080
```

to another port, such as:

```properties
server.port=8081
```

Then also change the frontend API URL in:

```text
frontend/src/api.js
```

### Frontend says backend is not running

Start the backend first:

```bash
cd backend
mvn spring-boot:run
```

Then start the frontend:

```bash
cd frontend
npm install
npm run dev
```
