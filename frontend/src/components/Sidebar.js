import React, { useState } from 'react';
import { 
  Calendar, 
  Clock, 
  Users, 
  List, 
  Flag, 
  CheckCircle, 
  UserCheck, 
  Briefcase,
  Plus,
  MoreVertical
} from 'lucide-react';
import { useTasks } from '../context/TaskContext';
import TaskForm from './TaskForm';

const Sidebar = ({ onShowInlineForm, onEditList, onShowListForm }) => {
  const {
    selectedCategory,
    selectedList,
    taskCounts,
    lists,
    setSelectedCategory,
    setSelectedList,
    setAssignedTo,
  } = useTasks();


  const sidebarItems = [
    { id: 'Today', label: 'Today', icon: Calendar, count: taskCounts.Today || 0, iconColor: 'text-accent-blue', bgColor: 'bg-accent-blue' },
    { id: 'Scheduled', label: 'Scheduled', icon: Clock, count: taskCounts.Scheduled || 0, iconColor: 'text-accent-red', bgColor: 'bg-accent-red' },
    { id: 'All', label: 'All', icon: List, count: taskCounts.All || 0, iconColor: 'text-gray-300', bgColor: 'bg-gray-300' },
    { id: 'Flagged', label: 'Important', icon: Flag, count: taskCounts.Flagged || 0, iconColor: 'text-accent-orange', bgColor: 'bg-accent-orange' },
    { id: 'Completed', label: 'Completed', icon: CheckCircle, count: taskCounts.Completed || 0, iconColor: 'text-gray-400', bgColor: 'bg-gray-400' },
  ];

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setSelectedList('');
    setAssignedTo('');
  };

  const handleListSelect = (listName) => {
    setSelectedList(listName);
    setSelectedCategory('');
    setAssignedTo('');
  };


  return (
    <div className="sidebar-fixed">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-dark-700">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-3 text-center">
          Todo App
        </h1>
        
      </div>

      {/* Main Navigation */}
      <div className="flex-1 overflow-y-auto p-4 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
        <div className="grid grid-cols-2 gap-3">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            const isActive = selectedCategory === item.id;
            
            return (
              <div
                key={item.id}
                onClick={() => handleCategorySelect(item.id)}
                className={`sidebar-card ${isActive ? 'active' : ''}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {/* Icon */}
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center mb-2 ${item.bgColor}`}>
                      <Icon className={`w-5 h-5 text-white opacity-100`} />
                    </div>
                    
                    {/* Label */}
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {item.label}
                    </div>
                  </div>
                  
                  {/* Count - positioned at top right */}
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {item.count}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* My Lists */}
        <div className="mt-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              My Lists
            </h3>
            <button
              onClick={onShowListForm}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          
          <div className="space-y-2">
            {lists.map((list) => {
              const isActive = selectedList === list.name;
              return (
                <div
                  key={list._id}
                  className={`relative group p-3 rounded-lg cursor-pointer transition-all duration-200 hover:shadow-medium bg-white dark:bg-darkBg-tertiary shadow-soft border border-gray-200 dark:border-dark-700 ${
                    isActive 
                      ? 'bg-blue-50 dark:bg-darkBg-tertiary shadow-soft border-blue-200 dark:border-accent-orange' 
                      : ''
                  }`}
                >
                  <div 
                    onClick={() => handleListSelect(list.name)}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${isActive ? 'bg-gray-100 dark:bg-dark-700' : 'bg-gray-100 dark:bg-dark-700'}`}>
                        <span className="text-sm">{list.emoji}</span>
                      </div>
                      <span className={`font-medium ${isActive ? 'text-blue-700 dark:text-accent-orange' : 'text-gray-700 dark:text-gray-300'}`}>
                        {list.name}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`text-sm font-bold ${isActive ? 'text-blue-700 dark:text-accent-orange' : 'text-gray-500 dark:text-gray-400'}`}>
                        {taskCounts[list.name] || 0}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditList(list);
                        }}
                        className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                      >
                        <MoreVertical className="w-4 h-4 text-gray-400" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Recently Deleted Section */}
      <div className="p-4 border-t border-gray-200 dark:border-dark-700">
        <div 
          className="relative p-3 rounded-lg cursor-pointer transition-all duration-200 hover:shadow-medium bg-white dark:bg-darkBg-tertiary shadow-soft border border-gray-200 dark:border-dark-700"
          onClick={() => {
            setSelectedCategory('Recently Deleted');
            setSelectedList('');
            setAssignedTo('');
          }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-gray-100 dark:bg-dark-700">
                <svg className="w-4 h-4 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <span className="font-medium text-gray-700 dark:text-gray-300">Recently Deleted</span>
            </div>
            <span className="text-sm font-bold text-gray-500 dark:text-gray-400">
              {taskCounts['Recently Deleted'] || 0}
            </span>
          </div>
        </div>
      </div>

    </div>
  );
};

export default Sidebar;
