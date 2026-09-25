import React, { useEffect, useState } from "react";
import axios from "axios";

import api from "./api";

function AuthScreen({ onLogin }) {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const endpoint = mode === "login" ? "/auth/login" : "/auth/register";
      const payload = mode === "login"
        ? { email: form.email, password: form.password }
        : form;

      const { data } = await api.post(endpoint, payload);
      onLogin(data);
    } catch (err) {
      setError(err.response?.data || "Something went wrong. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page">
      <section className="auth-card">
        <div className="brand">
          <div className="brand-mark">✓</div>
          <div>
            <h1>TaskFlow</h1>
            <p>Simple tasks. Clear progress.</p>
          </div>
        </div>

        <div className="auth-tabs">
          <button className={mode === "login" ? "active" : ""} onClick={() => { setMode("login"); setError(""); }}>
            Login
          </button>
          <button className={mode === "register" ? "active" : ""} onClick={() => { setMode("register"); setError(""); }}>
            Register
          </button>
        </div>

        <form onSubmit={submit}>
          {mode === "register" && (
            <label>
              Name
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Your name"
                required
              />
            </label>
          )}

          <label>
            Email
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="you@example.com"
              required
            />
          </label>

          <label>
            Password
            <input
              type="password"
              minLength="6"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="At least 6 characters"
              required
            />
          </label>

          {error && <div className="error">{error}</div>}

          <button className="primary full" disabled={loading}>
            {loading ? "Please wait..." : mode === "login" ? "Login" : "Create account"}
          </button>
        </form>
      </section>
    </main>
  );
}

function Dashboard({ user, onLogout }) {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [filter, setFilter] = useState("all");
  const [editing, setEditing] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  const loadTasks = async () => {
    try {
      const { data } = await api.get("/tasks");
      setTasks(data);
    } catch {
      setMessage("Could not load tasks.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  const addTask = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      const { data } = await api.post("/tasks", {
        title: title.trim(),
        description: description.trim(),
        completed: false
      });
      setTasks([data, ...tasks]);
      setTitle("");
      setDescription("");
    } catch (err) {
      setMessage(err.response?.data || "Could not create task.");
    }
  };

  const toggleTask = async (task) => {
    try {
      const { data } = await api.put(`/tasks/${task.id}`, {
        title: task.title,
        description: task.description || "",
        completed: !task.completed
      });
      setTasks(tasks.map((t) => t.id === data.id ? data : t));
    } catch {
      setMessage("Could not update task.");
    }
  };

  const saveEdit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.put(`/tasks/${editing.id}`, {
        title: editing.title,
        description: editing.description || "",
        completed: editing.completed
      });
      setTasks(tasks.map((t) => t.id === data.id ? data : t));
      setEditing(null);
    } catch {
      setMessage("Could not update task.");
    }
  };

  const deleteTask = async (id) => {
    if (!window.confirm("Delete this task?")) return;

    try {
      await api.delete(`/tasks/${id}`);
      setTasks(tasks.filter((t) => t.id !== id));
    } catch {
      setMessage("Could not delete task.");
    }
  };

  const filtered = tasks.filter((task) => {
    if (filter === "active") return !task.completed;
    if (filter === "completed") return task.completed;
    return true;
  });

  const completed = tasks.filter((t) => t.completed).length;

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand compact">
          <div className="brand-mark">✓</div>
          <strong>TaskFlow</strong>
        </div>
        <div className="user-area">
          <span>Hi, {user.name}</span>
          <button className="logout" onClick={onLogout}>Logout</button>
        </div>
      </header>

      <main className="dashboard">
        <div className="welcome">
          <div>
            <p className="eyebrow">YOUR WORKSPACE</p>
            <h2>My Tasks</h2>
            <p className="muted">{completed} of {tasks.length} tasks completed</p>
          </div>
        </div>

        <section className="add-card">
          <form onSubmit={addTask}>
            <input
              className="task-title-input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What needs to be done?"
              required
            />
            <input
              className="description-input"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add a description (optional)"
            />
            <button className="primary" type="submit">+ Add Task</button>
          </form>
        </section>

        {message && (
          <div className="notice">
            {message}
            <button onClick={() => setMessage("")}>×</button>
          </div>
        )}

        <div className="toolbar">
          <div className="filters">
            {["all", "active", "completed"].map((item) => (
              <button
                key={item}
                className={filter === item ? "filter active" : "filter"}
                onClick={() => setFilter(item)}
              >
                {item[0].toUpperCase() + item.slice(1)}
              </button>
            ))}
          </div>
          <span className="task-count">{filtered.length} task{filtered.length !== 1 ? "s" : ""}</span>
        </div>

        <section className="task-list">
          {loading ? (
            <div className="empty">Loading tasks...</div>
          ) : filtered.length === 0 ? (
            <div className="empty">
              <div className="empty-icon">✓</div>
              <h3>No tasks here</h3>
              <p>Add a task above and start making progress.</p>
            </div>
          ) : (
            filtered.map((task) => (
              <article className={task.completed ? "task completed" : "task"} key={task.id}>
                <button
                  className="check"
                  onClick={() => toggleTask(task)}
                  aria-label="Toggle completed"
                >
                  {task.completed ? "✓" : ""}
                </button>
                <div className="task-content">
                  <h3>{task.title}</h3>
                  {task.description && <p>{task.description}</p>}
                  <small>{new Date(task.createdAt).toLocaleString()}</small>
                </div>
                <div className="task-actions">
                  <button onClick={() => setEditing({ ...task })}>Edit</button>
                  <button className="danger" onClick={() => deleteTask(task.id)}>Delete</button>
                </div>
              </article>
            ))
          )}
        </section>
      </main>

      {editing && (
        <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && setEditing(null)}>
          <div className="modal">
            <h2>Edit task</h2>
            <form onSubmit={saveEdit}>
              <label>
                Title
                <input
                  value={editing.title}
                  onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                  required
                />
              </label>
              <label>
                Description
                <textarea
                  value={editing.description || ""}
                  onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                  rows="4"
                />
              </label>
              <div className="modal-actions">
                <button type="button" onClick={() => setEditing(null)}>Cancel</button>
                <button className="primary" type="submit">Save changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("todo_user"));
    } catch {
      return null;
    }
  });

  useEffect(() => {
    const expired = () => setUser(null);
    window.addEventListener("auth-expired", expired);
    return () => window.removeEventListener("auth-expired", expired);
  }, []);

  const login = (data) => {
    localStorage.setItem("todo_token", data.token);
    localStorage.setItem("todo_user", JSON.stringify({
      userId: data.userId,
      name: data.name,
      email: data.email
    }));
    setUser({
      userId: data.userId,
      name: data.name,
      email: data.email
    });
  };

  const logout = () => {
    localStorage.removeItem("todo_token");
    localStorage.removeItem("todo_user");
    setUser(null);
  };

  return user
    ? <Dashboard user={user} onLogout={logout} />
    : <AuthScreen onLogin={login} />;
}
