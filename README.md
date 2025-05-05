# 🏠 RoomRent Marketplace

<div align="center">
  <img src="https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB"/>
  <img src="https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express"/>
  <img src="https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React"/>
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js"/>
  <img src="https://img.shields.io/badge/Bootstrap-7952B3?style=for-the-badge&logo=bootstrap&logoColor=white" alt="Bootstrap"/>
  <img src="https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=JSON%20web%20tokens&logoColor=white" alt="JWT"/>
</div>

<p align="center">
  A feature-rich real estate marketplace built with the MERN stack that connects property seekers with agents through an intuitive and responsive interface.
</p>

---

## ✨ Features

- **👥 Multi-Role System**
  - Admin: Complete system oversight and management
  - Agent: Property listing and management capabilities
  - User: Browse listings and contact agents

- **🏘️ Property Management**
  - List new properties with detailed information
  - Upload multiple high-quality images
  - Edit and update property details
  - Remove outdated listings

- **🔍 Search & Discovery**
  - Advanced filtering options
  - Location-based search
  - Price range selection
  - Property type categorization

- **👨‍💼 Agent Dashboard**
  - Manage personal property listings
  - Track user inquiries
  - Update profile and credentials

- **🛡️ Security**
  - JWT-based authentication
  - Role-based access control
  - Secure API endpoints

- **📱 Responsive Design**
  - Seamless experience across devices
  - Mobile-optimized interface

---

## 🖼️ Screenshots

<div align="center">
  <p><i>Coming soon!</i></p>
</div>

---

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or newer)
- MongoDB
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/MdSaad09/roomrent-marketplace.git
   cd roomrent-marketplace
   ```

2. **Install dependencies**
   ```bash
   # Install backend dependencies
   npm install
   
   # Install frontend dependencies
   cd frontend
   npm install
   cd ..
   ```

3. **Environment Setup**
   ```bash
   # Create .env file in the root directory with the following variables
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   PORT=5000
   ```

4. **Start the application**
   ```bash
   # Run backend and frontend concurrently
   npm run dev
   
   # Or run them separately
   npm run server
   npm run client
   ```

5. **Access the application**
   ```
   Frontend: http://localhost:3000
   Backend API: http://localhost:5000
   ```

---

## 🛠️ Tech Stack

### Frontend
- React.js with Hooks and Context API
- React Router for navigation
- Bootstrap for responsive styling
- Axios for API requests

### Backend
- Node.js runtime environment
- Express.js framework
- MongoDB for database
- JWT for authentication
- Middleware for request processing

---

## 📝 Project Structure

```
roomrent-marketplace/
├── backend/           # Server-side code
│   ├── controllers/   # Request handlers
│   ├── middleware/    # Custom middleware functions
│   ├── models/        # MongoDB models
│   ├── routes/        # API route definitions
│   ├── utils/         # Helper functions
│   └── server.js      # Main server file
├── frontend/          # Client-side code
│   ├── public/        # Static files
│   └── src/
│       ├── components/# Reusable UI components
│       ├── context/   # React Context for state management
│       ├── pages/     # Main application pages
│       ├── services/  # API service integrations
│       ├── utils/     # Helper functions
│       └── App.js     # Main React component
├── .env               # Environment variables
├── .gitignore         # Git ignore rules
├── package.json       # Project dependencies and scripts
└── README.md          # Project documentation

```
## 🔍 API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile

### Properties
- `GET /api/properties` - Get all properties
- `GET /api/properties/:id` - Get property details
- `POST /api/properties` - Create new property (agent only)
- `PUT /api/properties/:id` - Update property (owner agent only)
- `DELETE /api/properties/:id` - Delete property (owner agent only)

### Users
- `GET /api/users` - Get all users (admin only)
- `PUT /api/users/:id` - Update user (admin or self)
- `DELETE /api/users/:id` - Delete user (admin only)

---

## 📋 Future Enhancements

- [ ] Integrated payment system
- [ ] In-app messaging between users and agents
- [ ] Property favorites and watchlist
- [ ] Email notifications
- [ ] Advanced search with more filters
- [ ] User reviews and ratings
- [ ] Virtual property tours

---

## 👥 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 📞 Contact

Mohammad Saad - [@MdSaad09](https://github.com/MdSaad09)

Project Link: [https://github.com/MdSaad09/roomrent-marketplace](https://github.com/MdSaad09/roomrent-marketplace)

---

<p align="center">
  Made with ❤️ by Mohammad Saad
</p>
