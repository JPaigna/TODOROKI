import React, { useState, useEffect } from "react";
import "./index.css";

const App = () => {
  const [tasks, setTasks] = useState([
    { id: 1, text: "Jog at 6am", completed: false, editing: false },
    { id: 2, text: "Prepare for breakfast at 8", completed: false, editing: false },
    { id: 3, text: "Ready for school", completed: false, editing: false },
    { id: 4, text: "Do homework", completed: false, editing: false },
    { id: 5, text: "Meditate", completed: false, editing: false },
  ]);
  const [filter, setFilter] = useState("all");
  const [darkMode, setDarkMode] = useState(localStorage.getItem("darkMode") === "true");
  const [newTask, setNewTask] = useState("");

  useEffect(() => {
    localStorage.setItem("darkMode", darkMode);
  }, [darkMode]);

  const addTask = () => {
    if (newTask.trim() === "") return;
    setTasks([...tasks, { id: Date.now(), text: newTask.trim(), completed: false, editing: false }]);
    setNewTask("");
  };

  const toggleComplete = (id) => {
    setTasks(tasks.map((task) =>
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };

  const startEditing = (id) => {
    setTasks(tasks.map((task) => task.id === id ? { ...task, editing: true } : task));
  };

  const editTask = (id, newText) => {
    setTasks(tasks.map((task) => task.id === id ? { ...task, text: newText } : task));
  };

  const stopEditing = (id) => {
    setTasks(tasks.map((task) => task.id === id ? { ...task, editing: false } : task));
  };

  const deleteTask = (id) => {
    setTasks(tasks.filter((task) => task.id !== id));
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
                <span>{task.text}</span>
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
