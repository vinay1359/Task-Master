import React from 'react';
import { X } from 'lucide-react';

const TaskForm = ({ task, onSubmit, onClose, categories, availableLabels }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <form onSubmit={onSubmit} className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">
            {task.id ? 'Edit Task' : 'New Task'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={20} />
          </button>
        </div>
        
        <input
          type="text"
          placeholder="Task Title"
          className="w-full p-2 mb-4 border rounded"
          value={task.title}
          onChange={(e) => onSubmit({ ...task, title: e.target.value })}
          required
        />
        
        <textarea
          placeholder="Description"
          className="w-full p-2 mb-4 border rounded h-32"
          value={task.description}
          onChange={(e) => onSubmit({ ...task, description: e.target.value })}
          required
        />
        
        <select
          className="w-full p-2 mb-4 border rounded"
          value={task.priority}
          onChange={(e) => onSubmit({ ...task, priority: e.target.value })}
        >
          <option value="low">Low Priority</option>
          <option value="medium">Medium Priority</option>
          <option value="high">High Priority</option>
        </select>
        
        <select
          className="w-full p-2 mb-4 border rounded"
          value={task.category}
          onChange={(e) => onSubmit({ ...task, category: e.target.value })}
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
                  checked={task.labels.includes(label)}
                  onChange={(e) => {
                    const updatedLabels = e.target.checked
                      ? [...task.labels, label]
                      : task.labels.filter(l => l !== label);
                    onSubmit({ ...task, labels: updatedLabels });
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
          value={task.dueDate}
          onChange={(e) => onSubmit({ ...task, dueDate: e.target.value })}
        />
        
        <button
          type="submit"
          className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
        >
          {task.id ? 'Update Task' : 'Create Task'}
        </button>
      </form>
    </div>
  );
};

export default TaskForm;