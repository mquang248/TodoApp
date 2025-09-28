const express = require('express');
const router = express.Router();
const List = require('../models/List');
const { body, validationResult } = require('express-validator');
const auth = require('../middleware/auth');

// Get all lists
router.get('/', auth, async (req, res) => {
  try {
    const lists = await List.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(lists);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new list
router.post('/', auth, [
  body('name').notEmpty().withMessage('List name is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const listData = {
      ...req.body,
      user: req.user.id
    };
    const list = new List(listData);
    await list.save();
    res.status(201).json(list);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update list
router.put('/:id', auth, async (req, res) => {
  try {
    const list = await List.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!list) {
      return res.status(404).json({ message: 'List not found' });
    }
    
    res.json(list);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete list
router.delete('/:id', auth, async (req, res) => {
  try {
    const list = await List.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!list) {
      return res.status(404).json({ message: 'List not found' });
    }
    res.json({ message: 'List deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
