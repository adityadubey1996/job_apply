const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const cors = require("cors");
const resumeRoutes = require("./routes/resumeRoutes");
const authRoutes = require("./routes/authRoutes");
const profileRoutes = require("./routes/profileRoutes");
const getStartedData = require("./routes/getStarterRoutes");
const suggestionRoutes = require("./routes/suggestionRoutes");

const connectDB = require("./config/dataBaseConnection");
const cloudBucketService = require("./services/bucketService");
const { setupWebSocket } = require("./services/websocketService");
connectDB();
// Configure allowed origins and headers
const allowedOrigins = [
  "http://localhost:5173",
  "http://your-frontend-domain.com",
  "https://tailorcv.in",
];
const allowedHeaders = ["Content-Type", "Authorization"];

// Initialize Express app
const app = express();

app.use(express.json());

cloudBucketService.updateBucketCors(process.env.GCS_BUCKET_NAME);

// CORS Middleware
app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: allowedHeaders,
    credentials: true, // If you need to support cookies or authorization headers
  })
);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

// Basic route to test server
app.get("/", (req, res) => {
  res.send("Server is running");
});

app.use("/api/resume", resumeRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api", getStartedData);
app.use("/api", suggestionRoutes);

// Create HTTP server and wrap Express app
const server = http.createServer(app);

// Set up WebSocket with authentication
setupWebSocket(server);

// Start server
const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`Server started on http://localhost:${PORT}`);
});
