import React, { useState } from 'react';
import { format, isToday, isTomorrow, isYesterday } from 'date-fns';
import { 
  Check, 
  Flag, 
  Edit2, 
  Trash2, 
  Clock,
  Link as LinkIcon
} from 'lucide-react';
import { useTasks } from '../context/TaskContext';
import TaskForm from './TaskForm';

const TaskCard = ({ task, isDeleted = false, isMultiSelectMode = false, isSelected = false, onSelect = null }) => {
  const { toggleTask, deleteTask, restoreTask, permanentDeleteTask, lists, updateTask } = useTasks();
  const [showEditForm, setShowEditForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);


  const handleToggle = async () => {
    try {
      await toggleTask(task._id);
    } catch (error) {
      console.error('Error toggling task:', error);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await deleteTask(task._id);
      } catch (error) {
        console.error('Error deleting task:', error);
      }
    }
  };

  const handleRestore = async () => {
    try {
      await restoreTask(task._id);
      alert('Task restored!');
    } catch (error) {
      alert('Error restoring: ' + error.message);
    }
  };

  const handlePermanentDelete = async () => {
    if (window.confirm('Are you sure you want to permanently delete this task?')) {
      try {
        await permanentDeleteTask(task._id);
        alert('Task permanently deleted!');
      } catch (error) {
        alert('Error deleting: ' + error.message);
      }
    }
  };

  const handleStartEdit = () => {
    setIsEditing(true);
    setEditTitle(task.title);
  };

  const handleSaveEdit = async () => {
    if (editTitle.trim() && editTitle !== task.title) {
      try {
        await updateTask(task._id, { title: editTitle.trim() });
      } catch (error) {
        console.error('Error updating task:', error);
        alert('Error updating task: ' + error.message);
      }
    }
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditTitle(task.title);
    setIsEditing(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSaveEdit();
    } else if (e.key === 'Escape') {
      handleCancelEdit();
    }
  };

  const formatDueDate = (date, time) => {
    if (!date) return '';
    
    const dueDate = new Date(date);
    let dateStr = '';
    
    if (isToday(dueDate)) {
      dateStr = 'Today';
    } else if (isTomorrow(dueDate)) {
      dateStr = 'Tomorrow';
    } else if (isYesterday(dueDate)) {
      dateStr = 'Yesterday';
    } else {
      dateStr = format(dueDate, 'MMM d');
    }
    
    if (time) {
      return `${dateStr}, ${time}`;
    }
    
    return dateStr;
  };

  const formatRelativeDate = (createdAt) => {
    if (!createdAt) return '';
    
    const createdDate = new Date(createdAt);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const createdDay = new Date(createdDate.getFullYear(), createdDate.getMonth(), createdDate.getDate());
    
    const diffTime = today - createdDay;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    // Don't show label for tasks created today
    if (diffDays === 0) {
      return '';
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays === 2) {
      return '2 days ago';
    } else if (diffDays >= 3) {
      return format(createdDate, 'dd/MM/yyyy');
    }
    
    return '';
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'text-red-500';
      case 'medium':
        return 'text-yellow-500';
      case 'low':
        return 'text-green-500';
      default:
        return 'text-gray-400';
    }
  };

  const getCategoryColor = (category, customList) => {
    // Custom list styling handled via inline style below
    if (customList) {
      return 'bg-gray-100 text-gray-700 dark:bg-darkBg-tertiary dark:text-gray-300';
    }
    
    switch (category) {
      case 'Today':
        return 'bg-blue-100 text-blue-700 dark:bg-accent-blue/20 dark:text-accent-blue';
      case 'Scheduled':
        return 'bg-purple-100 text-purple-700 dark:bg-accent-red/20 dark:text-accent-red';
      case 'Family Tasks':
        return 'bg-pink-100 text-pink-700 dark:bg-pink-900 dark:text-pink-300';
      case 'Flagged':
        return 'bg-orange-100 text-orange-700 dark:bg-accent-orange/20 dark:text-accent-orange';
      case 'Completed':
        return 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300';
      case 'Work':
        return 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-darkBg-tertiary dark:text-gray-300';
    }
  };

  const getListColorByName = (name) => {
    if (!name || !Array.isArray(lists)) return undefined;
    const found = lists.find(l => l.name === name);
    return found?.color;
  };

  const hexToRgba = (hex, alpha = 0.15) => {
    if (!hex) return undefined;
    const match = hex.replace('#', '');
    const r = parseInt(match.substring(0, 2), 16);
    const g = parseInt(match.substring(2, 4), 16);
    const b = parseInt(match.substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  const getDisplayUrl = (url) => {
    try {
      const u = new URL(url);
      return u.hostname.replace('www.', '');
    } catch {
      return url.length > 30 ? url.slice(0, 30) + '…' : url;
    }
  };

  const getPriorityBadgeClasses = (priority) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300';
      case 'low':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-darkBg-tertiary dark:text-gray-300';
    }
  };

  return (
    <>
      <div className={`task-card group ${task.isCompleted ? 'opacity-60' : ''} ${isDeleted ? 'opacity-75' : ''} flex flex-col`}>
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-2 flex-1">
            {/* Multi-select checkbox */}
            {isMultiSelectMode && !isDeleted && (
              <button
                onClick={() => onSelect && onSelect(task._id)}
                className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                  isSelected
                    ? 'bg-accent-orange border-accent-orange text-white'
                    : 'border-gray-300 dark:border-gray-600 hover:border-accent-orange'
                }`}
              >
                {isSelected && <Check className="w-3 h-3" />}
              </button>
            )}
            
            {/* Regular completion checkbox */}
            {!isMultiSelectMode && !isDeleted && (
              <button
                onClick={handleToggle}
                className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                  task.isCompleted
                    ? 'bg-green-500 border-green-500 text-white'
                    : 'border-gray-300 dark:border-gray-600 hover:border-green-500'
                }`}
              >
                {task.isCompleted && <Check className="w-3 h-3" />}
              </button>
            )}
            
            <div className="flex-1">
              {isEditing ? (
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  onKeyDown={handleKeyPress}
                  onBlur={handleSaveEdit}
                  className="w-full font-medium text-gray-900 dark:text-white bg-transparent border-none outline-none focus:ring-2 focus:ring-accent-orange rounded px-1"
                  autoFocus
                />
              ) : (
                <h3 
                  className={`font-medium text-gray-900 dark:text-white cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 rounded px-1 ${
                    task.isCompleted || isDeleted ? 'line-through' : ''
                  }`}
                  onClick={handleStartEdit}
                  title="Click to edit"
                >
                  {task.emoji && <span className="mr-2">{task.emoji}</span>}
                  {task.title}
                </h3>
              )}
              
              {task.description && task.description.trim() && (
                <p className={`text-sm text-gray-600 dark:text-gray-400 mt-1 ${
                  isDeleted ? 'line-through' : ''
                }`}>
                  {task.description}
                </p>
              )}
              
              {isDeleted && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Deleted {new Date(task.updatedAt).toLocaleDateString('en-US')} at {new Date(task.updatedAt).toLocaleTimeString('en-US')}
                </p>
              )}
            </div>
          </div>
          
          <div className={`flex items-center space-x-1 transition-opacity duration-200 ${isDeleted ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
            {isDeleted ? (
              <>
                <button
                  onClick={handleRestore}
                  className="p-2 text-green-600 hover:text-green-700 hover:bg-green-50 dark:text-green-400 dark:hover:text-green-300 dark:hover:bg-green-900/20 rounded-lg transition-all duration-200"
                  title="Restore"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                  </svg>
                </button>
                <button
                  onClick={handlePermanentDelete}
                  className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20 rounded-lg transition-all duration-200"
                  title="Delete Permanently"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setShowEditForm(true)}
                  className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={handleDelete}
                  className="p-1 text-gray-400 hover:text-red-500"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        </div>



        {/* Meta Information */}
        <div className="space-y-2 mt-auto">
          {/* Category & Priority */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {(() => {
                const listColor = task.customList ? getListColorByName(task.customList) : undefined;
                const style = listColor ? { color: listColor, backgroundColor: hexToRgba(listColor, 0.15) } : undefined;
                const cls = `px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(task.category, task.customList)}`;
                return (
                  <span className={`${cls} -mt-1`} style={style}>
                    {task.customList || task.category}
                  </span>
                );
              })()}
              {task.isFlagged && (
                <Flag className="w-4 h-4 text-accent-orange" />
              )}
            </div>
            
            <div className="flex items-center space-x-2">
              {/* Meta badges: URL, Due, Priority (on the right) */}
              {(task.image || task.dueDate || task.dueTime || (task.priority && task.priority !== 'medium')) && (
                <div className="flex flex-wrap items-center gap-1.5 text-xs">
                  {task.image && task.image.trim() && (
                    <a
                      href={task.image}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center max-w-full truncate px-2 py-1 rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-darkBg-tertiary text-blue-600 dark:text-blue-400 hover:underline"
                      title={task.image}
                    >
                      <LinkIcon className="w-3 h-3 mr-1" />
                      <span className="truncate">{getDisplayUrl(task.image)}</span>
                    </a>
                  )}

                  {(task.dueDate || task.dueTime) && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full bg-gray-100 text-gray-700 dark:bg-darkBg-tertiary dark:text-gray-300 border border-gray-200 dark:border-gray-700">
                      <Clock className="w-3 h-3 mr-1" />
                      {task.dueDate ? formatDueDate(task.dueDate, task.dueTime) : task.dueTime}
                    </span>
                  )}

                  {task.priority && task.priority !== 'medium' && (
                    <span className={`inline-flex items-center px-2 py-1 rounded-full border border-transparent ${getPriorityBadgeClasses(task.priority)}`}>
                      Priority: <span className="ml-1 capitalize">{task.priority}</span>
                    </span>
                  )}
                </div>
              )}
              
              {/* Show relative date for tasks without due date */}
              {!task.isCompleted && !task.dueDate && formatRelativeDate(task.createdAt) && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 dark:bg-darkBg-tertiary dark:text-gray-300 border border-gray-200 dark:border-gray-700">
                  <Clock className="w-3 h-3 mr-1" />
                  {formatRelativeDate(task.createdAt)}
                </span>
              )}
              <div className={`w-2 h-2 rounded-full ${getPriorityColor(task.priority).replace('text-', 'bg-')}`} />
            </div>
          </div>

          {/* Repeat */}
          {task.repeat && task.repeat !== 'none' && (
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Repeats {task.repeat}
            </div>
          )}
        </div>
      </div>

      {/* Edit Form Modal */}
      {showEditForm && (
        <TaskForm
          task={task}
          onClose={() => setShowEditForm(false)}
        />
      )}
    </>
  );
};

export default TaskCard;
