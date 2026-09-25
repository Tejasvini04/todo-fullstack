# To-Do Backend

Spring Boot REST API with MySQL, Spring Security, BCrypt and JWT.

## Requirements
- Java 17+
- Maven 3.9+
- MySQL 8+

## Database

Open MySQL and run:

```sql
CREATE DATABASE todo_app;
```

Default configuration in `src/main/resources/application.properties`:

```properties
spring.datasource.username=root
spring.datasource.password=root
```

Change the password if your MySQL installation uses another password.

## Run

From this folder:

```bash
mvn spring-boot:run
```

Backend runs at:

`http://localhost:8080`

## API

### Register
`POST /api/auth/register`

```json
{
  "name": "Tejasvini",
  "email": "test@example.com",
  "password": "password123"
}
```

### Login
`POST /api/auth/login`

### Tasks
All task endpoints require:

`Authorization: Bearer <JWT>`

- `GET /api/tasks`
- `POST /api/tasks`
- `PUT /api/tasks/{id}`
- `DELETE /api/tasks/{id}`

The backend always queries tasks by the authenticated user's ID, so users cannot access another user's tasks.
