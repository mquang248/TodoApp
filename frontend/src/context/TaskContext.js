import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { tasksAPI, listsAPI } from '../services/api';

const TaskContext = createContext();

const initialState = {
  tasks: [],
  deletedTasks: [],
  lists: [],
  taskCounts: {},
  loading: false,
  error: null,
  selectedCategory: 'All',
  selectedList: '',
  searchQuery: '',
  assignedTo: '',
};

const taskReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    case 'SET_TASKS':
      return { ...state, tasks: action.payload, loading: false };
    case 'SET_DELETED_TASKS':
      return { ...state, deletedTasks: action.payload };
    case 'SET_LISTS':
      return { ...state, lists: action.payload };
    case 'SET_TASK_COUNTS':
      return { ...state, taskCounts: action.payload };
    case 'ADD_TASK':
      return { ...state, tasks: [action.payload, ...state.tasks] };
    case 'UPDATE_TASK':
      return {
        ...state,
        tasks: state.tasks.map(task =>
          task._id === action.payload._id ? action.payload : task
        ),
      };
    case 'DELETE_TASK':
      return {
        ...state,
        tasks: state.tasks.filter(task => task._id !== action.payload),
      };
    case 'SET_SELECTED_CATEGORY':
      return { ...state, selectedCategory: action.payload };
    case 'SET_SELECTED_LIST':
      return { ...state, selectedList: action.payload };
    case 'SET_SEARCH_QUERY':
      return { ...state, searchQuery: action.payload };
    case 'SET_ASSIGNED_TO':
      return { ...state, assignedTo: action.payload };
    default:
      return state;
  }
};

export const TaskProvider = ({ children }) => {
  const [state, dispatch] = useReducer(taskReducer, initialState);

  // Load initial data
  useEffect(() => {
    loadTasks();
    loadLists();
    loadTaskCounts();
  }, []);

  // Load tasks when filters change
  useEffect(() => {
    loadTasks();
  }, [state.selectedCategory, state.selectedList, state.searchQuery, state.assignedTo]);

  const loadTasks = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const params = {};
      
      if (state.selectedCategory && state.selectedCategory !== 'All') {
        // For Today and Scheduled, we'll filter on frontend based on due date
        if (state.selectedCategory !== 'Today' && state.selectedCategory !== 'Scheduled') {
          params.category = state.selectedCategory;
        }
        // Exclude completed tasks for all categories except "Completed"
        if (state.selectedCategory !== 'Completed') {
          params.excludeCompleted = true;
        }
      } else if (state.selectedCategory === 'All') {
        // For "All" view, exclude completed tasks
        params.excludeCompleted = true;
      }
      
      if (state.selectedList) {
        params.customList = state.selectedList;
      }
      
      if (state.searchQuery) {
        params.search = state.searchQuery;
      }
      
      if (state.assignedTo) {
        params.assignedTo = state.assignedTo;
      }

      const response = await tasksAPI.getAll(params);
      let tasks = response.data;
      
      // Filter tasks based on due date for Today and Scheduled
      if (state.selectedCategory === 'Today') {
        const today = new Date();
        const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const todayEnd = new Date(todayStart);
        todayEnd.setDate(todayEnd.getDate() + 1);
        
        tasks = tasks.filter(task => {
          // Include tasks with category "Today" OR tasks with due date today
          if (task.category === 'Today') return true;
          if (!task.dueDate) return false;
          const dueDate = new Date(task.dueDate);
          return dueDate >= todayStart && dueDate < todayEnd;
        });
      } else if (state.selectedCategory === 'Scheduled') {
        tasks = tasks.filter(task => {
          // Include tasks with category "Scheduled", "Today" OR tasks with due date
          return task.category === 'Scheduled' || task.category === 'Today' || task.dueDate;
        });
      }
      
      dispatch({ type: 'SET_TASKS', payload: tasks });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
    }
  };

  const loadLists = async () => {
    try {
      const response = await listsAPI.getAll();
      dispatch({ type: 'SET_LISTS', payload: response.data });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
    }
  };

  const loadTaskCounts = async () => {
    try {
      const response = await tasksAPI.getCounts();
      dispatch({ type: 'SET_TASK_COUNTS', payload: response.data });
    } catch (error) {
      console.error('Error loading task counts:', error);
      // Reset counts to empty if error
      dispatch({ type: 'SET_TASK_COUNTS', payload: {} });
    }
  };

  const clearCacheAndReload = () => {
    // Clear localStorage cache
    localStorage.removeItem('tasks');
    localStorage.removeItem('lists');
    localStorage.removeItem('taskCounts');
    
    // Reset state
    dispatch({ type: 'SET_TASKS', payload: [] });
    dispatch({ type: 'SET_LISTS', payload: [] });
    dispatch({ type: 'SET_TASK_COUNTS', payload: {} });
    
    // Reload data
    loadTasks();
    loadLists();
    loadTaskCounts();
  };

  const createTask = async (taskData) => {
    try {
      const response = await tasksAPI.create(taskData);
      dispatch({ type: 'ADD_TASK', payload: response.data });
      loadTaskCounts(); // Refresh counts
      return response.data;
    } catch (error) {
      console.error('TaskContext: Error creating task:', error);
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    }
  };

  const updateTask = async (id, taskData) => {
    try {
      const response = await tasksAPI.update(id, taskData);
      dispatch({ type: 'UPDATE_TASK', payload: response.data });
      loadTaskCounts(); // Refresh counts
      return response.data;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    }
  };

  const deleteTask = async (id) => {
    try {
      await tasksAPI.delete(id);
      dispatch({ type: 'DELETE_TASK', payload: id });
      loadTaskCounts(); // Refresh counts
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    }
  };

  const toggleTask = async (id) => {
    try {
      const response = await tasksAPI.toggle(id);
      dispatch({ type: 'UPDATE_TASK', payload: response.data });
      loadTaskCounts(); // Refresh counts
      return response.data;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    }
  };

  // Deleted tasks management
  const loadDeletedTasks = async () => {
    try {
      const response = await tasksAPI.getDeleted();
      
      if (response.data && Array.isArray(response.data)) {
        dispatch({ type: 'SET_DELETED_TASKS', payload: response.data });
      } else {
        dispatch({ type: 'SET_DELETED_TASKS', payload: [] });
      }
    } catch (error) {
      console.error('Error loading deleted tasks:', error);
      dispatch({ type: 'SET_DELETED_TASKS', payload: [] });
      dispatch({ type: 'SET_ERROR', payload: error.message });
    }
  };

  const restoreTask = async (id) => {
    try {
      const response = await tasksAPI.restore(id);
      dispatch({ type: 'ADD_TASK', payload: response.data });
      loadDeletedTasks(); // Refresh deleted tasks
      loadTaskCounts(); // Refresh counts
      return response.data;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    }
  };

  const permanentDeleteTask = async (id) => {
    try {
      await tasksAPI.permanentDelete(id);
      dispatch({ type: 'DELETE_TASK', payload: id });
      loadDeletedTasks(); // Refresh deleted tasks
      loadTaskCounts(); // Refresh counts
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    }
  };

  const deleteAllCompleted = async () => {
    try {
      const response = await tasksAPI.deleteAllCompleted();
      loadTasks(); // Refresh tasks
      loadTaskCounts(); // Refresh counts
      return response.data;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    }
  };

  const deleteAllDeleted = async () => {
    try {
      const response = await tasksAPI.deleteAllDeleted();
      dispatch({ type: 'SET_DELETED_TASKS', payload: [] });
      loadTaskCounts(); // Refresh counts
      return response.data;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    }
  };

  const bulkDeleteTasks = async (taskIds) => {
    try {
      const response = await tasksAPI.bulkDelete(taskIds);
      // Remove deleted tasks from current tasks
      dispatch({ type: 'SET_TASKS', payload: state.tasks.filter(task => !taskIds.includes(task._id)) });
      loadTaskCounts(); // Refresh counts
      return response.data;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    }
  };

  const deleteAllTasks = async () => {
    try {
      const allTaskIds = state.tasks.map(task => task._id);
      if (allTaskIds.length === 0) return;
      
      const response = await tasksAPI.bulkDelete(allTaskIds);
      dispatch({ type: 'SET_TASKS', payload: [] });
      loadTaskCounts(); // Refresh counts
      return response.data;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    }
  };

  const createList = async (listData) => {
    try {
      const response = await listsAPI.create(listData);
      dispatch({ type: 'SET_LISTS', payload: [...state.lists, response.data] });
      return response.data;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    }
  };

  const updateList = async (id, listData) => {
    try {
      const response = await listsAPI.update(id, listData);
      dispatch({ 
        type: 'SET_LISTS', 
        payload: state.lists.map(list => 
          list._id === id ? response.data : list
        ) 
      });
      return response.data;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    }
  };

  const deleteList = async (id) => {
    try {
      await listsAPI.delete(id);
      dispatch({ 
        type: 'SET_LISTS', 
        payload: state.lists.filter(list => list._id !== id) 
      });
      // If the deleted list was selected, clear the selection
      const deletedList = state.lists.find(list => list._id === id);
      if (deletedList && state.selectedList === deletedList.name) {
        setSelectedList('');
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    }
  };

  const setSelectedCategory = (category) => {
    dispatch({ type: 'SET_SELECTED_CATEGORY', payload: category });
  };

  const setSelectedList = (list) => {
    dispatch({ type: 'SET_SELECTED_LIST', payload: list });
  };

  const setSearchQuery = (query) => {
    dispatch({ type: 'SET_SEARCH_QUERY', payload: query });
  };

  const setAssignedTo = (assignedTo) => {
    dispatch({ type: 'SET_ASSIGNED_TO', payload: assignedTo });
  };

  const value = {
    ...state,
    createTask,
    updateTask,
    deleteTask,
    toggleTask,
    createList,
    updateList,
    deleteList,
    setSelectedCategory,
    setSelectedList,
    setSearchQuery,
    setAssignedTo,
    loadTasks,
    loadLists,
    loadTaskCounts,
    clearCacheAndReload,
    // Deleted tasks management
    loadDeletedTasks,
    restoreTask,
    permanentDeleteTask,
    deleteAllCompleted,
    deleteAllDeleted,
    bulkDeleteTasks,
    deleteAllTasks,
  };

  return (
    <TaskContext.Provider value={value}>
      {children}
    </TaskContext.Provider>
  );
};

export const useTasks = () => {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTasks must be used within a TaskProvider');
  }
  return context;
};
