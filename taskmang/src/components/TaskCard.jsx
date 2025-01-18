import React from 'react';
import { Edit2, X } from 'lucide-react';

const TaskCard = ({ task, onEdit, onDelete, onDragStart }) => {
  return (
    <div
      className="bg-white p-4 rounded-lg shadow transition-all hover:shadow-lg cursor-move"
      draggable
      onDragStart={() => onDragStart(task)}
    >
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-semibold">{task.title}</h3>
        <div className="flex gap-2">
          <button
            onClick={() => onEdit(task)}
            className="text-blue-500 hover:text-blue-700"
          >
            <Edit2 size={16} />
          </button>
          <button
            onClick={() => onDelete(task.id)}
            className="text-red-500 hover:text-red-700"
          >
            <X size={16} />
          </button>
        </div>
      </div>
      <p className="text-gray-600 text-sm mb-2">{task.description}</p>
      
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
  );
};

export default TaskCard;