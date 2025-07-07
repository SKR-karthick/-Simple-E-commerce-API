# E-commerce API

A robust **Node.js** and **Express-based RESTful API** for an e-commerce platform, powered by **SQLite** using **Sequelize ORM**. This project includes core functionalities like product management, cart operations, order creation, and **role-based access control**, along with smart features such as **search** and **ID resequencing** after deletion.

---

## 🔑 Features

- **Product Management**  
  Add, update, delete, and list products with pagination. Includes search by name or category (case-insensitive, partial match).

- **ID Resequencing**  
  Automatically resequences product IDs after deletion to maintain a continuous sequence.

- **Role-Based Access**  
  JWT-based authentication with two roles:  
  - **Admin**: Full access to all product/cart/order routes  
  - **Customer**: Restricted access to cart and order-related routes

- **Cart and Order System**  
  Customers can manage cart items and place orders.

- **Search Functionality**  
  Search products by name or category using flexible, case-insensitive queries.

- **Deployment Ready**  
  Configured to deploy on platforms like **Render**.

---

## 🛠 Technologies Used

| Area          | Tech Stack                |
|---------------|---------------------------|
| Backend       | Node.js, Express          |
| Database      | SQLite, Sequelize ORM     |
| Authentication| JWT (jsonwebtoken), bcrypt|
| Testing Tool  | REST Client (VS Code)     |
| Deployment    | Render (recommended)      |

---

## 🚀 Getting Started

### ✅ Prerequisites

- **Node.js** (v14.x or later)
- **npm** (bundled with Node.js)
- **Git** (for cloning the repository)

---

### 📥 Installation

```bash
# Clone the repository
git clone https://github.com/your-username/ecommerce-api.git
cd ecommerce-api

# Install dependencies
npm install

JWT_SECRET=your-secure-secret-key-here
PORT=3000
DATABASE_URL=./ecommerce.db

🧪 Running the Server
bash
Copy
Edit
npm start
Server will start on:
📍 http://localhost:3000
