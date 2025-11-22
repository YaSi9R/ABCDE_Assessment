# ShopCart - E-Commerce Shopping Cart Application

A production-ready full-stack e-commerce application with user authentication, shopping cart management, and order processing.

## Project Structure

### Frontend (Next.js + React)
- **Location**: `./` (this directory)
- **Tech Stack**: Next.js 16, React 19, TypeScript, Tailwind CSS
- **Features**:
  - User authentication (signup/login)
  - Browse items
  - Add items to cart
  - View cart
  - Checkout
  - Order history

### Backend (Go + Gin + GORM)
- **Location**: Separate repository
- **Tech Stack**: Go, Gin framework, GORM ORM, SQLite/PostgreSQL
- **Features**:
  - User management (signup, login, token-based auth)
  - Item management
  - Cart management (one cart per user)
  - Order management

## Features

### 1. User Authentication
- **Signup**: Create a new user account with username and password
- **Login**: Authenticate user and receive a JWT token
- **Single Token**: Only one active token per user at a time
- **Token Storage**: JWT stored in localStorage

### 2. Shopping Features
- **Browse Items**: View all available items with name, description, and price
- **Add to Cart**: Add items to shopping cart
- **Cart Management**: View cart items, quantities, and total
- **Checkout**: Convert cart to order

### 3. Order Management
- **Place Orders**: Convert cart items to orders
- **Order History**: View all placed orders
- **Order Details**: See order IDs and timestamps

## Setup Instructions

### Frontend Setup

1. **Install dependencies**:
   \`\`\`bash
   npm install
   \`\`\`

2. **Configure environment variables**:
   Create `.env.local` file:
   \`\`\`
   NEXT_PUBLIC_API_URL=http://localhost:8080
   \`\`\`

3. **Run development server**:
   \`\`\`bash
   npm run dev
   \`\`\`
   Visit: `http://localhost:3000`

4. **Build for production**:
   \`\`\`bash
   npm run build
   npm start
   \`\`\`

### Backend Setup

1. **Install Go** (v1.21 or higher)

2. **Create backend directory structure**:
   \`\`\`
   shopcart-backend/
   ├── main.go
   ├── models/
   │   ├── user.go
   │   ├── item.go
   │   ├── cart.go
   │   └── order.go
   ├── handlers/
   │   ├── users.go
   │   ├── items.go
   │   ├── carts.go
   │   └── orders.go
   ├── middleware/
   │   └── auth.go
   ├── go.mod
   └── go.sum
   \`\`\`

3. **Initialize Go module**:
   \`\`\`bash
   go mod init shopcart-backend
   \`\`\`

4. **Install dependencies**:
   \`\`\`bash
   go get -u github.com/gin-gonic/gin
   go get -u gorm.io/gorm
   go get -u gorm.io/driver/sqlite
   go get -u github.com/golang-jwt/jwt/v5
   go get -u golang.org/x/crypto
   \`\`\`

5. **Create database schema** (SQLite):
   - Users table with username, password_hash
   - Items table with name, description, price
   - Carts table with user_id, status
   - CartItems table with cart_id, item_id, quantity
   - Orders table with user_id, status, total_amount
   - OrderItems table with order_id, item_id, quantity, price

6. **Run backend**:
   \`\`\`bash
   go run main.go
   \`\`\`
   Server runs on: `http://localhost:8080`

## API Endpoints

### User Endpoints
- `POST /users` - Create new user (signup)
- `GET /users` - List all users
- `POST /users/login` - Login and get token

### Item Endpoints
- `POST /items` - Create item (admin)
- `GET /items` - List all items

### Cart Endpoints
- `POST /carts/` - Add item to cart (requires auth token)
- `GET /carts` - Get user's cart (requires auth token)

### Order Endpoints
- `POST /orders` - Create order from cart (requires auth token)
- `GET /orders` - Get user's orders (requires auth token)

## Authentication

### Token Format
- JWT token sent in `Authorization` header as `Bearer <token>`
- Token includes user_id in claims
- Token valid for 24 hours (customizable)

### Protected Endpoints
All cart and order endpoints require valid JWT token in header:
\`\`\`
Authorization: Bearer <token>
\`\`\`

## Database Schema

### Users
\`\`\`sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
\`\`\`

### Items
\`\`\`sql
CREATE TABLE items (
  id INTEGER PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
\`\`\`

### Carts
\`\`\`sql
CREATE TABLE carts (
  id INTEGER PRIMARY KEY,
  user_id INTEGER NOT NULL UNIQUE,
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(user_id) REFERENCES users(id)
);
\`\`\`

### CartItems
\`\`\`sql
CREATE TABLE cart_items (
  id INTEGER PRIMARY KEY,
  cart_id INTEGER NOT NULL,
  item_id INTEGER NOT NULL,
  quantity INTEGER DEFAULT 1,
  FOREIGN KEY(cart_id) REFERENCES carts(id),
  FOREIGN KEY(item_id) REFERENCES items(id)
);
\`\`\`

### Orders
\`\`\`sql
CREATE TABLE orders (
  id INTEGER PRIMARY KEY,
  user_id INTEGER NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  total_amount DECIMAL(10, 2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(user_id) REFERENCES users(id)
);
\`\`\`

### OrderItems
\`\`\`sql
CREATE TABLE order_items (
  id INTEGER PRIMARY KEY,
  order_id INTEGER NOT NULL,
  item_id INTEGER NOT NULL,
  quantity INTEGER,
  price DECIMAL(10, 2),
  FOREIGN KEY(order_id) REFERENCES orders(id),
  FOREIGN KEY(item_id) REFERENCES items(id)
);
\`\`\`

## Testing

### Test User Flow
1. **Signup**: Create account with username/password
2. **Login**: Login to receive token
3. **Browse**: View available items
4. **Add to Cart**: Add 2-3 items
5. **Checkout**: Place order
6. **Order History**: View placed order

### Using Postman
See `POSTMAN_COLLECTION.json` for complete API test collection.

## Deployment

### Frontend Deployment (Vercel)
\`\`\`bash
npm run build
vercel deploy
\`\`\`

### Backend Deployment (Railway/Render/Heroku)
1. Create backend repository
2. Deploy with Docker:
   \`\`\`dockerfile
   FROM golang:1.21-alpine
   WORKDIR /app
   COPY . .
   RUN go build -o main main.go
   EXPOSE 8080
   CMD ["./main"]
   \`\`\`

## Production Checklist

- [ ] Environment variables configured
- [ ] Database migrations run
- [ ] CORS enabled for frontend domain
- [ ] JWT secret key configured
- [ ] Password hashing implemented
- [ ] Error handling and logging
- [ ] Rate limiting configured
- [ ] HTTPS enabled
- [ ] API documentation complete
- [ ] Tests passing

## Error Handling

### Frontend
- Invalid credentials show alert
- Network errors display toast notifications
- Form validation for required fields

### Backend
- 400 Bad Request for invalid input
- 401 Unauthorized for missing/invalid token
- 404 Not Found for missing resources
- 500 Internal Server Error for server issues

## Security Considerations

1. **Password Hashing**: Use bcrypt for password storage
2. **JWT Tokens**: Secure token generation and validation
3. **CORS**: Configure CORS for frontend origin only
4. **Rate Limiting**: Implement rate limiting on endpoints
5. **Input Validation**: Validate all user inputs
6. **SQL Injection**: Use parameterized queries (GORM handles this)
7. **HTTPS**: Use HTTPS in production

## Troubleshooting

### Frontend Issues

**"API_URL not found"**
- Check .env.local file exists
- Ensure NEXT_PUBLIC_API_URL is set
- Verify backend is running on correct port

**"CORS errors"**
- Ensure backend allows requests from frontend origin
- Add CORS middleware in Gin

**Cart not updating**
- Check token in localStorage
- Verify authorization header in API calls

### Backend Issues

**Database locked**
- For SQLite, close other connections
- Consider PostgreSQL for production

**Token validation fails**
- Check JWT secret is consistent
- Verify token format in header

## Support

For issues or questions:
1. Check logs for error messages
2. Review API responses
3. Verify environment configuration
4. Test with Postman

## License

MIT License - feel free to use for projects

## Contributors

Built as an e-commerce assessment solution.
