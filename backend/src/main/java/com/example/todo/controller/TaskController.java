package com.example.todo.controller;

import com.example.todo.dto.TaskRequest;
import com.example.todo.model.Task;
import com.example.todo.model.User;
import com.example.todo.repository.TaskRepository;
import com.example.todo.repository.UserRepository;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/tasks")
public class TaskController {
    private final TaskRepository taskRepository;
    private final UserRepository userRepository;

    public TaskController(TaskRepository taskRepository, UserRepository userRepository) {
        this.taskRepository = taskRepository;
        this.userRepository = userRepository;
    }

    private User currentUser(Authentication authentication) {
        return userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    @GetMapping
    public List<Task> getTasks(Authentication authentication) {
        return taskRepository.findByUserIdOrderByCreatedAtDesc(currentUser(authentication).getId());
    }

    @PostMapping
    public ResponseEntity<Task> createTask(
            @Valid @RequestBody TaskRequest request,
            Authentication authentication) {

        Task task = new Task();
        task.setTitle(request.title().trim());
        task.setDescription(request.description());
        task.setCompleted(request.completed());
        task.setCreatedAt(LocalDateTime.now());
        task.setUser(currentUser(authentication));

        return ResponseEntity.status(HttpStatus.CREATED).body(taskRepository.save(task));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateTask(
            @PathVariable Long id,
            @Valid @RequestBody TaskRequest request,
            Authentication authentication) {

        User user = currentUser(authentication);

        return taskRepository.findByIdAndUserId(id, user.getId())
                .<ResponseEntity<?>>map(task -> {
                    task.setTitle(request.title().trim());
                    task.setDescription(request.description());
                    task.setCompleted(request.completed());
                    return ResponseEntity.ok(taskRepository.save(task));
                })
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body("Task not found."));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteTask(
            @PathVariable Long id,
            Authentication authentication) {

        User user = currentUser(authentication);

        return taskRepository.findByIdAndUserId(id, user.getId())
                .<ResponseEntity<?>>map(task -> {
                    taskRepository.delete(task);
                    return ResponseEntity.noContent().build();
                })
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body("Task not found."));
    }
}
