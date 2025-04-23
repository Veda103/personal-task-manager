const express = require('express');
const fs = require('fs');
const path = require('path');
const validateTask = require('./middleware/validateTask');

const app = express();
const PORT = 3000;
const tasksFilePath = path.join(__dirname, 'tasks.json');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Helper functions
const readTasks = () => {
  if (!fs.existsSync(tasksFilePath)) return [];
  const data = fs.readFileSync(tasksFilePath, 'utf-8');
  return JSON.parse(data || '[]');
};

const writeTasks = (tasks) => {
  fs.writeFileSync(tasksFilePath, JSON.stringify(tasks, null, 2));
};

// GET all tasks
app.get('/tasks', (req, res) => {
  const tasks = readTasks();
  res.status(200).json(tasks);
});

// GET task by ID
app.get('/tasks/:id', (req, res) => {
  const tasks = readTasks();
  const task = tasks.find(t => t.id === parseInt(req.params.id));
  if (!task) return res.status(404).json({ message: 'Task not found' });
  res.status(200).json(task);
});

// POST new task
app.post('/tasks', validateTask, (req, res) => {
  const tasks = readTasks();
  const newTask = {
    id: Date.now(),
    title: req.body.title,
    status: req.body.status
  };
  tasks.push(newTask);
  writeTasks(tasks);
  res.status(201).json(newTask);
});

// PUT update task
app.put('/tasks/:id', validateTask, (req, res) => {
  const tasks = readTasks();
  const index = tasks.findIndex(t => t.id === parseInt(req.params.id));
  if (index === -1) return res.status(404).json({ message: 'Task not found' });

  tasks[index] = { ...tasks[index], ...req.body };
  writeTasks(tasks);
  res.status(200).json(tasks[index]);
});

// DELETE task
app.delete('/tasks/:id', (req, res) => {
  const tasks = readTasks();
  const filteredTasks = tasks.filter(t => t.id !== parseInt(req.params.id));

  if (filteredTasks.length === tasks.length) {
    return res.status(404).json({ message: 'Task not found' });
  }

  writeTasks(filteredTasks);
  res.status(200).json({ message: 'Task deleted successfully' });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

app.get('/', (req, res) => {
  res.send('Welcome to the Personal Task Manager API by Veda');
});