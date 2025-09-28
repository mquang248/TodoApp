import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, Flag, Repeat } from 'lucide-react';
import { useTasks } from '../context/TaskContext';

const TaskForm = ({ task, onClose, initialCategory = 'All', initialList = '' }) => {
  const { createTask, updateTask } = useTasks();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    emoji: '',
    image: '',
    assignedTo: 'Danny',
    category: initialCategory,
    customList: initialList,
    isFlagged: false,
    dueDate: '',
    dueTime: '',
    repeat: 'none',
    priority: 'medium' // Changed from 'none' to 'medium' to match backend validation
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title || '',
        description: task.description || '',
        emoji: task.emoji || '',
        image: task.image || '',
        assignedTo: task.assignedTo || 'Danny',
        category: task.isFlagged ? 'Flagged' : (task.category || 'All'),
        customList: task.customList || '',
        isFlagged: task.isFlagged || false,
        dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
        dueTime: task.dueTime || '',
        repeat: task.repeat || 'none',
        priority: task.priority || 'medium'
      });
    }
  }, [task]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return;
    
    setLoading(true);

    try {
      // Ensure category is valid for backend
      let validCategory = formData.category;
      if (!['Today', 'Scheduled', 'Family Tasks', 'All', 'Flagged', 'Completed', 'Assigned', 'Work'].includes(validCategory)) {
        validCategory = 'All';
      }
      
      // Ensure priority is valid for backend
      let validPriority = formData.priority;
      if (!['low', 'medium', 'high'].includes(validPriority)) {
        validPriority = 'medium';
      }

      const taskData = {
        ...formData,
        category: validCategory,
        priority: validPriority,
        dueDate: formData.dueDate ? new Date(formData.dueDate) : null
      };

      if (task) {
        await updateTask(task._id, taskData);
      } else {
        await createTask(taskData);
      }
      onClose();
    } catch (error) {
      console.error('TaskForm: Error saving task:', error);
      alert('Error creating task: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSubmit(e);
    }
  };

  const categories = [
    'Today', 'Scheduled', 'Family Tasks', 'All', 'Flagged', 'Completed', 'Assigned', 'Work'
  ];

  const teamMembers = ['Danny', 'Ashley', 'Olivia'];
  const repeatOptions = [
    { value: 'none', label: 'No repeat' },
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' }
  ];
  const priorityOptions = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' }
  ];

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[99999] p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-large w-full max-w-lg border border-gray-200 dark:border-gray-700"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-600">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {task ? 'Edit Task' : 'Add New Task'}
          </h2>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-3 space-y-3">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
              Task Title *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="w-full px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent-orange focus:border-transparent text-sm"
              placeholder="Enter task title..."
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={1}
              className="w-full px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent-orange focus:border-transparent text-sm resize-none"
              placeholder="Add description..."
            />
          </div>
          
          {/* Image URL only */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
              URL
            </label>
            <input
              type="url"
              name="image"
              value={formData.image}
              onChange={handleChange}
              className="w-full px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent-orange focus:border-transparent text-sm"
              placeholder="https://example.com/image.jpg"
            />
          </div>

          {/* Due Date and Time */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                <Calendar className="w-4 h-4 inline mr-1" />
                Due Date
              </label>
               <input
                 type="date"
                 name="dueDate"
                 value={formData.dueDate}
                 onChange={handleChange}
                 className="w-full px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-accent-orange focus:border-transparent text-sm"
               />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                <Clock className="w-4 h-4 inline mr-1" />
                Due Time
              </label>
               <input
                 type="time"
                 name="dueTime"
                 value={formData.dueTime}
                 onChange={handleChange}
                 className="w-full px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-accent-orange focus:border-transparent text-sm"
               />
            </div>
          </div>

           {/* Priority */}
           <div>
             <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
               Priority Level
             </label>
             <select
               name="priority"
               value={formData.priority}
               onChange={handleChange}
               className="w-full px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-accent-orange focus:border-transparent text-sm"
             >
               {priorityOptions.map(option => (
                 <option key={option.value} value={option.value}>
                   {option.label}
                 </option>
               ))}
             </select>
           </div>

           {/* Important - Pill with switch */}
           <div>
             <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
               Important
             </label>
             <div className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 cursor-pointer border-2 ${
               formData.isFlagged 
                 ? 'bg-accent-orange text-white border-accent-orange shadow-md' 
                 : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600'
             }`}
             onClick={() => setFormData(prev => ({ 
               ...prev, 
               isFlagged: !prev.isFlagged,
               category: !prev.isFlagged ? 'Flagged' : (initialCategory || 'All')
             }))}
             >
               <Flag className="w-4 h-4 mr-2" />
               <span>{formData.isFlagged ? 'On' : 'Off'}</span>
               <div className={`ml-2 w-6 h-3 rounded-full transition-colors duration-200 ${
                 formData.isFlagged ? 'bg-white' : 'bg-gray-400 dark:bg-gray-500'
               }`}>
                 <div className={`w-3 h-3 rounded-full bg-white shadow-sm transition-transform duration-200 ${
                   formData.isFlagged ? 'translate-x-3' : 'translate-x-0'
                 }`}></div>
               </div>
             </div>
           </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3 pt-2 border-t border-gray-200 dark:border-gray-600">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors duration-200"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-3 py-1.5 text-sm font-medium text-white bg-accent-orange hover:bg-primary-600 rounded-lg transition-colors duration-200 disabled:opacity-50"
              disabled={loading}
            >
              {loading ? 'Saving...' : (task ? 'Update' : 'Create Task')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskForm;
