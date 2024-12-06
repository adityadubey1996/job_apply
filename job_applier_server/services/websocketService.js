const WebSocket = require("ws");
const jwt = require("jsonwebtoken");
const path = require("path");
const fs = require("fs");
const { processAndSaveProfile } = require("../resumeScanner");

const connectedClients = new Map(); // Map of userId -> socketId
const socketToUserMap = new Map(); // Map of socketId -> userId

const sendToUser = (userId, event) => {
  console.log(`Attempting to send event to user: ${userId}`);

  const socketId = connectedClients.get(userId);
  if (!socketId) {
    console.warn(`User ${userId} is not connected. No socketId found.`);
    return;
  }

  const ws = socketToUserMap.get(socketId);
  if (!ws) {
    console.warn(`SocketId ${socketId} not found in socketToUserMap.`);
    return;
  }

  if (ws.readyState !== WebSocket.OPEN) {
    console.warn(
      `WebSocket for user ${userId} with socketId ${socketId} is not open. Current state: ${ws.readyState}`
    );
    return;
  }

  console.log(`Sending event to user ${userId} via socketId ${socketId}`);
  ws.send(JSON.stringify(event));
};

const authenticateWebSocket = (req) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const token = url.searchParams.get("token");
  console.log("token", token);
  if (!token) {
    throw new Error("No token provided");
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "your_secret_key"
    );
    console.log("Authenticated user:", decoded);
    return decoded;
  } catch (err) {
    throw new Error("Invalid or expired token");
  }
};

const setupWebSocket = (server) => {
  const wss = new WebSocket.Server({ server });

  wss.on("connection", (ws, req) => {
    try {
      const user = authenticateWebSocket(req);
      ws.user = user; // Attach user info to the WebSocket instance
      const { id: userId } = user;

      ws.userId = userId;
      const socketId = `${Date.now()}-${Math.random()
        .toString(36)
        .substr(2, 9)}`; // Unique socketId
      connectedClients.set(userId, socketId);
      socketToUserMap.set(socketId, ws);

      console.log(`User ${userId} connected with socketId ${socketId}`);

      console.log("WebSocket connection authenticated:", user);

      ws.on("message", (message) => {
        const parsedMessage = JSON.parse(message);

        if (parsedMessage.action === "upload") {
          const { fileName, chunk, isLastChunk } = parsedMessage;
          const uniqueString = Date.now();
          const userId = ws.user.id;
          const uniqueFileName = `${uniqueString}_${fileName}_${userId}`;

          if (!userId) {
            sendToUser(userId, {
              event: "upload",
              status: "error",
              message: "Failed to write chunk, userId not found",
            });

            return;
          }

          const filePath = path.join(__dirname, "uploads", uniqueFileName);
          console.log("filePath");

          const bufferChunk = Buffer.from(chunk, "base64");

          // Ensure the uploads directory exists
          if (!fs.existsSync(path.join(__dirname, "uploads"))) {
            fs.mkdirSync(path.join(__dirname, "uploads"));
          }

          // Append chunk to file
          fs.appendFile(filePath, bufferChunk, (err) => {
            if (err) {
              console.error("Error writing chunk:", err);

              sendToUser(userId, {
                event: "upload",
                status: "error",
                message: "Failed to write chunk",
              });

              return;
            }

            if (isLastChunk) {
              console.log(`File upload complete: ${uniqueFileName}`);

              sendToUser(userId, {
                event: "upload",
                status: "success",
                message: `File ${uniqueFileName} uploaded successfully`,
              });

              processAndSaveProfile(filePath, userId)
                .then((savedProfile) => {
                  console.log(
                    "Processing complete. Profile saved:",
                    savedProfile
                  );
                  sendToUser(userId, {
                    event: "process",
                    status: "success",
                    message: `File ${fileName} scanned successfully`,
                    data: savedProfile,
                  });
                })
                .catch((error) => {
                  console.error("Processing failed:", error.message);
                  sendToUser(userId, {
                    event: "process",
                    status: "error",
                    message: `Processing failed for ${fileName}: ${error.message}`,
                  });
                });
            }
          });
        }
      });

      ws.on("close", () => {
        console.log(`WebSocket connection closed for ${user.id}`);
        console.log(`User ${userId} disconnected`);
        socketToUserMap.delete(socketId);
        connectedClients.delete(userId);
      });
    } catch (err) {
      console.error("WebSocket authentication error:", err.message);
      ws.close(1008, err.message); // Close connection with policy violation code (1008)
    }
  });

  console.log("WebSocket server is set up");
};

module.exports = { setupWebSocket };
