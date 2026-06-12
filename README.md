# 🚀 EduNav

<div align="left">
  <img src="https://img.shields.io/badge/License-Apache%202.0-blue.svg" alt="License">
  <img src="https://img.shields.io/badge/Version-1.0.0-success.svg" alt="Version">
  <img src="https://img.shields.io/badge/Platform-Windows%20%7C%20Web-lightgrey.svg" alt="Platform">
</div>

---

## 📋 Table of Contents

- [Description](#-description)
- [Demo Video](#-demo-video)
- [Features](#-features)
- [User Journey](#-user-journey)
- [Project Structure](#-project-structure)
- [Built With](#-built-with)
- [Installation & Setup](#-installation--setup)

---

## 📚 Description

**EduNav** (powered by PathFinder AI) is an intelligent career and study assistant that empowers job seekers and students. It uses advanced Generative AI to analyze your resume, build custom learning roadmaps, generate dynamic mock interview questions tailored to your exact target role, and automatically formulate smart quizzes from your study notes. Whether you're upskilling or preparing for the big interview, EduNav guides you every step of the way.

---

## 🎥 Demo Video

See EduNav in Action!

📺 **[Watch Demo Video](#)** *(Coming soon)*

*Experience the power of semantic resume matching, dynamic roadmap generation, and AI-driven mock interviews.*

---

## ✨ Features

- 📄 **Resume Parsing:** Deep extraction of skills, experience, and domain knowledge from uploaded resumes using ATS logic.
- 🗺️ **Dynamic Roadmaps:** Generates step-by-step personalized learning roadmaps based on your current skill level and time commitment.
- 💼 **AI Mock Interviews:** Tailored technical, behavioral, and system design questions based on your specific job title and focus topic.
- 🧠 **Smart AI Quizzer:** Automatically formulates multiple-choice quizzes (up to 30 questions) directly from your saved study notes.
- 🤖 **PathFinder AI Chatbot:** An integrated conversational assistant to help you navigate your goals and find resources.
- 💻 **Desktop Experience:** Fast, native Windows experience powered by Electron and Vite.

---

## 🗺️ User Journey

**Upload Resume → ATS Skills Verification → Define Target Role → Generate Learning Roadmap → Practice with AI Mock Interviews**

The journey transforms the job preparation process from a guessing game into a structured science. Users upload their resume, instantly see how an ATS interprets their profile, and then launch a tailored roadmap. The system allows users to practice for interviews by generating highly specific questions based on their target job title and chosen topic.

---

## 📁 Project Structure

```text
EduNav/
├── 🎨 goal-navigator-frontend/   # React Application (Vite + Tailwind)
│   ├── src/components/           # Reusable UI components
│   ├── src/pages/                # Dashboard, Interview, Roadmap pages
│   ├── src/services/             # API integration
│   ├── dist-electron/            # Compiled Windows Executable (.exe)
│   └── electron-main.js          # Electron Desktop Wrapper
└── ⚙️ goal-navigator-backend/    # Node.js Server (Express)
    ├── index.js                  # Main REST Endpoints & AI Orchestration
    ├── prisma/                   # SQLite Database Schemas
    └── .env                      # Gemini API Keys and Secrets
```

---

## 🛠️ Built With

Here are the major tools and technologies used to build EduNav:

### ⚙️ Backend & AI
![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white) ![Express](https://img.shields.io/badge/Express.js-404D59?style=for-the-badge) ![Prisma](https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white) ![SQLite](https://img.shields.io/badge/SQLite-07405E?style=for-the-badge&logo=sqlite&logoColor=white) ![Gemini](https://img.shields.io/badge/Google_Gemini-8E75B2?style=for-the-badge&logo=google&logoColor=white)

### 🎨 Frontend & Desktop
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB) ![Vite](https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD62E) ![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white) ![Electron](https://img.shields.io/badge/Electron-191970?style=for-the-badge&logo=Electron&logoColor=white)

---

## 📦 Installation & Setup

You can run EduNav in two ways:

### Option A: Download the Desktop App (Easiest) 🚀

Simply download the latest release for Windows. No coding or installation required.

1. Go to the **[Releases Page](#)**.
2. Download `EduNav-Windows.zip`.
3. Extract the folder and double-click `EduNav.exe`.

### Option B: Run from Source (For Developers) 💻

If you want to modify the code:

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Adityarade/EduNav.git
   ```

2. **Setup the Backend:**
   ```bash
   cd goal-navigator-backend
   npm install
   # Create a .env file and add: GEMINI_API_KEY="your_api_key_here"
   node index.js
   ```

3. **Setup the Frontend & Electron:**
   ```bash
   cd ../goal-navigator-frontend
   npm install
   npm run dev      # Run in browser
   # OR
   npm run dist     # Build Electron App
   ```
