# Comfort Learning

A full-stack course marketplace web application where users can explore courses, add courses to a cart, create accounts, log in securely, and view their login history.

## 🚀 Live Demo

**Live Application:** https://comfort-learning.onrender.com

## 📌 Features

* Browse available courses
* Add and remove courses from the shopping cart
* Update course quantities
* User registration and login
* Secure password hashing using bcrypt
* Session-based authentication
* Login history tracking
* MongoDB database integration
* RESTful API endpoints
* Responsive and user-friendly interface

## 🛠️ Tech Stack

### Frontend

* HTML5
* CSS3
* JavaScript
* Fetch API

### Backend

* Node.js
* Express.js
* REST API
* Express Session

### Database

* MongoDB
* MongoDB Atlas
* Mongoose

### Authentication

* bcryptjs
* Express Session

### Deployment

* Render
* GitHub
* MongoDB Atlas

## 📂 Project Structure

```text
comfortlearning-fullstack-mongo/
├── data/
├── middleware/
├── models/
├── routes/
├── scripts/
├── public/
├── .env.example
├── .gitignore
├── db.js
├── package.json
├── package-lock.json
├── README.md
└── server.js
```

## 🔑 Main Functionality

### Course Management

Courses are stored in MongoDB and retrieved through backend API endpoints rather than being directly hardcoded into the frontend.

### Shopping Cart

Users can:

* Add courses to their cart
* Increase or decrease quantities
* Remove individual courses
* Clear the cart

Cart information is stored server-side using sessions and MongoDB.

### User Authentication

The application supports:

* User registration
* User login
* User logout
* Session-based authentication
* Password hashing with bcryptjs

Passwords are never stored as plain text.

### Login History

The application records login attempts and allows authenticated users to view their recent login history.

## 🔗 API Endpoints

### Courses & Cart

| Method | Endpoint        | Description                 |
| ------ | --------------- | --------------------------- |
| GET    | `/api/courses`  | Get all courses             |
| GET    | `/api/cart`     | Get the current user's cart |
| POST   | `/api/cart`     | Add a course to the cart    |
| PUT    | `/api/cart/:id` | Update course quantity      |
| DELETE | `/api/cart/:id` | Remove a course             |
| DELETE | `/api/cart`     | Clear the cart              |

### Authentication

| Method | Endpoint             | Description              |
| ------ | -------------------- | ------------------------ |
| POST   | `/api/auth/register` | Register a new user      |
| POST   | `/api/auth/login`    | Log in a user            |
| POST   | `/api/auth/logout`   | Log out the current user |
| GET    | `/api/auth/me`       | Get the current user     |
| GET    | `/api/auth/history`  | Get login history        |

## 💻 Run Locally

### 1. Clone the repository

```bash
git clone https://github.com/YerraboinaManeesha/comfort-learning.git
cd comfort-learning
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file in the project root:

```env
MONGODB_URI=your_mongodb_connection_string
SESSION_SECRET=your_session_secret
PORT=3000
```

**Do not upload `.env` to GitHub.**

### 4. Start the application

```bash
npm start
```

The application will be available at:

```text
http://localhost:3000
```

## ☁️ Deployment

The application is deployed using:

* **GitHub** — source code repository
* **Render** — backend hosting
* **MongoDB Atlas** — cloud database

Environment variables are configured securely through Render rather than being committed to the repository.

## 🎯 Future Improvements

* Payment gateway integration
* Course enrollment system
* User profile management
* Course search and filtering
* Admin dashboard
* Course reviews and ratings
* Improved production session storage

## 👩‍💻 Developer

**Yerraboina Maneesha**

Computer Science Postgraduate | Aspiring Full-Stack Developer

---

⭐ If you find this project useful, feel free to explore the repository and live demo.
