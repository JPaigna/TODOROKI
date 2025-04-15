import React, { useState, useEffect } from "react";
import "./index.css";

// Correct API_URL
const API_URL = 'https://backend-gg62.onrender.com/api/todos/fetch/';
const API_CREATE_URL = 'https://backend-gg62.onrender.com/api/todos/create/';
const API_UPDATE_URL = 'https://backend-gg62.onrender.com/api/todos/';
const API_DELETE_URL = 'https://backend-gg62.onrender.com/api/todos/';
const TOKEN_URL = 'https://backend-gg62.onrender.com/api/todos/api/token/';
const TOKEN_REFRESH_URL = 'https://backend-gg62.onrender.com/api/todos/api/token/refresh/';

const App = () => {
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState("all");
  const [darkMode, setDarkMode] = useState(localStorage.getItem("darkMode") === "true");
  const [newTask, setNewTask] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [token, setToken] = useState(localStorage.getItem("token") || "");

  // Function to refresh JWT token
  const refreshAuthToken = () => {
    const refreshToken = localStorage.getItem("refreshToken");
    if (!refreshToken) {
      setToken("");
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      return Promise.reject("No refresh token available");
    }
    return fetch(TOKEN_REFRESH_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refresh: refreshToken }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Token refresh failed");
        }
        return response.json();
      })
      .then((data) => {
        setToken(data.access);
        localStorage.setItem("token", data.access);
        return data.access;
      })
      .catch((error) => {
        console.error("Error refreshing token:", error);
        setToken("");
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        throw error;
      });
  };

  // Wrapper for fetch with token refresh handling
  const fetchWithAuth = (url, options = {}) => {
    if (!options.headers) {
      options.headers = {};
    }
    options.headers["Authorization"] = `Bearer ${token}`;

    return fetch(url, options).then((response) => {
      if (response.status === 401) {
        // Unauthorized, try refreshing token
        return refreshAuthToken()
          .then((newToken) => {
            options.headers["Authorization"] = `Bearer ${newToken}`;
            return fetch(url, options);
          })
          .catch((error) => {
            throw error;
          });
      }
      return response;
    });
  };

  // Fetch tasks from the API when the component is mounted or token changes
  useEffect(() => {
    if (!token) return; // Do not fetch if no token

    fetchWithAuth(`${API_URL}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Network response was not ok: ${response.statusText}`);
        }
        return response.json();
      })
      .then((data) => setTasks(data))
      .catch((error) => console.error("Error fetching tasks:", error));

    // Store darkMode preference in localStorage
    localStorage.setItem("darkMode", darkMode);
  }, [darkMode, token]);

  const login = () => {
    fetch(TOKEN_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Login failed");
        }
        return response.json();
      })
      .then((data) => {
        setToken(data.access);
        localStorage.setItem("token", data.access);
        localStorage.setItem("refreshToken", data.refresh);
      })
      .catch((error) => {
        console.error("Error logging in:", error);
        alert("Login failed. Please check your credentials.");
      });
  };

  const addTask = () => {
    if (newTask.trim() === "") return;

    fetchWithAuth(`${API_CREATE_URL}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ title: newTask.trim(), completed: false }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Network response was not ok: ${response.statusText}`);
        }
        return response.json();
      })
      .then((newTaskFromAPI) => {
        setTasks([...tasks, newTaskFromAPI]);
        setNewTask(""); // Reset input field
      })
      .catch((error) => console.error("Error adding task:", error));
  };

  const toggleComplete = (id) => {
    const updatedTasks = tasks.map((task) =>
      task.id === id ? { ...task, completed: !task.completed } : task
    );

    fetchWithAuth(`${API_UPDATE_URL}${id}/update/`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ completed: !tasks.find((task) => task.id === id).completed }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Network response was not ok: ${response.statusText}`);
        }
        return response.json();
      })
      .then(() => setTasks(updatedTasks))
      .catch((error) => console.error("Error updating task completion:", error));
  };

  const startEditing = (id) => {
    setTasks(tasks.map((task) => (task.id === id ? { ...task, editing: true } : task)));
  };

  const editTask = (id, newText) => {
    const updatedTasks = tasks.map((task) =>
      task.id === id ? { ...task, text: newText } : task
    );

    fetchWithAuth(`${API_UPDATE_URL}${id}/update/`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ title: newText }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Network response was not ok: ${response.statusText}`);
        }
        return response.json();
      })
      .then(() => setTasks(updatedTasks))
      .catch((error) => console.error("Error editing task:", error));
  };

  const stopEditing = (id) => {
    setTasks(tasks.map((task) => (task.id === id ? { ...task, editing: false } : task)));
  };

  const deleteTask = (id) => {
    fetchWithAuth(`${API_DELETE_URL}${id}/delete/`, {
      method: "DELETE",
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Network response was not ok: ${response.statusText}`);
        }
        return response.json();
      })
      .then(() => setTasks(tasks.filter((task) => task.id !== id)))
      .catch((error) => console.error("Error deleting task:", error));
  };

  const filteredTasks = tasks.filter((task) => {
    if (filter === "completed") return task.completed;
    if (filter === "pending") return !task.completed;
    return true;
  });

  if (!token) {
    return (
      <div className="login-container">
        <h2>Login</h2>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button onClick={login}>Login</button>
      </div>
    );
  }

  return (
    <div className={`container ${darkMode ? "dark" : "light"}`}>
      <header>
        <button className="dark-mode-toggle" onClick={() => setDarkMode(!darkMode)}>
          {darkMode ? "🌞 Light Mode" : "🌙 Dark Mode"}
        </button>
        <h1>My To-Do List</h1>
      </header>
      <div className="task-input">
        <input
          type="text"
          placeholder="Add a new task..."
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
        />
        <button onClick={addTask}>Add Task</button>
      </div>
      <div className="task-list">
        {filteredTasks.map((task) => (
          <div key={task.id} className={`task-card ${task.completed ? "completed" : ""}`}>
            <div className="task-card-content">
              <input
                type="checkbox"
                checked={task.completed}
                onChange={() => toggleComplete(task.id)}
              />
              {task.editing ? (
                <input
                  type="text"
                  value={task.text}
                  onChange={(e) => editTask(task.id, e.target.value)}
                  onBlur={() => stopEditing(task.id)}
                  autoFocus
                />
              ) : (
                <span>{task.title}</span>  
              )}
            </div>
            <div className="task-actions">
              <button className="edit-btn" onClick={() => startEditing(task.id)}>✏️ Edit</button>
              <button className="delete-btn" onClick={() => deleteTask(task.id)}>🗑️ Delete</button>
            </div>
          </div>
        ))}
      </div>
      <div className="filter-buttons">
        <button className={filter === "all" ? "active" : ""} onClick={() => setFilter("all")}>All</button>
        <button className={filter === "completed" ? "active" : ""} onClick={() => setFilter("completed")}>Completed</button>
        <button className={filter === "pending" ? "active" : ""} onClick={() => setFilter("pending")}>Pending</button>
      </div>
    </div>
  );
};

export default App;