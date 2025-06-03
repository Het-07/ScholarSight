import React, { useEffect, useState } from "react";
import { FileText, Zap, Brain } from "lucide-react";

const ProcessingAnimation = ({
  message = "Processing your PDF...",
  onComplete,
  duration = 3000,
}) => {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      icon: FileText,
      text: "Reading your document...",
      color: "text-blue-500",
    },
    { icon: Brain, text: "Analyzing content...", color: "text-purple-500" },
    { icon: Zap, text: "Preparing AI assistant...", color: "text-green-500" },
  ];

  useEffect(() => {
    const stepDuration = duration / steps.length;
    const interval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev < steps.length - 1) {
          return prev + 1;
        } else {
          clearInterval(interval);
          setTimeout(() => onComplete?.(), 500);
          return prev;
        }
      });
    }, stepDuration);

    return () => clearInterval(interval);
  }, [duration, onComplete, steps.length]);

  return (
    <div className="fixed inset-0 bg-gray-50 flex items-center justify-center z-50">
      <div className="text-center max-w-md mx-auto p-8">
        {/* Animated circles */}
        <div className="relative w-32 h-32 mx-auto mb-8">
          <div className="absolute inset-0 border-4 border-blue-200 rounded-full"></div>
          <div className="absolute inset-2 border-4 border-blue-400 rounded-full animate-spin"></div>
          <div className="absolute inset-4 border-4 border-blue-600 rounded-full animate-ping"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            {React.createElement(steps[currentStep].icon, {
              className: `w-8 h-8 ${steps[currentStep].color} animate-pulse`,
            })}
          </div>
        </div>

        {/* Processing steps */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900">ScholarSight</h2>
          <p className="text-lg font-semibold text-gray-700 animate-fade-in">
            {message} {steps[currentStep].text}
          </p>

          {/* Progress bar */}
          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            ></div>
          </div>

          {/* Step indicators */}
          <div className="flex justify-center space-x-4 mt-6">
            {steps.map((step, index) => (
              <div
                key={index}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index <= currentStep ? "bg-blue-500 scale-110" : "bg-gray-300"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProcessingAnimation;
