# Backend Implementation Notes

## Complete Backend Code Implementation

This file contains all the Go backend code needed for the ShopCart application.

### Running the Backend

1. **Create project directory**:
   \`\`\`bash
   mkdir shopcart-backend
   cd shopcart-backend
   \`\`\`

2. **Initialize Go module**:
   \`\`\`bash
   go mod init shopcart-backend
   \`\`\`

3. **Copy files**:
   - Copy main.go
   - Copy go.mod
   - Create .env file

4. **Install dependencies**:
   \`\`\`bash
   go mod download
   \`\`\`

5. **Run server**:
   \`\`\`bash
   go run main.go
   \`\`\`

### Key Implementation Details

#### Authentication
- Current: Simplified token generation (string-based)
- Production: Implement JWT with golang-jwt/jwt
- Token stored in Authorization header: `Bearer <token>`

#### Database
- SQLite for development (auto-creates shopcart.db)
- PostgreSQL for production
- Auto-migration of models on startup

#### Models
1. **User**: username, password_hash, timestamps
2. **Item**: name, description, price
3. **Cart**: user_id (unique), status, timestamps
4. **CartItem**: cart_id, item_id, quantity
5. **Order**: user_id, status, total_amount
6. **OrderItem**: order_id, item_id, quantity, price

#### API Endpoints

**Users**:
- POST /users - Create account
- POST /users/login - Login and get token
- GET /users - List all users

**Items**:
- POST /items - Create item
- GET /items - List all items (protected)

**Cart**:
- POST /carts/ - Add item to cart (protected)
- GET /carts - Get user's cart (protected)

**Orders**:
- POST /orders - Create order (protected)
- GET /orders - Get user's orders (protected)

### Production Enhancements Needed

1. **Authentication**:
   - Replace string tokens with JWT
   - Add JWT middleware to validate tokens
   - Store user ID in JWT claims
   - Implement token refresh

2. **Database**:
   - Use PostgreSQL instead of SQLite
   - Add proper indexes on foreign keys
   - Implement connection pooling

3. **Validation**:
   - Add input validation for all endpoints
   - Implement proper error responses
   - Add request logging

4. **Security**:
   - Hash passwords with bcrypt
   - Implement rate limiting
   - Add HTTPS/TLS support
   - Validate CORS origins

5. **Performance**:
   - Add pagination to list endpoints
   - Implement query optimization
   - Add caching for items

6. **Testing**:
   - Write unit tests
   - Add integration tests
   - Create test fixtures

### Example Requests

**Signup**:
\`\`\`bash
curl -X POST http://localhost:8080/users \
  -H "Content-Type: application/json" \
  -d '{"username":"john","password":"pass123"}'
\`\`\`

**Login**:
\`\`\`bash
curl -X POST http://localhost:8080/users/login \
  -H "Content-Type: application/json" \
  -d '{"username":"john","password":"pass123"}'
\`\`\`

**Add Item**:
\`\`\`bash
curl -X POST http://localhost:8080/items \
  -H "Content-Type: application/json" \
  -d '{"name":"Laptop","description":"High performance","price":999.99}'
\`\`\`

**Add to Cart**:
\`\`\`bash
curl -X POST http://localhost:8080/carts/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer token_123" \
  -d '{"item_id":1}'
\`\`\`

**Create Order**:
\`\`\`bash
curl -X POST http://localhost:8080/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer token_123" \
  -d '{"cart_id":1}'
\`\`\`

### Deploying Backend

#### Docker
\`\`\`bash
docker build -t shopcart-api:latest .
docker run -p 8080:8080 shopcart-api:latest
\`\`\`

#### Railway
1. Connect GitHub repo
2. Add environment variables
3. Auto-deploys on push

#### Render
1. Create Web Service
2. Set build command: \`go build -o shopcart-api main.go\`
3. Set start command: \`./shopcart-api\`

### Troubleshooting

**Port 8080 in use**:
\`\`\`bash
lsof -i :8080
kill -9 <PID>
\`\`\`

**Database locked**:
\`\`\`bash
rm shopcart.db
\`\`\`

**CORS errors**:
- Check CORS config in main.go
- Verify frontend origin

**Token issues**:
- Clear localStorage in browser
- Check Authorization header format
\`\`\`
