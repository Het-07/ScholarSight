// api.js
const API_BASE_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:5000";

export const uploadPDF = async (file, collectionName) => {
  try {
    console.log("Starting upload...", file.name);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("collection_name", collectionName);

    const response = await fetch(`${API_BASE_URL}/api/upload`, {
      method: "POST",
      body: formData,
    });

    console.log("Response status:", response.status);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Upload failed");
    }

    return await response.json();
  } catch (error) {
    console.error("Upload error:", error);
    throw error;
  }
};

export const queryPDF = async (query, collectionName) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/query`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query,
        collection_name: collectionName,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Query failed");
    }

    return await response.json();
  } catch (error) {
    console.error("Query error:", error);
    throw error;
  }
};
