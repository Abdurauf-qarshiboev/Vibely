# Vibely - Project 2  [SE201]

Vibely is a social media web application built with a modern tech stack featuring Spring Boot for the backend and ReactJS for the frontend.

![Vibely Logo](assets/vibely.png)

## 🌟 Overview

Vibely allows users to connect, share moments, and interact in a vibrant online community. This project demonstrates full-stack development capabilities with a responsive design and robust backend services.

---

**Project Duration:** March 23rd - April 22nd, 2025 [~4 weeks]  
**Team Size:** 5 members  
**Version Control:** GitHub  
**Deadline:** April 22nd, 2025 (23:59:59)

---

### 👥 Team Members & Roles
1. **Project Manager:** Mehroj Majidov
    - Overseeing project timeline and team coordination
    - Maintaining documentation (.docx and .md formats)
    - Implementing task tracking features

2. **Frontend Developer:** Abdurauf Qarshiboyev
    - Building responsive UI components
    - Implementing JavaScript functionality
    - Ensuring cross-browser compatibility

3. **UI/UX Designer:** Nozimjon Olimjonov
    - Creating wireframes and mockups in Figma
    - Designing user-friendly interfaces
    - Maintaining usability of user interface

4. **Backend developer:** Ollayorbek Masharipov
    - Developing and maintaining server-side logic
    - Implementing APIs to serve dynamic content on Uzbekistan tourism
    - Ensuring smooth integration with frontend components

5. **Backend Developer:** Dilnur Aliqulov
    - Writing and executing automated tests for backend services
    - Debugging and resolving backend-related issues
    - Assisting with database design and performance optimization


## 🎯 Project Objectives

- Create an intuitive platform for tourists planning trips to Uzbekistan
- Provide comprehensive information about Uzbekistan's cities and attractions
- Implement interactive features for customized trip planning
- Deliver a bug-free, user-friendly experience
- Build a vibrant community of travelers sharing Uzbekistan experiences

## 🌐 Features

- User authentication and profile management
- Post creation with media support
- Social interactions (likes, comments, shares)
- Notifications
- Responsive design

---

## 🔧 Tech Stack

### **Frontend:**
- ReactJS
- JavaScript
- HTML5
- CSS3
- Responsive design

---

### **Backend:**
- Spring Boot (Java)
- RESTful API architecture
- JWT authentication
- Database integration

---

### **Tools:**
- Git/GitHub for version control
- VS Code for development
- Figma for design mockups
- Trello/Jira for task management

---

## ⚙️ Installation

### Prerequisites
- Node.js (v16+)
- npm
- Java 21+
- Maven

---

### Setup and Running

#### Backend

1.  Clone the repository
    ```bash
    git clone https://github.com/mehroj-r/webdev_project2.git`
    ```
2.  Navigate to the backend folder:
    ```bash
    cd webdev_project2/backend
    ```
3. Docker compose init
    ```bash
    docker-compose up
    ```

---

#### Frontend

1.  Clone the repository
    ```bash
    git clone https://github.com/mehroj-r/webdev_project2.git`
    ```
2.  Navigate to the frontend folder:
    ```bash
    cd webdev_project2/frontend
    ```
3. Install dependencies
    ```bash
    npm install
    ```
4. Start development server
    ```bash
    npm run dev
    ```

---

## Project Structure

```
webdev_project2/
├── backend/              # Spring Boot backend
│   ├── src/             
│   │   ├── main/        
│   │   │   ├── java/    # Java source files
│   │   │   └── resources/ # Configuration files
│   │   └── test/        # Test files
├── frontend/             # ReactJS frontend
│   ├── public/          # Static files
│   ├── src/             # React components and logic
│   │   ├── components/  # UI components
│   │   ├── pages/       # Page components
│   │   ├── services/    # API services
│   │   └── styles/      # CSS styles
```

---

## API Documentation

The backend provides RESTful APIs for:
- User management
- Content creation and interaction
- Media handling
- Messaging
- Notifications

For detailed API documentation: [Here](docs/APIDocs.md)

---

### 📊 GitHub Workflow
1. **Branch Strategy:**
    - `main`: Production-ready code (PM only access)
    - `frontend`: Frontend dedicated branch
    - `backend`: Backend dedicated branch
    - Feature branches: `feature/feature-name`
    - Specific page branches: `page/page-name`
    - Fix bug branches: `fix/bug-info`

2. **Commit Guidelines:**
    - Daily commits required from each team member (if their role requires it)
    - Commit messages must be descriptive and self explanatory
    - Example: `Fixed slow animation when progessively loading components`
3. **Auto Deployment:**
    - Any change to `backend` branch is auto-deployed by Github Actions
    - Failed deployments are reverted
    - Maintainer is notified of the failed deployment (via email)

---

### 🧪 Testing Strategy
- **Unit Testing:** Individual components and functions
- **Cross-browser Testing:** Chrome, Firefox, Safari, Edge
- **User Testing:** Conducted with sample users in final week

---

### 📝 Meeting Schedule
- **Daily Meetings:** 9:00-9:30 PM (every other day if needed)
- **Weekly Review:** Saturdays, 9:00-10:00 PM (extended review)

---

### 📈 Performance Metrics
- Page load time under 3 seconds
- Accessibility score above 90%
- Cross-browser compatibility across latest versions of major browsers

---

*This documentation is maintained by Mehroj Majidov (Project Manager).  
Last updated: April 22, 2025.*

*SE201 - Web Development Project - Spring 2025*