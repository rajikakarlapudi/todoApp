import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaEdit, FaTrashAlt } from "react-icons/fa"; // Importing React Icons
import "./App.css";

function App() {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [errorMessage, setErrorMessage] = useState(""); // State for empty task error
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editedTaskText, setEditedTaskText] = useState("");

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get("http://localhost:5000/tasks");
      if (Array.isArray(res.data.tasks)) {
        setTasks(res.data.tasks);
      } else {
        setError("Received data is not in the expected format.");
      }
    } catch (err) {
      setError("Failed to fetch tasks from the server.");
    } finally {
      setLoading(false);
    }
  };

  const addTask = async () => {
    if (newTask.trim() === "") {
      setErrorMessage("Task cannot be empty!"); // Show error if input is empty
      return;
    }
    try {
      await axios.post("http://localhost:5000/tasks", { title: newTask });
      setNewTask("");
      setErrorMessage(""); // Clear the error message if task is added
      fetchTasks();
    } catch (err) {
      setError("Failed to add task");
    }
  };

  const deleteTask = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/tasks/${id}`);
      fetchTasks();
    } catch (err) {
      setError("Failed to delete task");
    }
  };

  const toggleTask = async (id, completed) => {
    try {
      await axios.put(`http://localhost:5000/tasks/${id}`, { completed: !completed });
      fetchTasks();
    } catch (err) {
      setError("Failed to update task");
    }
  };

  const editTask = (id, title) => {
    setEditingTaskId(id);
    setEditedTaskText(title);
  };

  const saveEditedTask = async () => {
    if (editedTaskText.trim() === "") return;
    try {
      await axios.put(`http://localhost:5000/tasks/${editingTaskId}`, { title: editedTaskText });
      setEditingTaskId(null);
      setEditedTaskText("");
      fetchTasks();
    } catch (err) {
      setError("Failed to edit task");
    }
  };

  return (
    <div className="app">
      <h1>To-Do App</h1>

      {loading && <p>Loading tasks...</p>}

      {error && <p className="error">{error}</p>}

      <div className="input-section">
        <input
          type="text"
          value={newTask}
          onChange={(e) => {
            setNewTask(e.target.value);
            setErrorMessage(""); // Clear the error message when the user types
          }}
          placeholder="Add a new task..."
        />
        <button onClick={addTask}>Add</button>
      </div>

      {errorMessage && <p className="error">{errorMessage}</p>} {/* Display error message */}

      <ul>
        {Array.isArray(tasks) && tasks.length > 0 ? (
          tasks.map((task, index) => (
            <li key={task.id} className={task.completed ? "completed" : ""}>
              {editingTaskId === task.id ? (
                <div>
                  <input
                    type="text"
                    value={editedTaskText}
                    onChange={(e) => setEditedTaskText(e.target.value)}
                  />
                  <button className="save" onClick={saveEditedTask}>Save</button>
                </div>
              ) : (
                <div className="todo">
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => toggleTask(task.id, task.completed)}
                  />
                  <span>{`${index + 1}. ${task.title}`}</span>
                  <div className="edit-delete-buttons">
                    <button className="edit" onClick={() => editTask(task.id, task.title)}>
                      <FaEdit />
                    </button>
                    <button className="delete" onClick={() => deleteTask(task.id)}>
                      <FaTrashAlt />
                    </button>
                  </div>
                </div>
              )}
            </li>
          ))
        ) : (
          <p>No tasks available</p>
        )}
      </ul>
    </div>
  );
}

export default App;
