# Energz - Application Management Service

## Overview

Energz is a TypeScript-based RESTful service designed to manage applications for solar panels and heat pumps. It provides full CRUD operations, duplicate handling, and filtering functionality. This service uses `seed.json` to load initial data.

## Features

- **CRUD Operations**: Create, Read, Update, and Delete applications with RESTful API endpoints.
- **Application Status Management**: Each application has a status (in_review, approved, or rejected).
- **Duplicate Handling**: Prevent duplicate applications by checking for existing applications with the same id.
- **Data Pagination & Filtering**: Paginate and filter applications by status, and name. Implements filtering capabilities to manage large datasets.
- **Data Sorting**: Sort applications by status, and name in ascending or descending order.
- **Containerized Deployment**: Deployable using Docker for a consistent, reliable setup.

## Step-by-Step Setup Guide

### Prerequisites

- **Docker**: Ensure Docker is installed. Get Docker [here](https://docs.docker.com/engine/install/).
- **Node.js** (optional): If you prefer to run locally outside of Docker.

### Quick Start with Docker

1. #### Clone the repository:

```bash
git clone https://github.com/vicreative/energz.git
cd energz
```

2. #### Start the Prometheus and the Application in Docker

To build and run the application containerized:

```bash
docker compose up --build
```

3. #### Access the Application

Once the Docker container is running, the application will be accessible at http://localhost:8080 while Prometheus dashboard will be accessible at http://localhost:9090. (Here, you can visualize and monitor metrics collected from the application.)

4. #### Stopping the Application

To stop the application:

```bash
docker compose down
```

## API Documentation

1. #### Create Application

- **POST** /applications
- Request Body: { "name": string, "description": string, "status": "in_review" | "approved" | "rejected" }

2. #### Read Applications

- **GET** /applications
- Optional Query Parameter: status for filtering

3. #### Update Application

- **PATCH** /applications/:id
- Request Body: { "name": string, "description": string, "status": string }

4. #### Delete Application

- **DELETE** /applications/:id

---

## Dependencies Breakdown

This project uses several key packages to enhance functionality, observability, security, and overall performance:

### Core Packages

- **express**: Provides the server framework for creating RESTful endpoints.
- **zod**: Used for request validation and schema handling to ensure data integrity in requests and responses.

### Observability and Logging

- **pino and pino-http**: Logging libraries that provide structured, high-performance logs, essential for debugging and monitoring.
- **prom-client**: This application uses [Prometheus](https://prometheus.io/) for monitoring and metrics collection. The `/metrics` endpoint monitors the application performance, such as request durations and default Node.js runtime metrics.

#### Metrics Collected

- **Default Node.js metrics**: Collected at 5-second intervals, including memory usage, CPU usage, and event loop lag.
- **HTTP request duration**: The time taken to serve HTTP requests, with response times bucketed by duration.

Prometheus will automatically scrape these metrics every 15 seconds, providing real-time insights into application performance.

### Security

- **helmet**: Sets various HTTP headers to enhance security, protecting the app from vulnerabilities.
- **express-rate-limit**: Limits request rates to prevent abuse and potential DDoS attacks.
- **cors**: Manages Cross-Origin Resource Sharing to control the resources the app serves to different origins.

### Documentation and Validation

- **swagger-ui-express**: Enables Swagger UI, which helps visualize and interact with the API’s documentation.
- **@asteasolutions/zod-to-openapi**: Generates OpenAPI documentation from Zod schemas, ensuring that the API documentation matches the service structure accurately.

### Configuration and Environment Management

- **dotenv**: Loads environment variables from a .env file, allowing sensitive configuration data to be stored separately.
- **envalid**: Enforces strict typing and validation of environment variables to avoid misconfigurations.

### Development and Testing

- **jest**: JavaScript testing framework for creating unit and integration tests to validate code functionality.
- **supertest**: Provides HTTP assertions, making it easier to test RESTful API endpoints.

### Build and Formatting Tools

- **typescript**: Ensures type safety, reducing errors during development.
- **eslint and prettier**: Linting and formatting tools to maintain code consistency.
- **tsup**: TypeScript bundler, enabling the project to be compiled and optimized for production.

### Scripting

- **rimraf**: Removes the dist directory before a fresh build to ensure old files are cleared.

### Testing

To verify the functionality of the service, run the tests using Jest:

```bash
Copy code
npm run test
```

**Example Test**: Checks CRUD endpoints and verifies correct handling of duplicate entries.
