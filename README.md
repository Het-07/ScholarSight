# ScholarSight

## Overview

ScholarSight is a comprehensive academic research management platform designed to help researchers, students, and academics efficiently organize, discover, and collaborate on scholarly work. The application streamlines the process of finding, saving, and analyzing research papers while providing powerful collaborative features.

![ScholarSight Logo](./documentation/images/logo.png)

## Features

### User Authentication & Profiles

- Secure login and registration
- Customizable user profiles
- Academic interest management

### Research Paper Management

- Save and organize research papers
- Create custom collections and tags
- Track reading progress
- Add personal notes and annotations

### Search & Discovery

- Advanced search functionality across multiple academic databases
- Citation tracking
- Research recommendations based on user interests
- Filter by publication date, author, journal, and more

### Collaboration Tools

- Share papers and collections with colleagues
- Discussion threads on specific papers
- Collaborative note-taking
- Team workspaces

### Analytics & Insights

- Citation metrics and impact tracking
- Research trend analysis
- Personalized research insights
- Reading history and statistics

## System Architecture

ScholarSight follows a modern microservices architecture to ensure scalability, maintainability, and resilience.

### Architecture Diagram

![Architecture Diagram](./documentation/diagrams/architecture.png)

### Key Components

- **Frontend Application**: React-based SPA with Redux for state management
- **API Gateway**: Entry point for client requests, handles routing and authentication
- **Microservices**:
  - User Service: Handles user authentication and profile management
  - Research Paper Service: Manages paper storage and retrieval
  - Search Service: Provides search functionality across multiple data sources
  - Analytics Service: Processes user data and research metrics
  - Collaboration Service: Manages shared workspaces and discussions
- **Databases**:
  - MongoDB for user data and paper metadata
  - Elasticsearch for efficient search functionality
  - Redis for caching frequently accessed data

## UML Diagrams

### Class Diagram

The main class relationships within ScholarSight:

![Class Diagram](./documentation/diagrams/class-diagram.png)

### Sequence Diagram

User paper search and save workflow:

![Sequence Diagram](./documentation/diagrams/sequence-diagram.png)

## Technology Stack

- **Frontend:** React, Redux, Material UI
- **Backend:** Node.js, Express
- **Database:** MongoDB
- **Authentication:** JWT
- **APIs:** Integration with academic databases and citation services
- **Search:** Elasticsearch
- **Caching:** Redis
- **Deployment:** Docker, Kubernetes

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- MongoDB
- API keys for academic databases (if applicable)
- Docker (optional for containerized deployment)

### Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/ScholarSight.git
cd ScholarSight
```

2. Install dependencies:

```bash
# Install backend dependencies
npm install

# Install frontend dependencies
cd client
npm install
cd ..
```

3. Set up environment variables:
   Create a `.env` file in the root directory with the following variables:

```
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
ELASTICSEARCH_URL=your_elasticsearch_url
REDIS_URL=your_redis_url
```

4. Start the development server:

```bash
# Run backend and frontend concurrently
npm run dev

# Run backend only
npm run server

# Run frontend only
npm run client
```

5. Access the application at `http://localhost:3000`

## Docker Deployment

```bash
# Build the Docker image
docker build -t scholarsight .

# Run the container
docker run -p 3000:3000 -p 5000:5000 scholarsight
```

## Usage

### Managing Research Papers

1. Search for papers using the search bar
2. Save papers to your library
3. Organize papers into collections
4. Add notes and annotations

### Collaboration

1. Create or join a workspace
2. Invite colleagues
3. Share papers and collections
4. Participate in discussions

### Analytics

1. View citation metrics
2. Track research trends
3. Analyze your reading patterns

## API Documentation

API documentation is available at `/api/docs` when running the server locally, or visit our [API Documentation](https://scholarsight.io/api/docs) for the production environment.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgements

- Academic database providers
- Open-source libraries used in this project
- Contributors and testers

Project Link: [https://github.com/Het-07/ScholarSight](https://github.com/Het-07/ScholarSight)
