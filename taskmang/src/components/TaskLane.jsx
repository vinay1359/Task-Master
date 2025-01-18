import React from 'react';
import TaskCard from './TaskCard';

const TaskLane = ({ title, icon: Icon, color, tasks, onDragOver, onDrop, onEdit, onDelete, onDragStart }) => {
  return (
    <div
      className={`${color} p-4 rounded-lg shadow-md`}
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      <div className="flex items-center gap-2 mb-4">
        <Icon size={20} />
        <h2 className="text-xl font-bold">{title}</h2>
        <span className="bg-white px-2 py-1 rounded-full text-sm">
          {tasks.length}
        </span>
      </div>
      <div className="space-y-4">
        {tasks.map(task => (
          <TaskCard
            key={task.id}
            task={task}
            onEdit={onEdit}
            onDelete={onDelete}
            onDragStart={onDragStart}
          />
        ))}
      </div>
    </div>
  );
};

export default TaskLane;