# FODYYY Backend API

A Node.js Express.js backend application with authentication, MongoDB integration, and comprehensive error handling.

## Features

- ✅ Express.js server setup
- ✅ MongoDB connection with Mongoose
- ✅ JWT authentication
- ✅ Password hashing with bcryptjs
- ✅ CORS configuration
- ✅ Environment variables support
- ✅ Error handling middleware
- ✅ User authentication routes
- ✅ Input validation
- ✅ Security best practices

## Prerequisites

- Node.js (v14 or higher)
- MongoDB Atlas account (recommended - free tier available) OR local MongoDB installation
- npm or yarn

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd FODYYY
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

4. Set up your database:

**Option A: MongoDB Atlas (Recommended - Free)**
- Follow the detailed guide in `MONGODB_SETUP.md`
- Get your connection string from MongoDB Atlas
- Update `.env` with your Atlas connection string

**Option B: Local MongoDB**
- Install MongoDB locally
- Use: `MONGODB_URI=mongodb://localhost:27017/fodyyy`

5. Update the `.env` file with your configuration:
```env
PORT=5000
NODE_ENV=development

# For MongoDB Atlas:
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/fodyyy?retryWrites=true&w=majority

# For Local MongoDB:
# MONGODB_URI=mongodb://localhost:27017/fodyyy

JWT_SECRET=your_very_long_and_secure_jwt_secret_key_at_least_32_characters
JWT_EXPIRE=30d
FRONTEND_URL=http://localhost:3000
BCRYPT_SALT_ROUNDS=12
```

## Running the Application

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

The server will start on `http://localhost:5000`

## API Endpoints

### Health Check
- **GET** `/api/health` - Check server status

### Authentication
- **POST** `/api/auth/register` - Register a new user
- **POST** `/api/auth/login` - Login user
- **GET** `/api/auth/me` - Get current user profile (Protected)

### Example Requests

#### Register User
```bash
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

#### Login User
```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

#### Get User Profile
```bash
GET /api/auth/me
Authorization: Bearer <jwt_token>
```

## Project Structure

```
FODYYY/
├── middleware/
│   ├── auth.js              # Authentication middleware
│   └── errorHandler.js      # Error handling middleware
├── models/
│   └── User.js              # User model
├── routes/
│   └── auth.js              # Authentication routes
├── utils/
│   ├── asyncHandler.js      # Async error handler
│   └── generateToken.js     # JWT token generator
├── .env                     # Environment variables
├── .env.example             # Environment variables example
├── .gitignore              # Git ignore file
├── package.json            # Package configuration
├── README.md               # Project documentation
└── server.js               # Main application file
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `5000` |
| `NODE_ENV` | Environment mode | `development` |
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/fodyyy` |
| `JWT_SECRET` | JWT secret key | Required |
| `JWT_EXPIRE` | JWT expiration time | `30d` |
| `FRONTEND_URL` | Frontend URL for CORS | `http://localhost:3000` |
| `BCRYPT_SALT_ROUNDS` | Bcrypt salt rounds | `12` |

## Security Features

- Password hashing with bcryptjs
- JWT token authentication
- CORS configuration
- Input validation and sanitization
- Error handling without exposing sensitive information
- Rate limiting ready (can be added)

## Database

The application uses MongoDB with Mongoose ODM. 

**Recommended Setup: MongoDB Atlas**
- Free tier available (512MB storage)
- No local installation required
- Automatic backups and scaling
- See `MONGODB_SETUP.md` for detailed setup instructions

**Alternative: Local MongoDB**
- Install MongoDB Community Edition locally
- Ensure MongoDB service is running
- Use connection string: `mongodb://localhost:27017/fodyyy`

### User Schema
- `name`: String (required, max 50 characters)
- `email`: String (required, unique, validated)
- `password`: String (required, min 6 characters, hashed)
- `role`: String (enum: 'user', 'admin', default: 'user')
- `isActive`: Boolean (default: true)
- `timestamps`: createdAt, updatedAt

## Error Handling

The application includes comprehensive error handling:
- Mongoose validation errors
- Duplicate key errors
- JWT errors
- Cast errors
- Custom error responses
- Development vs production error details

## Development

### Adding New Routes
1. Create route file in `routes/` directory
2. Add route to `server.js`
3. Create corresponding model in `models/` if needed
4. Add middleware in `middleware/` if needed

### Adding New Models
1. Create model file in `models/` directory
2. Define schema with validation
3. Add any pre/post hooks as needed

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

ISC License