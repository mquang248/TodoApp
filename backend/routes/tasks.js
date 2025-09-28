const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const { body, validationResult } = require('express-validator');
const auth = require('../middleware/auth');

// Get all tasks
router.get('/', auth, async (req, res) => {
  try {
    const { category, assignedTo, customList, search, excludeCompleted } = req.query;
    let query = { 
      isDeleted: false,
      user: req.user.id // Only get tasks for the authenticated user
    };

    if (category && category !== 'All') {
      query.category = category;
    }

    if (assignedTo) {
      query.assignedTo = assignedTo;
    }

    if (customList) {
      query.customList = customList;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Exclude completed tasks if requested
    if (excludeCompleted === 'true') {
      query.isCompleted = false;
    }

    const tasks = await Task.find(query).sort({ createdAt: -1 });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get deleted tasks
router.get('/deleted', auth, async (req, res) => {
  try {
    const tasks = await Task.find({ 
      isDeleted: true,
      user: req.user.id 
    }).sort({ updatedAt: -1 });
    res.json(tasks);
  } catch (error) {
    console.error('Error getting deleted tasks:', error);
    res.status(500).json({ 
      message: error.message,
      error: error.toString()
    });
  }
});

// Get task by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    res.json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new task
router.post('/', auth, [
  body('title').notEmpty().withMessage('Title is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Set default values for required fields
    const taskData = {
      ...req.body,
      assignedTo: req.body.assignedTo || 'Danny',
      originalCategory: req.body.category || 'All',
      user: req.user.id // Use authenticated user
    };

    const task = new Task(taskData);
    await task.save();
    res.status(201).json(task);
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(400).json({ message: error.message });
  }
});

// Update task
router.put('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    res.json(task);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete task (soft delete)
router.delete('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findByIdAndUpdate(
      req.params.id,
      { isDeleted: true },
      { new: true }
    );
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Toggle task completion
router.patch('/:id/toggle', auth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    task.isCompleted = !task.isCompleted;
    
    // If completing task, move to Completed category
    if (task.isCompleted) {
      task.category = 'Completed';
    } else {
      // If uncompleting task, move back to original category or All
      task.category = task.originalCategory || 'All';
    }
    
    await task.save();
    res.json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get task counts by category
router.get('/stats/counts', auth, async (req, res) => {
  try {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    // Get counts for non-deleted, non-completed tasks by category
    const counts = await Task.aggregate([
      { $match: { isDeleted: false, isCompleted: false, user: req.user.id } },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      }
    ]);
    
    // Get counts for custom lists (non-deleted, non-completed tasks)
    const customListCounts = await Task.aggregate([
      { $match: { isDeleted: false, isCompleted: false, customList: { $exists: true, $ne: '' }, user: req.user.id } },
      {
        $group: {
          _id: '$customList',
          count: { $sum: 1 }
        }
      }
    ]);
    
    // Get count of tasks for "Today" (category "Today" OR due date today, excluding completed)
    const todayCount = await Task.countDocuments({
      isDeleted: false,
      isCompleted: false,
      user: req.user.id,
      $or: [
        { category: 'Today' },
        {
          dueDate: {
            $gte: today,
            $lt: tomorrow
          }
        }
      ]
    });
    
    // Get count of tasks for "Scheduled" (category "Scheduled", "Today" OR has due date, excluding completed)
    const scheduledCount = await Task.countDocuments({
      isDeleted: false,
      isCompleted: false,
      user: req.user.id,
      $or: [
        { category: 'Scheduled' },
        { category: 'Today' },
        { dueDate: { $exists: true, $ne: null } }
      ]
    });
    
    // Get count of recently deleted tasks (within last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const deletedCount = await Task.countDocuments({
      isDeleted: true,
      user: req.user.id,
      updatedAt: { $gte: thirtyDaysAgo }
    });
    
    const result = {};
    
    // Add category counts
    counts.forEach(item => {
      result[item._id] = item.count;
    });
    
    // Add custom list counts
    customListCounts.forEach(item => {
      result[item._id] = item.count;
    });
    
    // Override Today and Scheduled counts with due date based counts
    result['Today'] = todayCount;
    result['Scheduled'] = scheduledCount;
    
    // Calculate total count for "All" category (excluding completed tasks)
    const totalCount = await Task.countDocuments({
      isDeleted: false,
      isCompleted: false,
      user: req.user.id
    });
    result['All'] = totalCount;
    
    // Get count of completed tasks
    const completedCount = await Task.countDocuments({
      isDeleted: false,
      isCompleted: true,
      user: req.user.id
    });
    result['Completed'] = completedCount;
    
    // Add recently deleted count
    result['Recently Deleted'] = deletedCount;
    
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Test endpoint
router.get('/test', (req, res) => {
  res.json({ message: 'API is working', timestamp: new Date() });
});

// Restore deleted task
router.patch('/:id/restore', auth, async (req, res) => {
  try {
    const task = await Task.findByIdAndUpdate(
      req.params.id,
      { isDeleted: false },
      { new: true }
    );
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    res.json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Permanently delete task
router.delete('/:id/permanent', auth, async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    res.json({ message: 'Task permanently deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete all completed tasks
router.delete('/completed/all', auth, async (req, res) => {
  try {
    const result = await Task.updateMany(
      { isCompleted: true, isDeleted: false, user: req.user.id },
      { isDeleted: true }
    );
    
    res.json({ 
      message: `${result.modifiedCount} completed tasks moved to trash`,
      count: result.modifiedCount 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Permanently delete all deleted tasks
router.delete('/deleted/all', auth, async (req, res) => {
  try {
    const result = await Task.deleteMany({ isDeleted: true, user: req.user.id });
    
    res.json({ 
      message: `${result.deletedCount} tasks permanently deleted`,
      count: result.deletedCount 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Bulk delete tasks
router.post('/bulk-delete', auth, async (req, res) => {
  try {
    const { taskIds } = req.body;
    
    if (!taskIds || !Array.isArray(taskIds) || taskIds.length === 0) {
      return res.status(400).json({ message: 'Task IDs array is required' });
    }
    
    const result = await Task.updateMany(
      { _id: { $in: taskIds }, user: req.user.id },
      { isDeleted: true }
    );
    
    res.json({ 
      message: `${result.modifiedCount} tasks moved to trash`,
      count: result.modifiedCount 
    });
  } catch (error) {
    console.error('Error bulk deleting tasks:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
