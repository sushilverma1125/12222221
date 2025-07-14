# URL Shortener - Full Stack Project

## Overview  
This project implements a URL Shortener microservice with analytics and a React frontend. It features mandatory logging middleware integration, a robust API, and a user-friendly UI.

## Project Structure
- `/loggingMiddleware` — Custom logging middleware for frontend and backend.
- `/backend` — Express + TypeScript backend microservice with URL shortening and analytics APIs.
- `/frontend` — React + Material UI frontend to shorten URLs and view stats.

## Features
- Shorten URLs with optional custom shortcodes and expiry times.
- Redirect shortened URLs to original URLs.
- View detailed usage statistics for each short link.
- Extensive logging via centralized middleware (no console logs).
- Client-side input validation in React app.
- Responsive UI with Material UI.

## Setup & Run

### Backend
```bash
cd backend
npm install
npm run dev
```
Runs backend on http://localhost:5000

### Frontend
```bash
cd frontend
npm install
npm start
```
Runs frontend on http://localhost:3000
