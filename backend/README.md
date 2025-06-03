# ScholarSight Backend

Flask-based backend service for the ScholarSight RAG system.

## Features

- PDF document processing and indexing
- RAG-based question answering
- Vector storage with Qdrant
- LLM integration with Ollama

## Setup

```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start Qdrant (requires Docker)
docker run -p 6333:6333 qdrant/qdrant

# Start Ollama
ollama serve

# Run the application
python run.py
```

## API Endpoints

Base URL: `http://localhost:5000/api`

- `POST /api/upload`: Upload and process PDF documents
- `POST /api/query`: Query processed documents
- `GET /api/health`: Health check endpoint

## Environment Variables

- `QDRANT_HOST`: Qdrant server host (default: localhost)
- `QDRANT_PORT`: Qdrant server port (default: 6333)
- `OLLAMA_BASE_URL`: Ollama server URL (default: http://localhost:11434)
