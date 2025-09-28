import React, { useState, useEffect } from 'react';
import { Plus, GripVertical } from 'lucide-react';
import { useTasks } from '../context/TaskContext';
import TaskCard from './TaskCard';
import TaskForm from './TaskForm';
import EmptyState from './EmptyState';

const KanbanBoard = ({ showInlineForm, setShowInlineForm, isMultiSelectMode, selectedTasks, setSelectedTasks }) => {
  const { 
    tasks, 
    deletedTasks,
    loading,
    selectedCategory, 
    selectedList, 
    searchQuery, 
    lists,
    createTask,
    loadDeletedTasks,
    restoreTask,
    permanentDeleteTask,
    deleteAllCompleted,
    deleteAllDeleted,
    bulkDeleteTasks,
    deleteAllTasks
  } = useTasks();
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [timelineOrder, setTimelineOrder] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [activeInputSection, setActiveInputSection] = useState('Today'); // Track which section has active input

  useEffect(() => {
    if (showInlineForm) {
      // Focus input when form is shown
      setTimeout(() => {
        const input = document.querySelector('input[placeholder="Enter task..."]');
        if (input) input.focus();
      }, 100);
    }
  }, [showInlineForm]);

  // Load deleted tasks when viewing "Recently Deleted"
  useEffect(() => {
    if (selectedCategory === 'Recently Deleted') {
      loadDeletedTasks().catch((error) => {
        console.error('Failed to load deleted tasks:', error);
      });
    }
  }, [selectedCategory, loadDeletedTasks]);

  // Reset showInlineForm when category changes
  useEffect(() => {
    setShowInlineForm(false);
  }, [selectedCategory, selectedList]);


  const handleCreateTask = async () => {
    if (!newTaskTitle.trim()) return;
    
    try {
      let taskCategory = selectedCategory || 'All';
      let dueDate = null;
      
      // If creating task in "Scheduled" view, set it to "Today" category
      if (selectedCategory === 'Scheduled') {
        taskCategory = 'Today';
        dueDate = new Date(); // Set due date to today
      }
      
      const taskData = {
        title: newTaskTitle,
        description: '',
        emoji: '',
        image: '',
        assignedTo: 'Danny',
        category: taskCategory,
        customList: selectedList || '',
        isFlagged: false,
        dueDate: dueDate,
        dueTime: '',
        repeat: 'none',
        priority: 'medium'
      };
      
      await createTask(taskData);
      setNewTaskTitle('');
      setShowInlineForm(false);
      
      // Force refresh tasks to ensure new task appears
      if (selectedCategory === 'Scheduled') {
        // The task will be added to state automatically via TaskContext
        // No need to manually refresh
      }
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleCreateTask();
    } else if (e.key === 'Escape') {
      setShowInlineForm(false);
      setNewTaskTitle('');
    }
  };

  const getColumnTitle = () => {
    if (selectedCategory && selectedCategory !== 'All') {
      const categoryNames = {
        'Today': 'Today',
        'Scheduled': 'Scheduled',
        'All': 'All',
        'Flagged': 'Important',
        'Completed': 'Completed',
        'Recently Deleted': 'Recently Deleted'
      };
      return categoryNames[selectedCategory] || selectedCategory;
    }
    
    if (selectedList) {
      return selectedList;
    }
    
    if (searchQuery) {
      return `Search results for "${searchQuery}"`;
    }
    
    return 'All Tasks';
  };

  const getTitleColor = () => {
    if (selectedCategory && selectedCategory !== 'All') {
      const categoryColors = {
        'Today': 'text-accent-blue dark:text-accent-blue',
        'Scheduled': 'text-accent-red dark:text-accent-red',
        'All': 'text-gray-600 dark:text-gray-300',
        'Flagged': 'text-accent-orange dark:text-accent-orange',
        'Completed': 'text-gray-500 dark:text-gray-400',
        'Recently Deleted': 'text-gray-500 dark:text-gray-400'
      };
      return categoryColors[selectedCategory] || 'text-accent-orange dark:text-accent-orange';
    }
    
    // When a custom list is selected, we'll color via inline style using the list's color
    if (selectedList) return '';
    
    if (searchQuery) {
      return 'text-accent-orange dark:text-accent-orange';
    }
    
    return 'text-accent-orange dark:text-accent-orange';
  };

  const getSelectedListHexColor = () => {
    if (!selectedList || !Array.isArray(lists)) return undefined;
    const found = lists.find(l => l.name === selectedList);
    return found?.color;
  };

  // Group tasks by category for "All" view
  const groupTasksByCategory = () => {
    if (selectedCategory !== 'All' || selectedList || searchQuery) {
      return null; // Don't group if not viewing "All"
    }

    const grouped = {};
    const categoryOrder = ['Today', 'Scheduled', 'Flagged', 'Completed'];
    const categoryNames = {
      'Today': 'Today',
      'Scheduled': 'Scheduled', 
      'Flagged': 'Important',
      'Completed': 'Completed'
    };

    // Group tasks by category
    tasks.forEach(task => {
      const category = task.customList || task.category;
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(task);
    });

    // Return ordered sections
    const sections = [];
    
    // Add predefined categories in order
    categoryOrder.forEach(category => {
      if (grouped[category] && grouped[category].length > 0) {
        sections.push({
          title: categoryNames[category],
          category: category,
          tasks: grouped[category],
          color: getCategoryColor(category),
          isCustom: false
        });
        delete grouped[category]; // Remove from grouped
      }
    });

    // Add remaining categories (custom lists, etc.)
    Object.keys(grouped).forEach(category => {
      if (grouped[category].length > 0) {
        sections.push({
          title: category,
          category: category,
          tasks: grouped[category],
          color: getCategoryColor(category, true),
          colorHex: getListColorByName(category),
          isCustom: true
        });
      }
    });

    return sections;
  };

  // Group tasks by timeline for "Scheduled" view
  const groupTasksByTimeline = () => {
    if (selectedCategory !== 'Scheduled' || selectedList || searchQuery) {
      return null; // Only for Scheduled category
    }

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dayAfterTomorrow = new Date(today);
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);

    const grouped = {};

    // Always create default timeline sections
    const defaultSections = [
      { key: 'today', title: 'Today', sortOrder: 1 },
      { key: 'tomorrow', title: 'Tomorrow', sortOrder: 2 },
      { key: 'dayAfterTomorrow', title: 'Day After Tomorrow', sortOrder: 3 }
    ];

    // Initialize default sections
    defaultSections.forEach(section => {
      grouped[section.key] = {
        title: section.title,
        tasks: [],
        sortOrder: section.sortOrder
      };
    });

    // Add current month
    const currentMonth = `${now.getFullYear()}-${now.getMonth()}`;
    const monthNames = [
      'Month 1', 'Month 2', 'Month 3', 'Month 4', 'Month 5', 'Month 6',
      'Month 7', 'Month 8', 'Month 9', 'Month 10', 'Month 11', 'Month 12'
    ];
    
    grouped[currentMonth] = {
      title: monthNames[now.getMonth()],
      tasks: [],
      sortOrder: getSortOrder(currentMonth)
    };

    // Add next few months
    for (let i = 1; i <= 6; i++) {
      const futureDate = new Date(now.getFullYear(), now.getMonth() + i, 1);
      const monthKey = `${futureDate.getFullYear()}-${futureDate.getMonth()}`;
      const monthTitle = `${monthNames[futureDate.getMonth()]}${futureDate.getFullYear() !== now.getFullYear() ? `, ${futureDate.getFullYear()}` : ''}`;
      
      grouped[monthKey] = {
        title: monthTitle,
        tasks: [],
        sortOrder: getSortOrder(monthKey)
      };
    }

    // Process tasks and assign to appropriate sections
    tasks.forEach(task => {
      let dueDate = null;
      
      // Handle tasks with category "Today" (no dueDate needed)
      if (task.category === 'Today') {
        dueDate = today; // Treat "Today" category tasks as due today
      } else if (task.dueDate) {
        dueDate = new Date(task.dueDate);
      } else {
        return; // Skip tasks without dueDate and not "Today" category
      }

      const dueDateOnly = new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate());
      
      let groupKey = '';

      if (dueDateOnly.getTime() === today.getTime()) {
        groupKey = 'today';
      } else if (dueDateOnly.getTime() === tomorrow.getTime()) {
        groupKey = 'tomorrow';
      } else if (dueDateOnly.getTime() === dayAfterTomorrow.getTime()) {
        groupKey = 'dayAfterTomorrow';
      } else {
        // Group by month for future dates
        const monthKey = `${dueDate.getFullYear()}-${dueDate.getMonth()}`;
        groupKey = monthKey;
        
        // Create month section if it doesn't exist
        if (!grouped[monthKey]) {
          const monthTitle = `${monthNames[dueDate.getMonth()]}${dueDate.getFullYear() !== now.getFullYear() ? `, ${dueDate.getFullYear()}` : ''}`;
          grouped[monthKey] = {
            title: monthTitle,
            tasks: [],
            sortOrder: getSortOrder(monthKey)
          };
        }
      }

      if (grouped[groupKey]) {
        grouped[groupKey].tasks.push(task);
      }
    });

    // Convert to array and sort
    let sections = Object.values(grouped).sort((a, b) => a.sortOrder - b.sortOrder);
    
    // Apply custom timeline order if available
    if (timelineOrder.length > 0) {
      const orderedSections = [];
      const remainingSections = [...sections];
      
      // Add sections in custom order
      timelineOrder.forEach(orderKey => {
        const section = remainingSections.find(s => s.sortOrder === getSortOrder(orderKey));
        if (section) {
          orderedSections.push(section);
          const index = remainingSections.indexOf(section);
          remainingSections.splice(index, 1);
        }
      });
      
      // Add remaining sections
      orderedSections.push(...remainingSections);
      sections = orderedSections;
    }
    
    return sections;
  };

  const getSortOrder = (groupKey) => {
    const order = {
      'today': 1,
      'tomorrow': 2,
      'dayAfterTomorrow': 3
    };
    
    if (order[groupKey]) return order[groupKey];
    
    // For month groups, extract year and month for sorting
    const [year, month] = groupKey.split('-').map(Number);
    return year * 12 + month + 100; // Offset to put after day groups
  };

  const getCategoryColor = (category, isCustomList = false) => {
    if (isCustomList) {
      // color will be applied inline when rendering if available
      return 'text-gray-700 dark:text-gray-300';
    }
    
    const categoryColors = {
      'Today': 'text-accent-blue dark:text-accent-blue',
      'Scheduled': 'text-accent-red dark:text-accent-red',
      'Flagged': 'text-accent-orange dark:text-accent-orange',
      'Completed': 'text-gray-500 dark:text-gray-400'
    };
    return categoryColors[category] || 'text-gray-600 dark:text-gray-300';
  };

  const getListColorByName = (name) => {
    if (!Array.isArray(lists)) return undefined;
    return lists.find(l => l.name === name)?.color;
  };

  // Drag and drop handlers for timeline sections
  const handleDragStart = (e, sectionIndex) => {
    setIsDragging(true);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', sectionIndex);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, dropIndex) => {
    e.preventDefault();
    const dragIndex = parseInt(e.dataTransfer.getData('text/html'));
    
    if (dragIndex !== dropIndex) {
      const timelineSections = groupTasksByTimeline();
      if (timelineSections) {
        const newOrder = [...timelineSections];
        const draggedSection = newOrder[dragIndex];
        newOrder.splice(dragIndex, 1);
        newOrder.splice(dropIndex, 0, draggedSection);
        
        // Update timeline order
        const newTimelineOrder = newOrder.map(section => {
          const orderKeys = ['today', 'tomorrow', 'dayAfterTomorrow'];
          const foundKey = orderKeys.find(key => getSortOrder(key) === section.sortOrder);
          return foundKey || 'today'; // Default to 'today' if not found
        });
        setTimelineOrder(newTimelineOrder);
      }
    }
    setIsDragging(false);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  const handleBulkDelete = async () => {
    if (selectedTasks.length === 0) return;
    
    if (window.confirm(`Are you sure you want to delete ${selectedTasks.length} selected tasks?`)) {
      try {
        await bulkDeleteTasks(selectedTasks);
        setSelectedTasks([]);
        alert(`Deleted ${selectedTasks.length} tasks!`);
      } catch (error) {
        alert('Error deleting: ' + error.message);
      }
    }
  };

  const handleTaskSelect = (taskId) => {
    if (selectedTasks.includes(taskId)) {
      setSelectedTasks(selectedTasks.filter(id => id !== taskId));
    } else {
      setSelectedTasks([...selectedTasks, taskId]);
    }
  };

  return (
    <div className="flex-1 p-6">
      {/* Header */}
      <div className="mb-6">
        <h2 
          className={`text-2xl font-bold mb-2 ${getTitleColor()}`}
          style={selectedList ? { color: getSelectedListHexColor() } : undefined}
        >
          {getColumnTitle()}
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          {selectedCategory === 'Recently Deleted' ? deletedTasks.length : tasks.length} {selectedCategory === 'Recently Deleted' ? (deletedTasks.length === 1 ? 'task' : 'tasks') : (tasks.length === 1 ? 'task' : 'tasks')} total
        </p>
      </div>

      {/* Inline Task Form - Only show for categories that don't have their own form */}
      {showInlineForm && selectedCategory !== 'Today' && selectedCategory !== 'Flagged' && (
        <div className="mb-6 p-4 bg-white dark:bg-darkBg-tertiary rounded-xl shadow-soft border border-gray-200 dark:border-dark-700">
          <div className="flex items-start space-x-3">
            {/* Checkbox */}
            <div className="w-5 h-5 rounded-full border-2 border-gray-300 dark:border-gray-600 flex items-center justify-center mt-1">
              {/* Empty checkbox */}
            </div>
            
            {/* Input Field */}
            <div className="flex-1">
              <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                Add Note
              </div>
              <input
                type="text"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                onKeyPress={handleKeyPress}
                className="w-full bg-transparent border-b border-gray-300 dark:border-gray-600 pb-2 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-accent-orange"
                placeholder="Enter task..."
                autoFocus
              />
            </div>
            
            {/* Info Icon */}
            <button
              onClick={() => setShowTaskForm(true)}
              className="w-6 h-6 bg-accent-orange rounded-full flex items-center justify-center mt-1 hover:bg-primary-600 transition-colors"
              title="Add Details"
            >
              <span className="text-white text-xs font-bold">i</span>
            </button>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      {selectedCategory === 'Completed' && tasks.length > 0 && (
        <div className="mb-6">
          <button
            onClick={async () => {
              if (window.confirm('Are you sure you want to delete all completed tasks?')) {
                try {
                  await deleteAllCompleted();
                  alert('Deleted all completed tasks!');
                } catch (error) {
                  alert('Error deleting tasks: ' + error.message);
                }
              }
            }}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
          >
            Delete All
          </button>
        </div>
      )}

      {selectedCategory === 'Recently Deleted' && deletedTasks.length > 0 && (
        <div className="mb-6">
          <button
            onClick={async () => {
              if (window.confirm('Are you sure you want to permanently delete all deleted tasks?')) {
                try {
                  await deleteAllDeleted();
                  alert('Permanently deleted all tasks!');
                } catch (error) {
                  alert('Error deleting tasks: ' + error.message);
                }
              }
            }}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
          >
            Delete All Permanently
          </button>
        </div>
      )}

      {/* Multi-select mode bulk actions */}
      {isMultiSelectMode && selectedTasks.length > 0 && (
        <div className="mb-6 p-4 bg-accent-orange/10 border border-accent-orange/20 rounded-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-accent-orange">
                {selectedTasks.length} tasks selected
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setSelectedTasks([])}
                className="px-3 py-1 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
              >
                Deselect All
              </button>
              <button
                onClick={handleBulkDelete}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
              >
                Delete All
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Show inline form for Today category only when no tasks or when showInlineForm is true */}
      {selectedCategory === 'Today' && (tasks.filter(task => task.category === 'Today' || (task.customList && task.customList === selectedList)).length === 0 || showInlineForm) && (
        <div className="mb-6 p-4 bg-white dark:bg-darkBg-tertiary rounded-xl shadow-soft border border-gray-200 dark:border-dark-700">
          <div className="flex items-start space-x-3">
            {/* Checkbox */}
            <div className="w-5 h-5 rounded-full border-2 border-gray-300 dark:border-gray-600 flex items-center justify-center mt-1">
              {/* Empty checkbox */}
            </div>
            
            {/* Input Field */}
            <div className="flex-1">
              <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                Add Note
              </div>
              <input
                type="text"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                onKeyPress={handleKeyPress}
                className="w-full bg-transparent border-b border-gray-300 dark:border-gray-600 pb-2 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-accent-orange"
                placeholder="Enter task..."
                autoFocus
              />
            </div>
            
            {/* Info Icon */}
            <button
              onClick={() => setShowTaskForm(true)}
              className="w-6 h-6 bg-accent-orange rounded-full flex items-center justify-center mt-1 hover:bg-primary-600 transition-colors"
              title="Add Details"
            >
              <span className="text-white text-xs font-bold">i</span>
            </button>
          </div>
        </div>
      )}

      {/* Show inline form for Flagged category only when no tasks or when showInlineForm is true */}
      {selectedCategory === 'Flagged' && (() => {
        // Count tasks that are flagged OR have category 'Flagged'
        const flaggedTasks = tasks.filter(task => task.isFlagged || task.category === 'Flagged');
        return flaggedTasks.length === 0 || showInlineForm;
      })() && (
        <div className="mb-6 p-4 bg-white dark:bg-darkBg-tertiary rounded-xl shadow-soft border border-gray-200 dark:border-dark-700">
          <div className="flex items-start space-x-3">
            {/* Checkbox */}
            <div className="w-5 h-5 rounded-full border-2 border-gray-300 dark:border-gray-600 flex items-center justify-center mt-1">
              {/* Empty checkbox */}
            </div>
            
            {/* Input Field */}
            <div className="flex-1">
              <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                Add Note
              </div>
              <input
                type="text"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                onKeyPress={handleKeyPress}
                className="w-full bg-transparent border-b border-gray-300 dark:border-gray-600 pb-2 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-accent-orange"
                placeholder="Enter task..."
                autoFocus
              />
            </div>
            
            {/* Info Icon */}
            <button
              onClick={() => setShowTaskForm(true)}
              className="w-6 h-6 bg-accent-orange rounded-full flex items-center justify-center mt-1 hover:bg-primary-600 transition-colors"
              title="Add Details"
            >
              <span className="text-white text-xs font-bold">i</span>
            </button>
          </div>
        </div>
      )}

      {/* Always show inline form for custom lists */}
      {selectedList && !selectedCategory && (tasks.filter(task => task.customList === selectedList).length === 0 || showInlineForm) && (
        <div className="mb-6 p-4 bg-white dark:bg-darkBg-tertiary rounded-xl shadow-soft border border-gray-200 dark:border-dark-700">
          <div className="flex items-start space-x-3">
            {/* Checkbox */}
            <div className="w-5 h-5 rounded-full border-2 border-gray-300 dark:border-gray-600 flex items-center justify-center mt-1">
              {/* Empty checkbox */}
            </div>
            
            {/* Input Field */}
            <div className="flex-1">
              <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                Add Note
              </div>
              <input
                type="text"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                onKeyPress={handleKeyPress}
                className="w-full bg-transparent border-b border-gray-300 dark:border-gray-600 pb-2 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-accent-orange"
                placeholder="Enter task..."
                autoFocus
              />
            </div>
            
            {/* Info Icon */}
            <button
              onClick={() => setShowTaskForm(true)}
              className="w-6 h-6 bg-accent-orange rounded-full flex items-center justify-center mt-1 hover:bg-primary-600 transition-colors"
              title="Add Details"
            >
              <span className="text-white text-xs font-bold">i</span>
            </button>
          </div>
        </div>
      )}

      {selectedCategory === 'Scheduled' && timelineOrder.length > 0 && (
        <div className="mb-6">
          <button
            onClick={() => setTimelineOrder([])}
            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
          >
            Reset to Default Order
          </button>
        </div>
      )}

      {/* Tasks List View */}
      <div className="space-y-4">
        {/* Handle "Recently Deleted" view */}
        {selectedCategory === 'Recently Deleted' ? (
          loading ? (
            <div className="text-center py-12">
              <div className="text-gray-400 dark:text-gray-500 mb-4">
                <svg className="w-16 h-16 mx-auto animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Loading...
              </h3>
            </div>
          ) : deletedTasks && deletedTasks.length > 0 ? (
            <div className="max-h-[calc(100vh-200px)] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {deletedTasks.map((task) => (
                  <TaskCard key={task._id} task={task} isDeleted={true} />
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-gray-400 dark:text-gray-500 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No deleted tasks
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                Deleted tasks will appear here
              </p>
            </div>
          )
        ) : (() => {
          const groupedSections = groupTasksByCategory();
          const timelineSections = groupTasksByTimeline();
          
          // If timeline sections exist (viewing "Scheduled"), render timeline view
            if (timelineSections) {
              return (
                <div className="space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
                {timelineSections.map((section, index) => (
                  <div 
                    key={index} 
                    className="space-y-3"
                    draggable
                    onDragStart={(e) => handleDragStart(e, index)}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, index)}
                    onDragEnd={handleDragEnd}
                  >
                    {/* Timeline Section Header */}
                    <div 
                      className="flex items-center space-x-3 group cursor-pointer"
                      onClick={() => setActiveInputSection(section.title)}
                    >
                      <div className="flex items-center space-x-2 flex-1">
                        <div className="cursor-move opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          <GripVertical className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {section.title}
                        </h3>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {section.tasks.length} tasks
                        </span>
                      </div>
                    </div>
                    
                    {/* Timeline Section Tasks */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {section.tasks.map((task) => (
                        <TaskCard 
                          key={task._id} 
                          task={task} 
                          isMultiSelectMode={isMultiSelectMode}
                          isSelected={selectedTasks.includes(task._id)}
                          onSelect={handleTaskSelect}
                        />
                      ))}
                      
                      {/* Add task input for active timeline section */}
                      {activeInputSection === section.title && (
                        <div className="bg-white dark:bg-darkBg-tertiary rounded-xl shadow-soft border border-gray-200 dark:border-dark-700 p-4">
                          <div className="flex items-start space-x-3">
                            <div className="w-5 h-5 rounded-full border-2 border-gray-300 dark:border-gray-600 flex items-center justify-center mt-1"></div>
                            <div className="flex-1">
                              <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Add Note</div>
                              <input
                                type="text"
                                placeholder="Enter task..."
                                className="w-full bg-transparent border-b border-gray-300 dark:border-gray-600 pb-2 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-accent-orange"
                                onKeyPress={(e) => {
                                  if (e.key === 'Enter' && e.target.value.trim()) {
                                    // Calculate due date based on section
                                    let dueDate = new Date();
                                    
                                    if (section.title === 'Tomorrow') {
                                      dueDate.setDate(dueDate.getDate() + 1);
                                    } else if (section.title === 'Day After Tomorrow') {
                                      dueDate.setDate(dueDate.getDate() + 2);
                                    } else if (section.title.startsWith('Month')) {
                                      // For month sections, set to first day of that month
                                      const now = new Date();
                                      const monthMatch = section.title.match(/Month (\d+)(?:, (\d{4}))?/);
                                      if (monthMatch) {
                                        const month = parseInt(monthMatch[1]) - 1; // JavaScript months are 0-based
                                        const year = monthMatch[2] ? parseInt(monthMatch[2]) : now.getFullYear();
                                        dueDate = new Date(year, month, 1);
                                      }
                                    }
                                    
                                    const taskData = {
                                      title: e.target.value,
                                      description: '',
                                      emoji: '',
                                      image: '',
                                      assignedTo: 'Danny',
                                      category: section.title === 'Today' ? 'Today' : 'Scheduled',
                                      customList: selectedList || '',
                                      isFlagged: false,
                                      dueDate: dueDate,
                                      dueTime: '',
                                      repeat: 'none',
                                      priority: 'medium'
                                    };
                                    createTask(taskData);
                                    e.target.value = '';
                                  }
                                }}
                              />
                            </div>
                            <button
                              onClick={() => setShowTaskForm(true)}
                              className="w-6 h-6 bg-accent-orange rounded-full flex items-center justify-center mt-1 hover:bg-primary-600 transition-colors"
                              title="Add Details"
                            >
                              <span className="text-white text-xs font-bold">i</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            );
          }
          
          // If grouped sections exist (viewing "All"), render grouped view
          if (groupedSections) {
            return (
              <div className="max-h-[calc(100vh-200px)] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
                <div className="space-y-8">
                  {groupedSections.map((section, index) => (
                    <div key={index} className="space-y-4">
                      {/* Section Header */}
                      <div className="flex items-center space-x-3">
                        <h3 
                          className={`text-lg font-semibold ${section.color}`}
                          style={section.isCustom && section.colorHex ? { color: section.colorHex } : undefined}
                        >
                          {section.title}
                        </h3>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {section.tasks.length} tasks
                        </span>
                      </div>
                      
                      {/* Section Tasks */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {section.tasks.map((task) => (
                          <TaskCard 
                            key={task._id} 
                            task={task} 
                            isMultiSelectMode={isMultiSelectMode}
                            isSelected={selectedTasks.includes(task._id)}
                            onSelect={handleTaskSelect}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          }
          
          // Otherwise render normal grid view
          return (
            <div className="max-h-[calc(100vh-200px)] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
              {tasks.length === 0 && selectedCategory !== 'Today' && selectedCategory !== 'Completed' && selectedCategory !== 'Flagged' && selectedCategory !== 'Important' && selectedCategory !== 'important' ? (
                <EmptyState 
                  currentView={selectedCategory}
                  onCreateTask={() => setShowInlineForm(true)}
                />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {tasks.map((task) => (
                    <TaskCard 
                      key={task._id} 
                      task={task} 
                      isMultiSelectMode={isMultiSelectMode}
                      isSelected={selectedTasks.includes(task._id)}
                      onSelect={handleTaskSelect}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })()}
      </div>

      {/* Floating Action Button - Always show for adding new tasks */}
      {/* Show floating action button for most categories */}
      {selectedCategory !== 'All' && 
       selectedCategory !== 'Completed' && 
       selectedCategory !== 'Recently Deleted' && 
       selectedCategory !== 'Scheduled' && 
       !selectedList && 
       !searchQuery && (
        <button
          onClick={() => setShowInlineForm(true)}
          className="fixed bottom-6 left-[21.5rem] w-12 h-12 bg-accent-orange hover:bg-primary-600 text-white rounded-full shadow-large flex items-center justify-center transition-all duration-200 hover:scale-105 z-40"
          title="Add Task"
        >
          <Plus className="w-6 h-6" />
        </button>
      )}

      {/* Task Form Modal */}
      {showTaskForm && (
        <TaskForm
          onClose={() => setShowTaskForm(false)}
          initialCategory={selectedCategory}
          initialList={selectedList}
        />
      )}

    </div>
  );
};

export default KanbanBoard;
