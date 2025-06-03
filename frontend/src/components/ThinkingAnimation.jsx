import { Brain, Sparkles } from "lucide-react";

const ThinkingAnimation = () => {
  return (
    <div className="flex gap-4">
      <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
        <Brain className="w-4 h-4 text-white animate-pulse" />
      </div>
      <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm max-w-3xl">
        <div className="flex items-center gap-3">
          <Sparkles className="w-4 h-4 text-blue-500 animate-spin" />
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
            <div
              className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
              style={{ animationDelay: "0.1s" }}
            ></div>
            <div
              className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
              style={{ animationDelay: "0.2s" }}
            ></div>
          </div>
          <span className="text-sm text-gray-600 animate-pulse">
            AI is thinking...
          </span>
        </div>
      </div>
    </div>
  );
};

export default ThinkingAnimation;
