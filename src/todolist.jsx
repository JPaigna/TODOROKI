import React, { useState, useEffect } from "react";
import "./index.css";

// Correct API_URL
const API_URL = 'https://backend-gg62.onrender.com/api/myapp/';

const App = () => {
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState("all");
  const [darkMode, setDarkMode] = useState(localStorage.getItem("darkMode") === "true");
  const [newTask, setNewTask] = useState("");

  // Fetch tasks from the API when the component is mounted
  useEffect(() => {
    fetch(`${API_URL}`)  // Correct path with the updated API_URL
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
  }, [darkMode]);

  const addTask = () => {
    if (newTask.trim() === "") return;

    fetch(`${API_URL}`, {  // Correct path to add task with API_URL
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

    fetch(`${API_URL}${id}/`, {  // Correct path to update task completion status
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

    fetch(`${API_URL}${id}/`, {  // Correct path to update task text
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
    fetch(`${API_URL}${id}/`, {  // Correct path to delete task
      method: "DELETE",
    })
      .then(() => setTasks(tasks.filter((task) => task.id !== id)))
      .catch((error) => console.error("Error deleting task:", error));
  };

  const filteredTasks = tasks.filter((task) => {
    if (filter === "completed") return task.completed;
    if (filter === "pending") return !task.completed;
    return true;
  });

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
