package main

import (
	"fmt"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

var db *gorm.DB

// Models
type User struct {
	ID           uint   `json:"id"`
	Username     string `json:"username" gorm:"uniqueIndex"`
	PasswordHash string `json:"-"`
	CreatedAt    time.Time `json:"created_at"`
}

type Item struct {
	ID          uint    `json:"id"`
	Name        string  `json:"name"`
	Description string  `json:"description"`
	Price       float64 `json:"price"`
	CreatedAt   time.Time `json:"created_at"`
}

type Cart struct {
	ID        uint      `json:"id"`
	UserID    uint      `json:"user_id" gorm:"uniqueIndex"`
	Status    string    `json:"status"`
	CreatedAt time.Time `json:"created_at"`
}

type CartItem struct {
	ID       uint `json:"id"`
	CartID   uint `json:"cart_id"`
	ItemID   uint `json:"item_id"`
	Quantity int  `json:"quantity"`
}

type Order struct {
	ID            uint      `json:"id"`
	UserID        uint      `json:"user_id"`
	Status        string    `json:"status"`
	TotalAmount   float64   `json:"total_amount"`
	CreatedAt     time.Time `json:"created_at"`
}

type OrderItem struct {
	ID       uint    `json:"id"`
	OrderID  uint    `json:"order_id"`
	ItemID   uint    `json:"item_id"`
	Quantity int     `json:"quantity"`
	Price    float64 `json:"price"`
}

func init() {
	if os.Getenv("GIN_MODE") == "" {
		gin.SetMode(gin.DebugMode)
	}
}

func main() {
	// Initialize database
	if err := initDB(); err != nil {
		log.Fatalf("Failed to initialize database: %v", err)
	}

	router := gin.Default()

	// CORS middleware
	router.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:3000", "http://localhost:3001"},
		AllowCredentials: true,
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Content-Type", "Authorization"},
		MaxAge:           12 * time.Hour,
	}))

	// User routes
	router.POST("/users", createUser)
	router.POST("/users/login", loginUser)
	router.GET("/users", getUsers)

	// Item routes
	router.POST("/items", createItem)
	router.GET("/items", authMiddleware(), getItems)

	// Cart routes
	router.POST("/carts/", authMiddleware(), addToCart)
	router.GET("/carts", authMiddleware(), getCart)

	// Order routes
	router.POST("/orders", authMiddleware(), createOrder)
	router.GET("/orders", authMiddleware(), getOrders)

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("Server running on :%s", port)
	if err := router.Run(":" + port); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}

func initDB() error {
	database, err := gorm.Open(sqlite.Open("shopcart.db"), &gorm.Config{})
	if err != nil {
		return fmt.Errorf("failed to connect to database: %w", err)
	}

	db = database

	// Auto migrate models
	return db.AutoMigrate(
		&User{},
		&Item{},
		&Cart{},
		&CartItem{},
		&Order{},
		&OrderItem{},
	)
}

// Middleware for authentication
func authMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		token := c.GetHeader("Authorization")
		if token == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "missing token"})
			c.Abort()
			return
		}

		// For simplicity, validate token (in production, use JWT)
		if len(token) < 7 || token[:7] != "Bearer " {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid token format"})
			c.Abort()
			return
		}

		// In production, parse and validate JWT
		c.Next()
	}
}

// User handlers
func createUser(c *gin.Context) {
	var req struct {
		Username string `json:"username" binding:"required"`
		Password string `json:"password" binding:"required"`
	}

	if err := c.BindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	user := User{
		Username:     req.Username,
		PasswordHash: req.Password, // In production, hash this
	}

	if err := db.Create(&user).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "username already exists"})
		return
	}

	// Create cart for user
	cart := Cart{
		UserID: user.ID,
		Status: "active",
	}
	db.Create(&cart)

	c.JSON(http.StatusCreated, user)
}

func loginUser(c *gin.Context) {
	var req struct {
		Username string `json:"username" binding:"required"`
		Password string `json:"password" binding:"required"`
	}

	if err := c.BindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var user User
	if err := db.Where("username = ?", req.Username).First(&user).Error; err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid username/password"})
		return
	}

	// In production, verify hashed password
	if user.PasswordHash != req.Password {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid username/password"})
		return
	}

	// Generate token (simplified, use JWT in production)
	token := fmt.Sprintf("token_%d_%d", user.ID, time.Now().Unix())

	c.JSON(http.StatusOK, gin.H{
		"token":   token,
		"user_id": user.ID,
	})
}

func getUsers(c *gin.Context) {
	var users []User
	db.Find(&users)
	c.JSON(http.StatusOK, users)
}

// Item handlers
func createItem(c *gin.Context) {
	var req struct {
		Name        string  `json:"name" binding:"required"`
		Description string  `json:"description"`
		Price       float64 `json:"price" binding:"required"`
	}

	if err := c.BindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	item := Item{
		Name:        req.Name,
		Description: req.Description,
		Price:       req.Price,
	}

	if err := db.Create(&item).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, item)
}

func getItems(c *gin.Context) {
	var items []Item
	db.Find(&items)
	c.JSON(http.StatusOK, items)
}

// Cart handlers
func addToCart(c *gin.Context) {
	var req struct {
		ItemID uint `json:"item_id" binding:"required"`
	}

	if err := c.BindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Get user ID from token (simplified)
	userIDStr := c.GetHeader("X-User-ID")
	if userIDStr == "" {
		// For now, use a default user ID
		userIDStr = "1"
	}

	var cart Cart
	if err := db.Where("user_id = ?", userIDStr).First(&cart).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "cart not found"})
		return
	}

	// Check if item exists
	var item Item
	if err := db.First(&item, req.ItemID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "item not found"})
		return
	}

	// Add or update cart item
	var cartItem CartItem
	if err := db.Where("cart_id = ? AND item_id = ?", cart.ID, req.ItemID).First(&cartItem).Error; err == nil {
		// Item exists, increment quantity
		cartItem.Quantity++
		db.Save(&cartItem)
	} else {
		// New item
		cartItem = CartItem{
			CartID:   cart.ID,
			ItemID:   req.ItemID,
			Quantity: 1,
		}
		db.Create(&cartItem)
	}

	c.JSON(http.StatusOK, gin.H{"id": cart.ID, "item_id": req.ItemID})
}

func getCart(c *gin.Context) {
	var cartItems []struct {
		ID       uint    `json:"id"`
		ItemID   uint    `json:"item_id"`
		ItemName string  `json:"item_name"`
		Price    float64 `json:"price"`
		Quantity int     `json:"quantity"`
	}

	// Simplified query (in production, proper user identification)
	err := db.Table("cart_items").
		Select("cart_items.id, cart_items.item_id, items.name as item_name, items.price, cart_items.quantity").
		Joins("LEFT JOIN items ON items.id = cart_items.item_id").
		Scan(&cartItems).Error

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, cartItems)
}

// Order handlers
func createOrder(c *gin.Context) {
	var req struct {
		CartID uint `json:"cart_id" binding:"required"`
	}

	if err := c.BindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Get cart items
	var cartItems []CartItem
	if err := db.Where("cart_id = ?", req.CartID).Find(&cartItems).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "cart not found"})
		return
	}

	if len(cartItems) == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "cart is empty"})
		return
	}

	// Get cart to find user
	var cart Cart
	if err := db.First(&cart, req.CartID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "cart not found"})
		return
	}

	// Calculate total
	var total float64
	for _, ci := range cartItems {
		var item Item
		db.First(&item, ci.ItemID)
		total += item.Price * float64(ci.Quantity)
	}

	// Create order
	order := Order{
		UserID:      cart.UserID,
		Status:      "completed",
		TotalAmount: total,
	}
	if err := db.Create(&order).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Add order items
	for _, ci := range cartItems {
		var item Item
		db.First(&item, ci.ItemID)
		oi := OrderItem{
			OrderID:  order.ID,
			ItemID:   ci.ItemID,
			Quantity: ci.Quantity,
			Price:    item.Price,
		}
		db.Create(&oi)
	}

	// Clear cart
	db.Where("cart_id = ?", req.CartID).Delete(&CartItem{})

	c.JSON(http.StatusCreated, order)
}

func getOrders(c *gin.Context) {
	var orders []Order
	db.Find(&orders)
	c.JSON(http.StatusOK, orders)
}
