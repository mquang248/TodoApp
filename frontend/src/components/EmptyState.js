import React from 'react';
import { Plus, Calendar, Flag, CheckCircle, List } from 'lucide-react';

const EmptyState = ({ currentView, onCreateTask, onCreateList }) => {
  const getEmptyStateContent = () => {
    switch (currentView) {
      case 'today':
        return {
          icon: <Calendar className="w-16 h-16 text-blue-500" />,
          title: "No tasks today",
          description: "Create new tasks or schedule for tomorrow!",
          actionText: "Create Task",
          onAction: onCreateTask
        };
      case 'scheduled':
        return {
          icon: <Calendar className="w-16 h-16 text-purple-500" />,
          title: "No scheduled tasks",
          description: "Create tasks and set deadlines to see them here.",
          actionText: "Create Task",
          onAction: onCreateTask
        };
      case 'important':
        return {
          icon: <Flag className="w-16 h-16 text-red-500" />,
          title: "No important tasks",
          description: "Mark tasks as important to see them here.",
          actionText: "Create Task",
          onAction: onCreateTask
        };
      case 'deleted':
        return {
          icon: <List className="w-16 h-16 text-gray-500" />,
          title: "No deleted tasks",
          description: "Deleted tasks will appear here.",
          actionText: "Create Task",
          onAction: onCreateTask
        };
      default:
        return {
          icon: <List className="w-16 h-16 text-accent-orange" />,
          title: "No tasks",
          description: "Create your first task to get started.",
          actionText: "Create Task",
          onAction: onCreateTask
        };
    }
  };

  const content = getEmptyStateContent();

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="text-center max-w-md">
        <div className="mb-6">
          {content.icon}
        </div>
        
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          {content.title}
        </h3>
        
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          {content.description}
        </p>

        <div className="space-y-3">
          <button
            onClick={content.onAction}
            className="btn-primary w-full flex items-center justify-center py-3 px-6 text-sm font-medium rounded-lg"
          >
            <Plus className="w-4 h-4 mr-2" />
            {content.actionText}
          </button>
          
          {onCreateList && (
            <button
              onClick={onCreateList}
              className="btn-secondary w-full flex items-center justify-center py-3 px-6 text-sm font-medium rounded-lg"
            >
              <List className="w-4 h-4 mr-2" />
              Create New List
            </button>
          )}
        </div>

      </div>
    </div>
  );
};

export default EmptyState;
