import React, { useState } from "react";
import { Upload, FileText, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ProcessingAnimation from "../components/ProcessingAnimation";
import { uploadPDF } from "../services/api";

const HomePage = () => {
  const [collectionName, setCollectionName] = useState("pdf_collection");
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [error, setError] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type === "application/pdf") {
        setSelectedFile(file);
      } else {
        setError("Please upload a PDF file only");
      }
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type === "application/pdf") {
        if (file instanceof File) {
          setSelectedFile(file);
          setError("");
        } else {
          setError("Invalid file object");
        }
      } else {
        setError("Please upload a PDF file only");
      }
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !collectionName.trim()) {
      setError("Please select a file and provide a collection name.");
      return;
    }

    setIsProcessing(true);
    setError("");

    try {
      const result = await uploadPDF(selectedFile, collectionName.trim());
      if (result.status === "success") {
        const notification = document.createElement("div");
        notification.className =
          "fixed top-4 right-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded flex items-center shadow-lg transition-all duration-500";
        notification.innerHTML = `
          <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
          </svg>
          <span class="font-medium">Upload successful!</span>
        `;
        document.body.appendChild(notification);
        setTimeout(() => {
          notification.style.opacity = "0";
          setTimeout(() => notification.remove(), 500);
        }, 3000);

        setTimeout(handleProcessingComplete, 3000);
      } else {
        throw new Error(result.error || "Upload failed");
      }
    } catch (err) {
      console.error("Upload error:", err);
      setError(err.message);
      setIsProcessing(false);
    }
  };

  const handleProcessingComplete = () => {
    setIsProcessing(false);
    navigate("/chat", {
      state: {
        collectionName,
        fileName: selectedFile.name,
      },
    });
  };

  return (
    <div className="h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      {isProcessing && (
        <ProcessingAnimation
          duration={3000}
          onComplete={handleProcessingComplete}
        />
      )}

      <div className="max-w-2xl w-full">
        {" "}
        <div className="text-center mb-8">
          {" "}
          <div className="mb-4">
            <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl mx-auto mb-3 flex items-center justify-center shadow-lg">
              {" "}
              <FileText className="w-10 h-10 text-white" />
            </div>
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2 tracking-tight">
            {" "}
            ScholarSight
          </h1>
          <p className="text-xl text-gray-700 font-semibold mb-2">
            AI Powered Research Assistant
          </p>
        </div>
        <div className="mb-6">
          <label className="block text-sm font-bold text-gray-800 mb-2">
            Collection Name
          </label>
          <input
            type="text"
            value={collectionName}
            onChange={(e) => setCollectionName(e.target.value)}
            placeholder="Enter a unique name for your document set"
            className="w-full py-2 px-3 text-gray-800 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-0 transition-all duration-200 bg-white/70"
          />
        </div>
        <div className="mb-4">
          {" "}
          <label className="block text-sm font-bold text-gray-800 mb-2">
            {" "}
            Upload PDF Document
          </label>
          <div
            className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ${
              dragActive
                ? "border-blue-500 bg-blue-50/50 scale-105"
                : selectedFile
                ? "border-green-500 bg-green-50/50"
                : "border-gray-300 hover:border-gray-400 hover:bg-gray-50/30"
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              type="file"
              accept=".pdf"
              onChange={handleFileSelect}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />

            {selectedFile ? (
              <div className="space-y-3">
                {" "}
                <div className="w-16 h-16 bg-green-100 rounded-xl mx-auto flex items-center justify-center">
                  {" "}
                  <FileText className="w-8 h-8 text-green-600" />{" "}
                </div>
                <div>
                  <p className="text-lg font-bold text-green-700 mb-1">
                    {" "}
                    {selectedFile.name}
                  </p>
                  <p className="text-sm text-green-600 bg-green-100 px-3 py-1 rounded-full inline-block">
                    {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {" "}
                <div className="w-16 h-16 bg-gray-100 rounded-xl mx-auto flex items-center justify-center">
                  {" "}
                  <Upload className="w-8 h-8 text-gray-400" />{" "}
                </div>
                <div>
                  <p className="text-lg font-bold text-gray-700 mb-1">
                    {" "}
                    Drop your PDF here or click to browse
                  </p>
                  <p className="text-sm text-gray-500">
                    PDF files only • Max 10MB • Secure processing
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
        {error && (
          <div className="text-red-500 text-sm text-center mb-3">{error}</div>
        )}
        {!isProcessing ? (
          <>
            <button
              onClick={handleUpload}
              disabled={!selectedFile || !collectionName.trim()}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-4 px-6 rounded-xl text-base font-bold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              Process PDF with AI
              <ArrowRight className="w-5 h-5" />
            </button>
          </>
        ) : (
          <div className="text-center">
            <ProcessingAnimation
              duration={3000}
              onComplete={handleProcessingComplete}
            />
            <p className="mt-4 text-gray-600">Processing your document...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;
