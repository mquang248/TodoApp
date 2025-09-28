import React, { useState } from 'react';
import { X, CheckCircle, Star, Calendar, Flag, List, Zap } from 'lucide-react';

const WelcomeModal = ({ isOpen, onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const features = [
    {
      icon: <List className="w-8 h-8 text-blue-500" />,
      title: "List Management",
      description: "Create and organize lists by color for easy task categorization."
    },
    {
      icon: <Flag className="w-8 h-8 text-red-500" />,
      title: "Priority Marking",
      description: "Categorize tasks by priority level: High, Medium, Low."
    },
    {
      icon: <Calendar className="w-8 h-8 text-green-500" />,
      title: "Schedule Time",
      description: "Set deadlines for tasks and view them by day, week, month."
    },
    {
      icon: <Star className="w-8 h-8 text-yellow-500" />,
      title: "Mark Complete",
      description: "Track progress and view completed tasks."
    },
    {
      icon: <Zap className="w-8 h-8 text-purple-500" />,
      title: "Multi-Select Mode",
      description: "Select multiple tasks at once to perform batch operations."
    }
  ];

  const steps = [
    {
      title: "Welcome to TodoApp! 🎉",
      content: (
        <div className="text-center">
          <div className="mb-6">
            <img src="/logo.png" alt="TodoApp" className="w-16 h-16 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Welcome!
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              You're ready to start managing your tasks. Create your first task!
            </p>
          </div>
        </div>
      )
    },
    {
      title: "Key Features",
      content: (
        <div className="space-y-4">
          {features.map((feature, index) => (
            <div key={index} className="flex items-start space-x-3">
              <div className="flex-shrink-0 mt-1">
                {feature.icon}
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {feature.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      )
    },
    {
      title: "Get Started",
      content: (
        <div className="text-center">
          <div className="mb-6">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Ready to start!
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              You can start creating new tasks, creating custom lists, and organizing your work.
            </p>
          </div>
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              💡 <strong>Tip:</strong> Use the "+" button in the bottom left corner to quickly create new tasks!
            </p>
          </div>
        </div>
      )
    }
  ];

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onClose();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4">
      <div className="bg-white dark:bg-darkBg-primary rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
            {steps[currentStep].title}
          </h1>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {steps[currentStep].content}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700">
          <div className="flex space-x-2">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full ${
                  index === currentStep 
                    ? 'bg-accent-orange' 
                    : 'bg-gray-300 dark:bg-gray-600'
                }`}
              />
            ))}
          </div>
          
          <div className="flex space-x-3">
            {currentStep > 0 && (
              <button
                onClick={prevStep}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                Back
              </button>
            )}
            <button
              onClick={nextStep}
              className="px-4 py-2 text-sm font-medium text-white bg-accent-orange rounded-lg hover:bg-primary-600 transition-colors"
            >
              {currentStep === steps.length - 1 ? 'Get Started!' : 'Next'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomeModal;
