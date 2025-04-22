# Vibely - Frontend

Welcome to the frontend of **Vibely**, a modern web application built using ReactJS and Vite. This repository contains the source code for the frontend of our project. Vibely is designed to deliver a seamless user experience by leveraging the latest technologies and tools in web development.

---

## Key Features

### 1. **Dynamic Routing with React Router**
- Implements dynamic routing to create a smooth navigation experience.
- Enables users to transition between different pages without reloading the application.

### 2. **State Management with React Context**
- Centralized state management system for maintaining application state.
- Simplifies data sharing between components.

### 3. **Component Design with Ant Design (Antd)**
- Utilizes **Ant Design (Antd)** for building elegant and reusable UI components.
- Includes components like:
    - Tags
    - Messages
    - Modals
    - And more!

### 4. **Styling with TailwindCSS**
- Provides a utility-first CSS framework for customizable and responsive styling.
- Ensures a consistent and visually appealing design.

### 5. **Icons with Heroicons**
- Integrates **Heroicons**, a collection of beautifully designed icons, for enhancing the UI/UX.

### 6. **API Calls with Axios**
- Handles all API interactions using **Axios**, a promise-based HTTP client.
- Simplifies data fetching and integration with backend services.

---

## Project Setup

### Prerequisites
- Node.js (>= 14.x)
- npm or yarn package manager

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/mehroj-r/webdev_project2.git
   cd webdev_project2
   ```

2. Navigate to the frontend directory (if applicable):
   ```bash
   cd frontend
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open your browser and navigate to:
   ```
   http://localhost:5173
   ```

---

## Project Structure

```
frontend/
├── public/          # Static assets
├── src/
│   ├── components/  # Reusable components
│   ├── context/     # React Context for state management
│   ├── pages/       # Application pages
│   ├── routes/      # Routing configuration
│   ├── styles/      # TailwindCSS and global styles
│   ├── utils/       # Utility functions
│   └── App.jsx      # Main application component
├── package.json     # Project configuration and dependencies
└── vite.config.js   # Vite configuration
```

---

## Technologies Used

- **ReactJS**: A JavaScript library for building user interfaces.
- **Vite**: A fast build tool and development server.
- **React Router**: For client-side routing.
- **React Context**: For state management.
- **Ant Design (Antd)**: For UI components.
- **TailwindCSS**: For styling.
- **Heroicons**: For icons.
- **Axios**: For making API requests.

---