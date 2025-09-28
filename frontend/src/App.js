import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { TaskProvider } from './context/TaskContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import Sidebar from './components/Sidebar';
import KanbanBoard from './components/KanbanBoard';
import Header from './components/Header';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import ForgotPassword from './components/auth/ForgotPassword';
import WelcomeModal from './components/WelcomeModal';
import ListEditModal from './components/ListEditModal';
import ListForm from './components/ListForm';

// Main App Component (requires authentication)
const MainApp = () => {
  const { user, logout, updateUser } = useAuth();
  const { isDarkMode, toggleDarkMode } = useTheme();
  const [currentUser, setCurrentUser] = useState(user);

  // Update currentUser when user changes
  useEffect(() => {
    setCurrentUser(user);
  }, [user]);

  const handleUserUpdate = (updatedUser) => {
    setCurrentUser(updatedUser);
    updateUser(updatedUser); // Also update in AuthContext
  };

  const [showInlineForm, setShowInlineForm] = useState(false);
  const [isMultiSelectMode, setIsMultiSelectMode] = useState(false);
  const [selectedTasks, setSelectedTasks] = useState([]);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [editingList, setEditingList] = useState(null);
  const [showListForm, setShowListForm] = useState(false);

  // Check if user is new (first time login)
  useEffect(() => {
    const isNewUser = localStorage.getItem('isNewUser');
    if (isNewUser === 'true') {
      setShowWelcomeModal(true);
      localStorage.removeItem('isNewUser');
    }
  }, []);

  const handleShowInlineForm = () => {
    setShowInlineForm(true);
  };

  const toggleMultiSelectMode = () => {
    setIsMultiSelectMode(!isMultiSelectMode);
    if (isMultiSelectMode) {
      setSelectedTasks([]); // Clear selection when exiting multi-select mode
    }
  };

  return (
    <TaskProvider>
      <div className="min-h-screen bg-gray-50 dark:bg-darkBg-primary transition-colors duration-200">
        <Header 
          onToggleDarkMode={toggleDarkMode} 
          isDarkMode={isDarkMode}
          onToggleMultiSelect={toggleMultiSelectMode}
          isMultiSelectMode={isMultiSelectMode}
          user={currentUser}
          onLogout={logout}
          onUserUpdate={handleUserUpdate}
        />
        
        <div className="flex h-[calc(100vh-73px)]">
          <Sidebar 
            onShowInlineForm={handleShowInlineForm} 
            onEditList={setEditingList}
            onShowListForm={() => setShowListForm(true)}
          />
          <div className="flex-1 ml-80">
            <KanbanBoard 
              showInlineForm={showInlineForm} 
              setShowInlineForm={setShowInlineForm}
              isMultiSelectMode={isMultiSelectMode}
              selectedTasks={selectedTasks}
              setSelectedTasks={setSelectedTasks}
            />
          </div>
        </div>
      </div>
      
      {/* Welcome Modal for new users */}
      <WelcomeModal 
        isOpen={showWelcomeModal} 
        onClose={() => setShowWelcomeModal(false)} 
      />
      
      {/* List Edit Modal */}
      {editingList && (
        <ListEditModal 
          list={editingList} 
          onClose={() => setEditingList(null)} 
        />
      )}
      
      {/* List Form Modal */}
      {showListForm && (
        <ListForm 
          onClose={() => setShowListForm(false)} 
        />
      )}
    </TaskProvider>
  );
};

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-darkBg-primary flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-orange mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }
  
  return user ? children : <Navigate to="/login" replace />;
};

// Main App Component with Routing
function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route 
              path="/*" 
              element={
                <ProtectedRoute>
                  <MainApp />
                </ProtectedRoute>
              } 
            />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
