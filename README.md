# TodoApp - Modern Task Management

A beautiful, feature-rich task management application built with React, Node.js, and MongoDB. Organize your life with an intuitive Kanban board, smart scheduling, and powerful productivity features.

## Live Demo

**Try the app now:** [https://todo-appzc.vercel.app/](https://todo-appzc.vercel.app/)

### Test Accounts

For quick testing, you can use these pre-configured accounts:

| Username | Email | Password | Role |
|----------|-------|----------|------|
| `testuser1` | `test1@example.com` | `123456` | Test User |
| `testuser2` | `test2@example.com` | `123456` | Test User |
| `admin` | `admin@example.com` | `admin123` | Admin |

**Note:** These are test accounts with pre-verified emails. No OTP verification required.

## Features

### Smart Task Management
- **Kanban Board View** - Visualize your tasks in an intuitive board layout
- **Multiple Categories** - Today, Scheduled, All Tasks, Important, Completed
- **Custom Lists** - Create personalized lists with emojis and colors
- **Quick Add** - Fast task creation with inline forms

### Advanced Scheduling
- **Due Dates & Times** - Set precise deadlines for your tasks
- **Timeline View** - See tasks organized by Today, Tomorrow, and beyond
- **Smart Reminders** - Never miss important deadlines
- **Recurring Tasks** - Set up daily, weekly, or monthly recurring tasks

### Organization & Priority
- **Priority Levels** - Mark tasks as High, Medium, or Low priority
- **Important Flag** - Star important tasks for quick access
- **Custom Categories** - Organize tasks by project, context, or importance
- **Search & Filter** - Find tasks quickly with powerful search

### User Management
- **Secure Authentication** - JWT-based login system
- **User Profiles** - Manage your personal information
- **Password Security** - Secure password reset with OTP verification
- **Session Management** - Stay logged in across devices

### Modern UI/UX
- **Dark/Light Mode** - Toggle between themes for comfortable viewing
- **Responsive Design** - Works perfectly on desktop, tablet, and mobile
- **Smooth Animations** - Delightful interactions and transitions
- **Accessibility** - Built with accessibility best practices

### Productivity Features
- **Multi-Select Mode** - Select and manage multiple tasks at once
- **Bulk Operations** - Delete, move, or update multiple tasks
- **Drag & Drop** - Intuitive task organization
- **Keyboard Shortcuts** - Power user features for efficiency

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB Atlas account
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/TodoApp.git
   cd TodoApp
   ```

2. **Install dependencies**
   ```bash
   npm run install-all
   ```

3. **Environment Setup**
   
   Create `backend/.env`:
   ```env
   NODE_ENV=development
   PORT=5000
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/todoapp
   JWT_SECRET=your_secure_jwt_secret_here
   ```

   Create `frontend/.env`:
   ```env
   REACT_APP_API_URL=http://localhost:5000/api
   ```

4. **Start the application**
   ```bash
   npm run dev
   ```

5. **Create test accounts (optional)**
   ```bash
   # Create pre-configured test accounts
   cd backend
   npm run create-test-users
   ```

6. **Open your browser**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## User Guide

### Getting Started

#### Option 1: Use Test Accounts (Quick Start)
1. **Login with test account**
   - Username: `testuser1`
   - Password: `123456`
   - No email verification required

#### Option 2: Create New Account
1. **Create Your Account**
   - Click "Register" to create a new account
   - Verify your email with the OTP code
   - Complete your profile setup

2. **First Task**
   - Click the "+" button to add your first task
   - Give it a title and description
   - Set a due date if needed
   - Click "Create Task"

### Managing Tasks

#### Adding Tasks
- **Quick Add**: Click the "+" button in the bottom corner
- **Inline Form**: Use the input field in each category
- **Detailed Form**: Click "Add Task" for full task creation

#### Organizing Tasks
- **Categories**: Use Today, Scheduled, All, Important, Completed
- **Custom Lists**: Create your own lists with colors and emojis
- **Drag & Drop**: Move tasks between categories
- **Priority**: Mark tasks as High, Medium, or Low priority

#### Task Actions
- **Edit**: Click on any task title to edit inline
- **Complete**: Check the checkbox to mark as done
- **Important**: Click the star icon to mark as important
- **Delete**: Use the trash icon to remove tasks

### Scheduling & Planning

#### Due Dates
- Set specific dates and times for tasks
- View tasks in timeline format
- Get visual reminders of upcoming deadlines

#### Recurring Tasks
- Set up daily, weekly, or monthly recurring tasks
- Automatically create new instances
- Perfect for habits and regular activities

#### Timeline View
- See tasks organized by Today, Tomorrow, and future dates
- Plan your week and month ahead
- Never miss important deadlines

### Organization

#### Custom Lists
- Create lists for different projects or contexts
- Choose from 16 different emojis
- Pick from 8 color themes
- Organize tasks by category

#### Search & Filter
- Use the search bar to find specific tasks
- Filter by category, priority, or completion status
- Quick access to important information

#### Multi-Select Mode
- Enable multi-select to manage multiple tasks
- Bulk delete, move, or update tasks
- Efficient task management for power users

### Customization

#### Themes
- Toggle between Light and Dark mode
- Automatic theme switching based on system preference
- Comfortable viewing in any environment

#### Personal Settings
- Update your profile information
- Change password securely
- Manage account preferences

### Keyboard Shortcuts

- **Enter**: Create new task
- **Escape**: Cancel current action
- **Tab**: Navigate between elements
- **Space**: Toggle task completion
- **Delete**: Remove selected tasks

## Technical Features

### Frontend
- React 18 with modern hooks
- Tailwind CSS for styling
- Lucide React for icons
- Axios for API communication
- React Router for navigation

### Backend
- Node.js with Express
- MongoDB with Mongoose
- JWT authentication
- Bcrypt for password hashing
- Nodemailer for email services

### Database
- MongoDB Atlas cloud database
- User management
- Task storage and organization
- Real-time synchronization

## Security

- **Authentication**: JWT-based secure login
- **Password Security**: Bcrypt hashing with salt
- **Email Verification**: OTP-based account verification
- **CORS Protection**: Configured for secure cross-origin requests
- **Input Validation**: Server-side validation for all inputs

## Responsive Design

- **Desktop**: Full-featured experience with all tools
- **Tablet**: Optimized layout for touch interaction
- **Mobile**: Streamlined interface for on-the-go use
- **Progressive Web App**: Install as native app on mobile devices

## Deployment

### Quick Deploy
1. **Frontend**: Deploy to Vercel (free)
2. **Backend**: Deploy to Render (free)
3. **Database**: MongoDB Atlas (free tier)

### Production Setup
- Environment variables configured
- SSL certificates automatic
- CDN for global performance
- Monitoring and analytics

## Development & Testing

### Test Accounts Setup
For development and testing, you can create pre-configured test accounts:

```bash
# Create test accounts
cd backend
npm run create-test-users

# Test database connection
npm run test-connection
```

### Test Accounts Available
- **testuser1** / `123456` - Basic test user
- **testuser2** / `123456` - Secondary test user  
- **admin** / `admin123` - Admin test user

### Development Features
- Pre-verified email accounts (no OTP required)
- Simple passwords for easy testing
- Ready-to-use test data
- Database connection testing

## Contributing

We welcome contributions! Please feel free to submit a Pull Request.

### Development Setup
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly with test accounts
5. Submit a pull request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- **React Team** - For the amazing framework
- **Tailwind CSS** - For the utility-first CSS framework
- **Lucide** - For the beautiful icon set
- **MongoDB** - For the flexible database
- **Vercel & Render** - For the excellent hosting platforms

## Support

If you have any questions or need help:

- **Issues**: Open an issue on GitHub
- **Documentation**: Check the code comments
- **Community**: Join our discussions

---

## Thank You!

Thank you for using TodoApp! We hope it helps you stay organized and productive. 

**Happy Tasking!**

---

*Built with love by Manh Quang*
