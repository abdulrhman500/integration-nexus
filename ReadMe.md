# Integrations Nexus
This Task demonstrates a full-stack application with a React frontend and a Python (FastAPI) backend, featuring an OAuth 2.0 integration with the HubSpot API.

---

## 📋 Table of Contents

1.  [How to Run the Application](#-how-to-run-the-application)
    * [Method 1: Docker (Recommended)](#method-1-run-with-docker-recommended)
    * [Method 2: Local Setup (Manual)](#method-2-run-locally-manual-setup)
2.  [Application Architecture](#-application-architecture)
    * [Backend Structure](#backend-structure)
    * [Frontend Structure](#frontend-structure)

---

## 🚀 How to Run the Application

You can run this project in two ways: using Docker (recommended for ease of setup) or by setting up the local environment manually.

### Method 1: Run with Docker (Recommended)

This is the simplest way to get the entire application running. It automatically handles the backend, frontend, and Redis services.

#### Prerequisites

* **Docker** and **Docker Compose** installed on your machine.

#### Instructions

1.  **Configure Environment Variables:**
    * Navigate to the `/backend` directory.
    * Create a file named `.env.docker`.
    * Copy the contents from `.env.example` into `.env.docker` and fill in your HubSpot Client ID and Secret. The file should look like this:

    ```env
    # backend/.env.docker

    # Your HubSpot Credentials
    HUBSPOT_CLIENT_ID=your_client_id_here
    HUBSPOT_CLIENT_SECRET=your_client_secret_here

    # This MUST match the Redirect URL in your HubSpot App settings
    HUBSPOT_CALLBACK_ENDPOINT=http://localhost:8000/v1/hubspot/oauth2/callback

    # Docker-specific Redis host
    REDIS_HOST=redis

    # Frontend URL for CORS
    FRONTEND_URL=http://localhost:3000
    ```

2.  **Run the Services:**
    * From the project's **root directory**, run the following command to build and start all services:

    ```bash
    docker compose --profile "*" up --build
    ```

    * The backend will be available at `http://localhost:8000`.
    * The frontend will be available at `http://localhost:3000`.

#### Running Services Individually (Optional)

If you only want to run a specific part of the application:

* **To run only the Backend & Redis:**
    ```bash
    docker compose --profile backend up --build
    ```

* **To run only the Frontend:**
    ```bash
    docker compose --profile frontend up --build
    ```

---

### Method 2: Run Locally (Manual Setup)

Follow these steps if you prefer to run the services directly on your machine without Docker.

#### Prerequisites

* **Python 3.11** or higher.
* **Node.js v18** or higher.
* **Redis** installed and running on its default port (6379). You can install it via Homebrew (`brew install redis`) or download it from the [official website](https://redis.io/docs/getting-started/installation/).

#### 1. Backend Setup

* **Navigate to the backend directory:**
    ```bash
    cd backend
    ```

* **Create and activate a virtual environment:**
    ```bash
    python3 -m venv venv
    source venv/bin/activate
    ```
    *(On Windows, use `venv\Scripts\activate`)*

* **Install dependencies:**
    ```bash
    pip install -r requirements.txt
    ```

* **Configure environment variables:**
    * Create a `.env` file in the `/backend` directory.
    * Copy the contents of `.env.example` into it and add your HubSpot credentials. **Make sure `REDIS_HOST` is set to `localhost`**.

    ```env
    # backend/.env
    HUBSPOT_CLIENT_ID=your_client_id_here
    HUBSPOT_CLIENT_SECRET=your_client_secret_here
    HUBSPOT_CALLBACK_ENDPOINT=http://localhost:8000/v1/hubspot/oauth2/callback
    REDIS_HOST=localhost
    FRONTEND_URL=http://localhost:3000
    ```

* **Run the backend server:**
    ```bash
    uvicorn main:app --reload
    ```
    The backend will be running at `http://localhost:8000`.

#### 2. Frontend Setup

* **Open a new terminal window.**
* **Navigate to the frontend directory:**
    ```bash
    cd frontend
    ```

* **Install dependencies:**
    ```bash
    npm install
    ```

* **Run the frontend development server:**
    ```bash
    npm start
    ```
    The frontend will be running at `http://localhost:3000`.

---

## 🏛️ Application Architecture

The project is organized into a separate frontend and backend, following a clean, layered architecture.

### Backend Structure

The backend is a FastAPI application designed for clear separation of concerns.

* **`/main.py`**: The entry point of the application. It initializes the FastAPI app, sets up CORS middleware, registers exception handlers, and includes the main API router.

* **`/controllers`**: This layer is responsible for handling the HTTP requests. It receives incoming requests, validates them, and calls the appropriate service layer functions. It's the bridge between the web and the application's core logic.

* **`/services`**: This is where the core business logic resides. Services orchestrate the application's functionality, such as handling the OAuth 2.0 flow, interacting with the Redis cache, and communicating with external APIs like HubSpot.

* **`/dtos` (Data Transfer Objects)**: These are Pydantic models that define the shape of data for API requests and responses. They provide automatic data validation and serialization.

* **`/utils`**: Contains reusable utility modules.
    * `redis_client.py`: A wrapper for the Redis client, providing a consistent interface for cache operations.
    * `http_client.py`: A generic, reusable client for making external HTTP requests.

* **`/config`**: Holds application configuration, such as constants and logger settings.

### Frontend Structure

The frontend is a standard React application.

* **`/src/integrations`**: Contains the React components for each integration (Airtable, Notion, HubSpot). Each component is responsible for rendering the UI and triggering the authorization flow by redirecting the user to the backend.


