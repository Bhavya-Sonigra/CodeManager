# Code Manager

A full-stack web application for managing coding problems and test cases.

## Project Structure

```
CODE_MANAGER/
├── frontend/         # React frontend application
└── backend/         # Express.js backend application
```

## Backend

The backend is built with:
- Express.js
- Supabase
- Express Validator
- CORS and Helmet for security

### Setup
1. Navigate to backend directory: `cd backend`
2. Install dependencies: `npm install`
3. Create `.env` file with your Supabase credentials
4. Run development server: `npm run dev`

## Frontend

The frontend is built with:
- React
- Supabase Client
- React Router
- Material-UI

### Setup
1. Navigate to frontend directory: `cd frontend`
2. Install dependencies: `npm install`
3. Run development server: `npm start`

## Features

- Create, read, update, and delete coding problems
- Manage test cases for each problem
- Validate total points distribution
- Modern and responsive UI
- Secure API endpoints
