class WebSocketManager {
  constructor() {
    this.socket = null; // WebSocket instance
    this.isConnected = false; // Connection state
    this.messageHandlers = []; // List of message callbacks
    this.connectionHandlers = []; // List of connection state callbacks
  }

  /**
   * Initialize the WebSocket connection
   * @param {string} serverUrl - The WebSocket server URL
   */
  initialize(serverUrl) {
    // if (this.socket) {
    //   console.log("WebSocket already initialized");
    //   return;
    // }

    const token = localStorage.getItem("token");
    if (!token) {
      console.error("No token found. Please log in.");
      return;
    }

    const wsUrl = `${serverUrl}?token=${token}`;
    this.socket = new WebSocket(wsUrl);

    this.socket.onopen = () => {
      this.isConnected = true;
      console.log("WebSocket connected");
      this.connectionHandlers.forEach((handler) => handler(true));
    };

    this.socket.onmessage = (message) => {
      console.log(
        "WebSocket message received from onMessage websockerClass",
        message.data
      );
      console.log(" this.messageHandlers from onMessage", this.messageHandlers);
      try {
        const parsedMessage = JSON.parse(message.data);
        this.messageHandlers.forEach((handler) => handler(parsedMessage));
      } catch (error) {
        console.error("Failed to parse WebSocket message:", error);
      }
    };

    this.socket.onclose = () => {
      this.isConnected = false;
      console.log("WebSocket disconnected");
      this.connectionHandlers.forEach((handler) => handler(false));
    };

    this.socket.onerror = (error) => {
      console.error("WebSocket error:", error);
    };
  }

  /**
   * Send a message via the WebSocket
   * @param {object} data - The data to send
   */
  sendMessage(data) {
    console.log("data from sendMessage", data);
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      console.log("data from sendMessage inside if condition", data);

      this.socket.send(JSON.stringify(data));
    } else {
      console.error("WebSocket is not connected");
    }
  }

  /**
   * Add a handler to process incoming messages
   * @param {function} handler - Callback to process messages
   */
  addMessageHandler(handler) {
    if (typeof handler === "function") {
      this.messageHandlers.push(handler);
      console.log("addMessageHandler", this.messageHandlers);
    } else {
      console.error("Handler must be a function");
    }
  }

  /**
   * Remove a specific message handler
   * @param {function} handler - Callback to remove
   */
  removeMessageHandler(handler) {
    this.messageHandlers = this.messageHandlers.filter((h) => h !== handler);
  }

  /**
   * Add a handler to track connection state
   * @param {function} handler - Callback to track connection state
   */
  addConnectionHandler(handler) {
    this.connectionHandlers.push(handler);
    console.log("this.connectionHandlers", this.connectionHandlers);
  }

  /**
   * Remove a specific connection handler
   * @param {function} handler - Callback to remove
   */
  removeConnectionHandler(handler) {
    this.connectionHandlers = this.connectionHandlers.filter(
      (h) => h !== handler
    );
  }
}

// Export a singleton instance of WebSocketManager
const webSocketManager = new WebSocketManager();
export default webSocketManager;
