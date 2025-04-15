# Calendar ToDo List Application

A web-based ToDoList application with calendar integration, built with React, Node.js, Express, and MongoDB.

## Features

- Create, read, update, and delete tasks
- Calendar integration for task due dates
- Mark tasks as completed
- Responsive design
- Modern Material-UI interface

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- npm or yarn

## Setup

1. Clone the repository
2. Install backend dependencies:
   ```bash
   npm install
   ```
3. Install frontend dependencies:
   ```bash
   cd client
   npm install
   cd ..
   ```

## Configuration

1. Create a `.env` file in the root directory with the following content:
   ```
   MONGODB_URI=mongodb://localhost:27017/todo-calendar
   PORT=5000
   ```

   If using MongoDB Atlas, replace the URI with your Atlas connection string.

## Running the Application

1. Start the backend server:
   ```bash
   npm run dev
   ```

2. In a new terminal, start the frontend:
   ```bash
   npm run client
   ```

3. Open your browser and navigate to `http://localhost:3000`

## Development

- Backend runs on `http://localhost:5000`
- Frontend runs on `http://localhost:3000`
- API endpoints:
  - GET `/api/tasks` - Get all tasks
  - POST `/api/tasks` - Create a new task
  - PUT `/api/tasks/:id` - Update a task
  - DELETE `/api/tasks/:id` - Delete a task

## Technologies Used

- Frontend:
  - React
  - Material-UI
  - Axios
  - Date-fns

- Backend:
  - Node.js
  - Express
  - MongoDB
  - Mongoose 