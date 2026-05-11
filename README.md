# 🛍️ SHION HOUSE - E-Commerce Backend API

A robust and secure backend API for an e-commerce platform, built with Node.js, Express, and SQLite. This project implements a modern architectural pattern designed for scalability and maintainability.

## 🏗️ Architecture: The Controller-Route-Service Pattern
This project strictly follows the Separation of Concerns principle to ensure a clean and modular codebase:
- **Routes:** Directs incoming HTTP requests to the appropriate controllers.
- **Controllers:** Handles HTTP logic, extracts request payloads, and formats the final JSON responses.
- **Services (Business Logic & Gatekeeper):** The core "brain" of the app. It validates rules (e.g., checking if quantity > 0) and simulates microservice communications to verify product prices and user identities independently.
- **Repositories:** The only layer responsible for direct database interactions (SQLite), ensuring data integrity.

## 🔐 Security Features
- **Environment Sanitization:** Sensitive data (JWT Secrets, DB configurations) are securely managed using `dotenv`.
- **Input Validation:** Prevents bad data and potential injections at the Service layer.
- **Error Handling:** Implements the "Two-Face" pattern to log detailed errors internally while returning safe, generic error messages to the client.

## 🚀 Quick Start (Setup Instructions)

**1. Clone the repository:**
\`\`\`bash
git clone https://github.com/yourusername/shion-house-api.git
cd shion-house-api
\`\`\`

**2. Install dependencies:**
\`\`\`bash
npm install
\`\`\`

**3. Configure Environment Variables:**
Create a `.env` file in the root directory and add the following:
\`\`\`env
PORT=3000
JWT_SECRET=your_jwt_secret_here
\`\`\`

**4. Run the server:**
\`\`\`bash
npm start
\`\`\`
*The server will start on http://localhost:3000 and automatically initialize the SQLite database.*
