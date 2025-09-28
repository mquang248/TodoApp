const List = require('../models/List');
const Task = require('../models/Task');

class WelcomeDataService {
  static async createWelcomeData(userId) {
    try {
      console.log(`Creating welcome data for user: ${userId}`);
      
      // Create welcome lists
      const welcomeLists = [
        {
          name: 'Welcome! 👋',
          color: '#fb923c',
          user: userId
        },
        {
          name: 'Work 💼',
          color: '#3b82f6',
          user: userId
        },
        {
          name: 'Personal 🏠',
          color: '#10b981',
          user: userId
        }
      ];

      const createdLists = await List.insertMany(welcomeLists);
      console.log(`Created ${createdLists.length} welcome lists`);

      // Create welcome tasks
      const welcomeTasks = [
        {
          title: 'Welcome to TodoApp! 🎉',
          description: 'This is your first task. You can edit or delete this task.',
          priority: 'high',
          dueDate: new Date(),
          list: createdLists[0]._id,
          user: userId
        },
        {
          title: 'Explore Features',
          description: 'Try creating new tasks, changing colors, and organizing by time.',
          priority: 'medium',
          dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
          list: createdLists[0]._id,
          user: userId
        },
        {
          title: 'Set Up Your First List',
          description: 'Create a new list for your projects.',
          priority: 'low',
          dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // Day after tomorrow
          list: createdLists[1]._id,
          user: userId
        },
        {
          title: 'Complete Sample Task',
          description: 'Mark this task as completed to see it appear in the "Completed" tab.',
          priority: 'medium',
          dueDate: new Date(),
          list: createdLists[2]._id,
          user: userId,
          completed: true
        }
      ];

      const createdTasks = await Task.insertMany(welcomeTasks);
      console.log(`Created ${createdTasks.length} welcome tasks`);

      return {
        lists: createdLists,
        tasks: createdTasks
      };
    } catch (error) {
      console.error('Error creating welcome data:', error);
      throw error;
    }
  }

  static async createSampleProject(userId) {
    try {
      // Create a sample project list
      const projectList = new List({
        name: 'Sample Project 📋',
        color: '#8b5cf6',
        user: userId
      });
      await projectList.save();

      // Create sample project tasks
      const projectTasks = [
        {
          title: 'Plan Project',
          description: 'Define project goals and scope',
          priority: 'high',
          dueDate: new Date(),
          list: projectList._id,
          user: userId
        },
        {
          title: 'Design Interface',
          description: 'Create wireframes and mockups for the project',
          priority: 'medium',
          dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
          list: projectList._id,
          user: userId
        },
        {
          title: 'Develop Features',
          description: 'Code the main features of the project',
          priority: 'high',
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          list: projectList._id,
          user: userId
        },
        {
          title: 'Test and Debug',
          description: 'Test and fix bugs before deployment',
          priority: 'medium',
          dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
          list: projectList._id,
          user: userId
        }
      ];

      const createdTasks = await Task.insertMany(projectTasks);
      console.log(`Created sample project with ${createdTasks.length} tasks`);

      return {
        list: projectList,
        tasks: createdTasks
      };
    } catch (error) {
      console.error('Error creating sample project:', error);
      throw error;
    }
  }
}

module.exports = WelcomeDataService;
