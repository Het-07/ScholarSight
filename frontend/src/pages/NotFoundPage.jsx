import React from "react";
import { Link } from "react-router-dom";
import { FileSearch, HomeIcon, AlertCircle } from "lucide-react";
import { Button } from "../components/ui/button";

const NotFoundPage = () => {
  return (
    <div className="min-h-screen bg-gray-200 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-8 max-w-md w-full text-center">
        <div className="mb-6">
          <div className="w-16 h-16 bg-red-100 rounded-full mx-auto mb-4 flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Page Not Found
          </h1>
          <p className="text-gray-600 mb-6">
            Sorry, we couldn't find the page you're looking for. It might have
            been moved or doesn't exist.
          </p>
        </div>

        <div className="space-y-4">
          <Link to="/">
            <Button className="w-full h-8 mb-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 transition-all duration-200 text-base">
              <HomeIcon className="w-5 h-5 mr-2" />
              Return to Home
            </Button>
          </Link>
          <p className="text-sm text-gray-500">
            Try uploading your documents again from the homepage.
          </p>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
