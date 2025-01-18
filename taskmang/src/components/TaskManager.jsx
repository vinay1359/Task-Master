import React, { useState, useEffect } from 'react';
import { PlusCircle, X, MoveRight, MoveLeft, Edit2, Search, Tag, Calendar, Filter, AlertCircle, Bell } from 'lucide-react';

const TaskManager = () => {
  const [tasks, setTasks] = useState(() => {
    const savedTasks = localStorage.getItem('tasks');
    return savedTasks ? JSON.parse(savedTasks) : [];
  });
  const [newTask, setNewTask] = useState({ 
    title: '', 
    description: '', 
    priority: 'medium',
    category: '',
    dueDate: '',
    labels: []
  });
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [draggedTask, setDraggedTask] = useState(null);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [notificationPermission, setNotificationPermission] = useState('default');
  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);

  // Check for due tasks and send notifications
  useEffect(() => {
    // Request notification permission
    const requestNotificationPermission = async () => {
      if ("Notification" in window) {
        const permission = await Notification.requestPermission();
        setNotificationPermission(permission);
      }
    };
    requestNotificationPermission();

    // Check for due tasks every minute
    const checkDueTasks = () => {
      const now = new Date();
      tasks.forEach(task => {
        if (task.dueDate) {
          const dueDate = new Date(task.dueDate);
          const timeDiff = dueDate.getTime() - now.getTime();
          
          // Notify 1 day before due date
          if (timeDiff > 0 && timeDiff <= 24 * 60 * 60 * 1000) {
            const hasNotified = localStorage.getItem(`notified_${task.id}`);
            if (!hasNotified && notificationPermission === 'granted') {
              new Notification('Task Due Soon', {
                body: `Task "${task.title}" is due tomorrow!`,
                icon: '/web.png'
              });
              localStorage.setItem(`notified_${task.id}`, 'true');
            }
          }
          
          // Notify on due date
          if (timeDiff <= 0 && timeDiff > -60000) { // Within the last minute
            const hasNotified = localStorage.getItem(`notified_due_${task.id}`);
            if (!hasNotified && notificationPermission === 'granted') {
              new Notification('Task Due Now', {
                body: `Task "${task.title}" is due now!`,
                icon: '/web.png'
              });
              localStorage.setItem(`notified_due_${task.id}`, 'true');
            }
          }
        }
      });
    };

    const intervalId = setInterval(checkDueTasks, 60000); // Check every minute
    
    // Initial check
    checkDueTasks();

    // Cleanup
    return () => clearInterval(intervalId);
  }, [tasks, notificationPermission]);

  // Custom categories
  const categories = ['Work', 'Personal', 'Shopping', 'Health', 'Learning'];
  
  // Custom labels
  const availableLabels = ['Urgent', 'Quick Win', 'Long-term', 'Need Help', 'Important'];

  

  const lanes = {
    todo: { title: 'To Do', color: 'bg-red-100', icon: AlertCircle },
    inProgress: { title: 'In Progress', color: 'bg-yellow-100', icon: Calendar },
    completed: { title: 'Completed', color: 'bg-green-100', icon: Tag }
  };

  // Show notification helper
  const showNotify = (message) => {
    setNotificationMessage(message);
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 3000);
  };

  // Task operations
  const addOrUpdateTask = (e) => {
    e.preventDefault();
    if (editingTask) {
      setTasks(tasks.map(task => {
        if (task.id === editingTask.id) {
          // Clear notification flags when task is updated
          localStorage.removeItem(`notified_${task.id}`);
          localStorage.removeItem(`notified_due_${task.id}`);
          return { ...task, ...newTask };
        }
        return task;
      }));
      showNotify('Task updated successfully!');
    } else {
      const task = {
        id: Date.now(),
        ...newTask,
        status: 'todo',
        createdAt: new Date().toLocaleDateString()
      };
      setTasks([...tasks, task]);
      showNotify('New task created!');
    }
    resetForm();
  };

  const resetForm = () => {
    setNewTask({ 
      title: '', 
      description: '', 
      priority: 'medium',
      category: '',
      dueDate: '',
      labels: []
    });
    setEditingTask(null);
    setIsFormVisible(false);
  };

  const editTask = (task) => {
    setNewTask({ ...task });
    setEditingTask(task);
    setIsFormVisible(true);
  };

  const deleteTask = (taskId) => {
    setTasks(tasks.filter(task => task.id !== taskId));
    showNotify('Task deleted!');
  };

  // Drag and drop handlers
  const handleDragStart = (task) => {
    setDraggedTask(task);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (targetStatus) => {
    if (draggedTask) {
      setTasks(tasks.map(task =>
        task.id === draggedTask.id ? { ...task, status: targetStatus } : task
      ));
      setDraggedTask(null);
      showNotify('Task moved successfully!');
    }
  };

  // Filter tasks
  const filterTasks = (task) => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPriority = filterPriority === 'all' || task.priority === filterPriority;
    const matchesCategory = filterCategory === 'all' || task.category === filterCategory;
    return matchesSearch && matchesPriority && matchesCategory;
  };

  // Progress calculation
  const calculateProgress = () => {
    const total = tasks.length;
    const completed = tasks.filter(task => task.status === 'completed').length;
    return total ? Math.round((completed / total) * 100) : 0;
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
{/* Add notification permission button if not granted */}
{notificationPermission !== 'granted' && (
        <div className="mb-4 p-4 bg-yellow-100 rounded-lg flex items-center gap-2">
          <Bell size={20} />
          <span>Enable notifications to get reminders for due tasks.</span>
          <button
            onClick={() => Notification.requestPermission()}
            className="ml-4 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
          >
            Enable Notifications
          </button>
        </div>
      )}

      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col gap-6 mb-8">
          <div className="flex justify-between items-center">
            <h1 className="text-4xl font-bold text-gray-800">Task Master</h1>
            <button
              onClick={() => setIsFormVisible(true)}
              className="flex items-center gap-2 bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-all transform hover:scale-105"
            >
              <PlusCircle size={20} />
              Create Task
            </button>
          </div>

          
        {/* Feature Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-blue-50">
            <CardContent className="p-6">
              <Clock className="mb-3 text-blue-600" size={24} />
              <h3 className="font-semibold mb-2">Smart Time Management</h3>
              <p className="text-gray-600">Organize tasks with priorities and deadlines to stay on track and never miss important deadlines.</p>
            </CardContent>
          </Card>

          <Card className="bg-purple-50">
            <CardContent className="p-6">
              <CheckCircle className="mb-3 text-purple-600" size={24} />
              <h3 className="font-semibold mb-2">Progress Tracking</h3>
              <p className="text-gray-600">Monitor your productivity with visual progress indicators and completion statistics.</p>
            </CardContent>
          </Card>

          <Card className="bg-green-50">
            <CardContent className="p-6">
              <Info className="mb-3 text-green-600" size={24} />
              <h3 className="font-semibold mb-2">Categories & Filters</h3>
              <p className="text-gray-600">Easily categorize and filter tasks by priority, status, and custom categories.</p>
            </CardContent>
          </Card>
        </div>


          {/* Progress Bar */}
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex justify-between mb-2">
              <span className="font-semibold">Overall Progress</span>
              <span>{calculateProgress()}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-500 rounded-full h-2 transition-all duration-500"
                style={{ width: `${calculateProgress()}%` }}
              />
            </div>
          </div>

          {/* Search and Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search tasks..."
                className="w-full pl-10 pr-4 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              className="p-2 rounded-lg border focus:ring-2 focus:ring-blue-500"
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
            >
              <option value="all">All Priorities</option>
              <option value="low">Low Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="high">High Priority</option>
            </select>
            <select
              className="p-2 rounded-lg border focus:ring-2 focus:ring-blue-500"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
            >
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Task Lanes */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Object.entries(lanes).map(([status, lane]) => (
            <div
              key={status}
              className={`${lane.color} p-4 rounded-lg shadow-md`}
              onDragOver={handleDragOver}
              onDrop={() => handleDrop(status)}
            >
              <div className="flex items-center gap-2 mb-4">
                <lane.icon size={20} />
                <h2 className="text-xl font-bold">{lane.title}</h2>
                <span className="bg-white px-2 py-1 rounded-full text-sm">
                  {tasks.filter(task => task.status === status).length}
                </span>
              </div>
              <div className="space-y-4">
                {tasks
                  .filter(task => task.status === status)
                  .filter(filterTasks)
                  .map(task => (
                    <div
                      key={task.id}
                      className="bg-white p-4 rounded-lg shadow transition-all hover:shadow-lg cursor-move"
                      draggable
                      onDragStart={() => handleDragStart(task)}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold">{task.title}</h3>
                        <div className="flex gap-2">
                          <button
                            onClick={() => editTask(task)}
                            className="text-blue-500 hover:text-blue-700"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => deleteTask(task.id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      </div>
                      <p className="text-gray-600 text-sm mb-2">{task.description}</p>
                      
                      {/* Task Details */}
                      <div className="space-y-2">
                        <div className="flex flex-wrap gap-2">
                          {task.labels.map(label => (
                            <span key={label} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                              {label}
                            </span>
                          ))}
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <span className={`px-2 py-1 rounded ${
                            task.category === 'Work' ? 'bg-purple-100 text-purple-800' :
                            task.category === 'Personal' ? 'bg-green-100 text-green-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {task.category}
                          </span>
                          {task.dueDate && (
                            <span className="text-gray-500">
                              Due: {new Date(task.dueDate).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>

        {/* Task Form Modal */}
        {isFormVisible && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <form onSubmit={addOrUpdateTask} className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">
                  {editingTask ? 'Edit Task' : 'New Task'}
                </h2>
                <button
                  type="button"
                  onClick={resetForm}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={20} />
                </button>
              </div>
              
              <input
                type="text"
                placeholder="Task Title"
                className="w-full p-2 mb-4 border rounded"
                value={newTask.title}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                required
              />
              
              <textarea
                placeholder="Description"
                className="w-full p-2 mb-4 border rounded h-32"
                value={newTask.description}
                onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                required
              />
              
              <select
                className="w-full p-2 mb-4 border rounded"
                value={newTask.priority}
                onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
              >
                <option value="low">Low Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="high">High Priority</option>
              </select>
              
              <select
                className="w-full p-2 mb-4 border rounded"
                value={newTask.category}
                onChange={(e) => setNewTask({ ...newTask, category: e.target.value })}
              >
                <option value="">Select Category</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
              
              <div className="mb-4">
                <label className="block mb-2">Labels</label>
                <div className="flex flex-wrap gap-2">
                  {availableLabels.map(label => (
                    <label key={label} className="flex items-center gap-1">
                      <input
                        type="checkbox"
                        checked={newTask.labels.includes(label)}
                        onChange={(e) => {
                          const updatedLabels = e.target.checked
                            ? [...newTask.labels, label]
                            : newTask.labels.filter(l => l !== label);
                          setNewTask({ ...newTask, labels: updatedLabels });
                        }}
                      />
                      <span className="text-sm">{label}</span>
                    </label>
                  ))}
                </div>
              </div>
              
              <input
                type="date"
                className="w-full p-2 mb-4 border rounded"
                value={newTask.dueDate}
                onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
              />
              
              <button
                type="submit"
                className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
              >
                {editingTask ? 'Update Task' : 'Create Task'}
              </button>
            </form>
          </div>
        )}

        {/* Notification Toast */}
        {showNotification && (
          <div className="fixed bottom-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg transition-all transform animate-bounce">
            {notificationMessage}
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskManager;