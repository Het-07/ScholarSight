import React, { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Send, Copy, Download, ArrowLeft, Bot, User } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { useToast } from "../hooks/use-toast";
import ThinkingAnimation from "../components/ThinkingAnimation";
import { queryPDF } from "../services/api";

const ChatPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const { collectionName, fileName } = location.state || {};

  useEffect(() => {
    if (!collectionName || !fileName) {
      navigate("/");
    }
  }, [collectionName, fileName, navigate]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage = {
      id: Date.now().toString(),
      type: "user",
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    try {
      const response = await queryPDF(inputValue, collectionName);

      if (response.result) {
        const aiMessage = {
          id: (Date.now() + 1).toString(),
          type: "assistant",
          content: response.result,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, aiMessage]);
      } else {
        throw new Error("No response received");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to get response from AI",
        variant: "destructive",
      });

      const errorMessage = {
        id: (Date.now() + 1).toString(),
        type: "assistant",
        content:
          "I apologize, but I encountered an error processing your request. Please try again.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const copyToClipboard = (content) => {
    navigator.clipboard.writeText(content);
    toast({
      title: "Copied to clipboard",
      description: "The response has been copied to your clipboard.",
    });
  };

  const downloadAsDocx = (content) => {
    const blob = new Blob([content], {
      type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `response-${Date.now()}.docx`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Download started",
      description: "Your response is being downloaded as a DOCX file.",
    });
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <div className="min-h-screen bg-gray-200 flex flex-col">
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                onClick={() => navigate("/")}
                className="bg-gradient-to-r gap-1 from-blue-100 to-purple-100 px-4 py-2 rounded-xl border border-blue-200/50 hover:from-blue-200 hover:to-purple-200"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
                <span className="font-medium text-gray-800">
                  Back to Upload
                </span>
              </Button>
            </div>

            <div className="text-right">
              <div className="bg-gradient-to-r from-blue-100 to-purple-100 px-4 py-2 rounded-xl border border-blue-200/50">
                <p className="text-sm font-bold text-gray-800">
                  Active Collection
                </p>
                <p className="text-xs text-gray-600 font-medium truncate max-w-32">
                  {collectionName}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6 bg-gray-100">
        <div className="max-w-3xl mx-auto space-y-4">
          {messages.length === 0 && (
            <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-gray-300">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-100 to-purple-100 rounded-2xl mx-auto mb-6 flex items-center justify-center">
                <Bot className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-3">
                Ready to analyze your document
              </h3>
              <p className="text-gray-600 mb-2">
                Ask me anything about:{" "}
                <span className="font-semibold text-gray-800">
                  "{fileName}"
                </span>
              </p>
              <p className="text-gray-500 text-sm">
                I can help you summarize, analyze, or answer specific questions
                about your PDF
              </p>
            </div>
          )}

          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${
                message.type === "user" ? "justify-end" : "justify-start"
              }`}
            >
              {message.type === "assistant" && (
                <div className="w-7 h-7 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm">
                  <Bot className="w-4 h-4 text-black" />
                </div>
              )}

              <div
                className={`max-w-xl relative ${
                  message.type === "user"
                    ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                    : "bg-white border border-gray-200 text-black"
                } rounded-xl p-3 shadow-md`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <p className="text-sm leading-relaxed">{message.content}</p>
                  </div>

                  {message.type === "assistant" && (
                    <div className="flex flex-shrink-0">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(message.content)}
                        className="h-9 w-9 p-0 text-gray-600 hover:text-gray-800 hover:bg-gray-100"
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => downloadAsDocx(message.content)}
                        className="h-9 w-9 p-0 text-gray-600 hover:text-gray-800 hover:bg-gray-100"
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>

                <div className="flex justify-end mt-2">
                  <p
                    className={`text-xs ${
                      message.type === "user"
                        ? "text-blue-100"
                        : "text-gray-500"
                    } font-medium`}
                  >
                    {formatTime(message.timestamp)}
                  </p>
                </div>
              </div>

              {message.type === "user" && (
                <div className="w-7 h-7 bg-gray-700 rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm">
                  <User className="w-4 h-4 text-white" />
                </div>
              )}
            </div>
          ))}

          {isLoading && <ThinkingAnimation />}

          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="bg-white border-t border-gray-200 shadow-md">
        <div className="max-w-3xl mx-auto p-6">
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="What would you like to know about your document?"
                disabled={isLoading}
                className="bg-white text-black border-gray-300 focus:border-blue-500"
              />
            </div>
            <Button
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isLoading}
              variant="default"
              className="p-4 bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
