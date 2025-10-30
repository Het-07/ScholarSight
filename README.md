# ScholarSight - Academic Research Assistant

## Project Overview

ScholarSight is an intelligent academic research assistant that employs RAG (Retrieval-Augmented Generation) technology using Ollama Mistral:7b to help researchers efficiently process, analyze, and query academic papers. The system can ingest PDF documents, extract and index their content, and provide accurate answers to complex queries about the research material.

## Architecture Design

![Architecture Design](./documentation/Final%20Architecture.png)

## Data Sequence Diagram - UML

![Data Sequence Diagram](./documentation/UML%20DIAGRAM.png)

### Component Interaction Flow

1. User uploads PDFs or sends queries through the React frontend.
2. Flask backend processes these requests and manages document processing.
3. Documents are processed, chunked, and stored in Qdrant vector database.
4. Queries are processed by the RAG engine using Ollama for LLM capabilities.
5. Results are returned to frontend for display.
6. AWS services manage infrastructure, storage, and monitoring.

## Tech Stack

### Frontend

- **React**: UI framework for building interactive interfaces
- **Vite**: Next-generation frontend tooling for faster development
- **Tailwind CSS**: For responsive design (inferred)

### Backend

- **Flask**: Python web framework for API endpoints
- **LangChain**: Framework for LLM applications
- **PyPDF2/PDFMiner**: PDF text extraction utilities
- **NLTK/SpaCy**: NLP processing libraries

### Database & Vector Storage

- **Qdrant**: Vector database for semantic search
- **DynamoDB**: Document metadata storage

### AI/ML

- **Ollama**: Local LLM deployment
- **RAG (Retrieval-Augmented Generation)**: Architecture for providing context to LLM responses

### Deployment

- **Docker**: Containerization of services
- **Terraform**: Infrastructure as Code for AWS deployment

## AWS Services Used

| Service             | Purpose                                                                          |
| ------------------- | -------------------------------------------------------------------------------- |
| **EC2**             | Hosts the main application, running Flask backend, Ollama, and Qdrant containers |
| **S3**              | Stores uploaded PDFs and processed document chunks                               |
| **DynamoDB**        | Stores metadata about documents, embeddings, and user queries                    |
| **Secrets Manager** | Secures API keys, credentials, and configuration settings                        |
| **CloudWatch**      | Monitors application performance and logs                                        |
| **IAM**             | Manages permissions and access control                                           |

## Directory Structure

```
/ScholarSight/
├── backend/              # Flask application and RAG engine
├── frontend/             # React/Vite frontend application
├── terraform/            # IaC scripts for AWS deployment
├── docs/                 # Documentation and design files
└── README.md             # This file
```

## Setup Instructions

### Local Development

**Clone the repository**

```bash
git clone https://github.com/Het-07/ScholarSight
cd ScholarSight
```

**Backend Setup**

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Start Qdrant (requires Docker)
docker run -p 6333:6333 qdrant/qdrant

# Start Ollama
ollama serve

# Run the application
python run.py
```

**Frontend Setup**

```bash
cd frontend
npm install
npm run dev
```

### AWS Deployment

**Deploy using Terraform**

```bash
cd terraform
terraform init
terraform plan
terraform apply
```

## About

Copyright (c) Code by Het Patel. All rights reserved.
