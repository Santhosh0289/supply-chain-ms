# 🚀 Supply Chain Management System

![React](https://img.shields.io/badge/Frontend-React-blue)
![FastAPI](https://img.shields.io/badge/Backend-FastAPI-green)
![MongoDB](https://img.shields.io/badge/Database-MongoDB-brightgreen)
![License](https://img.shields.io/badge/License-MIT-yellow)

A full-stack E-Commerce Supply Chain Management System designed to streamline and optimize product flow from procurement to delivery with real-time tracking, analytics, and role-based access.

---

## 📌 Overview

This application helps businesses efficiently manage:
- Supplier procurement  
- Inventory across warehouses  
- Order lifecycle  
- Shipment and logistics  

Built with modern technologies focusing on scalability, performance, and security.

---

## 🛠️ Tech Stack

Frontend: React (Vite)  
Backend: FastAPI  
Database: MongoDB  
Authentication: JWT  

---

## ⚙️ Core Features

Supplier & Procurement  
- Supplier management  
- Purchase order tracking  

Inventory Management  
- Real-time stock updates  
- Multi-warehouse support  

Order Processing  
- Order lifecycle tracking  

Shipment & Logistics  
- Delivery tracking  
- Returns handling  

Analytics Dashboard  
- KPI insights  
- Performance metrics  

User Management  
- JWT authentication  
- Role-based access  

---

## 📁 Project Structure

supply-chain-ms/  
├── frontend/        React (Vite) app  
├── backend/         FastAPI app  
├── README.md  
└── .gitignore  

---

# 🚀 Getting Started

## 🔹 1. Clone Repository

git clone https://github.com/Santhosh0289/supply-chain-ms.git  
cd supply-chain-ms  

---

## 🔹 2. Backend Setup (FastAPI)

cd backend  

# create virtual environment  
python -m venv venv  

# activate  
venv\Scripts\activate  

# install dependencies  
pip install -r requirements.txt  

# run server  
uvicorn main:app --reload  

Backend will run at:  
http://127.0.0.1:8000  

API Docs:  
http://127.0.0.1:8000/docs  

---

## 🔹 3. Frontend Setup (React + Vite)

cd frontend  

# install dependencies  
npm install  
npm install axios react-router-dom react-toastify recharts lucide-react

# start development server  
npm run dev  

Frontend will run at:  
http://localhost:5173  

---

## 🔐 Environment Variables (.env)

Create a `.env` file inside **backend/**:

Example:

MONGO_URI=your_mongodb_connection_string  
SECRET_KEY=your_secret_key  
ALGORITHM=HS256  
ACCESS_TOKEN_EXPIRE_MINUTES=30  

---

### 📌 Explanation

MONGO_URI → MongoDB connection string  
SECRET_KEY → used for JWT authentication  
ALGORITHM → encryption algorithm (HS256 recommended)  
ACCESS_TOKEN_EXPIRE_MINUTES → token expiry time  

---

## 📊 API Documentation

http://127.0.0.1:8000/docs  

---

## 📸 Screenshots

##Login Page

<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/a2f709e6-3800-4a35-b003-8d56283748a0" />


##Dashboard UI  

<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/d3ba8c27-c17a-4b92-91a2-f3cae002175f" />

---

## 🎯 Future Enhancements

- AI demand forecasting  
- Real-time tracking with maps  
- Microservices architecture  
- Docker deployment  

---

## 🤝 Contributing

Contributions are welcome. Feel free to fork and submit pull requests.

---

## 📄 License

MIT License  

---

## 👨‍💻 Author

Santhosh S
