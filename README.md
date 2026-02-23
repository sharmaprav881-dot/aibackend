# AI Interview Platform - MERN Stack

A complete production-ready AI-powered interview platform built with MERN stack. Users can register, login, take AI-generated interviews, and receive automated evaluations with scores and feedback.

## 🚀 Features

- **User Authentication**: JWT-based authentication with secure password hashing
- **AI-Powered Interviews**: Generate interview questions using OpenAI or Google Gemini API
- **Automated Evaluation**: AI evaluates answers and provides scores with detailed feedback
- **Interview History**: View past interview results and scores
- **Multiple Tech Stacks**: Support for React, Node.js, MERN, and DSA
- **Experience Levels**: Fresher, 2-3 Years, and Senior levels
- **Modern UI**: Beautiful, responsive design with Tailwind CSS

## 📁 Project Structure

```
Ai interview/
├── backend/
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   └── interview.controller.js
│   ├── routes/
│   │   ├── auth.routes.js
│   │   └── interview.routes.js
│   ├── models/
│   │   ├── user.model.js
│   │   └── interview.model.js
│   ├── middleware/
│   │   ├── auth.middleware.js
│   │   └── error.middleware.js
│   ├── services/
│   │   └── ai.service.js
│   ├── utils/
│   │   └── generateToken.js
│   ├── app.js
│   ├── server.js
│   ├── package.json
│   └── .env.example
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── Button.jsx
    │   │   ├── Input.jsx
    │   │   ├── Card.jsx
    │   │   └── ProtectedRoute.jsx
    │   ├── pages/
    │   │   ├── Login.jsx
    │   │   ├── Register.jsx
    │   │   ├── Dashboard.jsx
    │   │   └── Interview.jsx
    │   ├── services/
    │   │   ├── auth.service.js
    │   │   └── interview.service.js
    │   ├── context/
    │   │   └── AuthContext.jsx
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css
    ├── package.json
    ├── vite.config.js
    ├── tailwind.config.js
    └── index.html
```

## 🛠️ Tech Stack

### Backend
- Node.js
- Express.js
- MongoDB (Mongoose)
- JWT Authentication
- Bcrypt
- OpenAI/Gemini API
- MVC Architecture

### Frontend
- React (Vite)
- Tailwind CSS
- React Router
- Axios
- Context API

## 📦 Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or MongoDB Atlas)
- OpenAI API key OR Google Gemini API key

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file (copy from `.env.example`):
```bash
cp .env.example .env
```

4. Update `.env` with your configuration:
```env
MONGO_URI=mongodb://localhost:27017/ai-interview
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
OPENAI_API_KEY=your_openai_api_key_here
# OR use Gemini:
# GEMINI_API_KEY=your_gemini_api_key_here
PORT=5000
FRONTEND_URL=http://localhost:5173
```

5. Start MongoDB (if running locally):
```bash
# Windows
mongod

# macOS/Linux
sudo systemctl start mongod
```

6. Start the backend server:
```bash
# Development mode
npm run dev

# Production mode
npm start
```

Backend will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file (optional, defaults are set):
```env
VITE_API_URL=http://localhost:5000/api
```

4. Start the development server:
```bash
npm run dev
```

Frontend will run on `http://localhost:5173`

## 🔑 API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user

### Interviews
- `POST /api/interview/create` - Create a new interview (Protected)
- `POST /api/interview/submit` - Submit interview answers (Protected)
- `GET /api/interview/history` - Get user's interview history (Protected)

## 📝 Usage

1. **Register/Login**: Create an account or login with existing credentials
2. **Start Interview**: Click "Start New Interview" on the dashboard
3. **Select Preferences**: Choose tech stack (React/Node/MERN/DSA) and experience level
4. **Answer Questions**: AI generates questions based on your selections
5. **Submit Answers**: Submit your answers for evaluation
6. **View Results**: Get instant scores and detailed feedback for each answer
7. **View History**: Check your interview history on the dashboard

## 🔒 Security Features

- Password hashing with bcrypt
- JWT token-based authentication
- Protected routes on frontend and backend
- Input validation and sanitization
- CORS configuration
- Environment variables for sensitive data

## 🤖 AI Integration

The platform supports both OpenAI and Google Gemini APIs:

- **OpenAI**: Uses GPT-3.5-turbo for question generation and evaluation
- **Google Gemini**: Uses Gemini Pro model as an alternative
- **Fallback**: Mock questions and evaluation if no API key is configured

### Getting API Keys

1. **OpenAI**: Sign up at https://platform.openai.com/
2. **Google Gemini**: Get API key from https://makersuite.google.com/app/apikey

## 🎨 Features in Detail

### Interview Flow
1. User selects tech stack and experience level
2. Backend calls AI service to generate 5 relevant questions
3. Questions are displayed to the user
4. User submits answers
5. Each answer is evaluated by AI
6. Scores and feedback are calculated and stored
7. Results are displayed to the user

### Dashboard
- View all past interviews
- See scores and status
- Quick access to start new interviews
- Interview history with timestamps

## 🐛 Troubleshooting

### MongoDB Connection Issues
- Ensure MongoDB is running
- Check `MONGO_URI` in `.env` file
- For MongoDB Atlas, use connection string format: `mongodb+srv://username:password@cluster.mongodb.net/dbname`

### API Key Issues
- Ensure API key is correctly set in `.env`
- Check API key has sufficient credits/quota
- Platform will use mock data if API key is invalid

### CORS Issues
- Ensure `FRONTEND_URL` in backend `.env` matches frontend URL
- Check browser console for CORS errors

## 📄 License

ISC

## 👨‍💻 Development

### Backend Development
- Uses nodemon for auto-reload in development
- Error handling middleware for centralized error management
- MVC architecture for clean code organization

### Frontend Development
- Vite for fast development and building
- Tailwind CSS for styling
- Context API for state management
- Protected routes for authentication

## 🚀 Production Deployment

1. Set `NODE_ENV=production` in backend `.env`
2. Build frontend: `cd frontend && npm run build`
3. Serve frontend build with a static server or integrate with backend
4. Use environment variables for all sensitive data
5. Enable HTTPS
6. Set up proper MongoDB connection (Atlas recommended)
7. Configure CORS for production domain

## 📞 Support

For issues or questions, please check:
- MongoDB connection
- API key configuration
- Environment variables
- Console logs for errors

---

Built with ❤️ using MERN Stack
