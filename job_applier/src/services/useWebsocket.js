import { useEffect, useRef, useState, useCallback } from "react";

export const useAuthenticatedWebSocket = (
  serverUrl,
  onMessage,
  isConnectedCallBack
) => {
  const socketRef = useRef(null);
  const isConnectedRef = useRef(false); // Track WebSocket connection state internally
  const [isConnect, setIsConnected] = useState(false); // State for external usage

  const handleWebSocketMessage = useCallback(
    (message) => {
      try {
        const parsedMessage = JSON.parse(message.data);
        if (onMessage) {
          onMessage(parsedMessage);
        }
      } catch (error) {
        console.error("Failed to parse WebSocket message:", error);
      }
    },
    [onMessage]
  );

  useEffect(() => {
    if (!serverUrl) return;

    const token = localStorage.getItem("token");
    if (!token) {
      console.error("No token found. Please log in.");
      return;
    }

    if (socketRef.current) {
      console.log("WebSocket already initialized");
      return;
    }

    const wsUrl = `${serverUrl}?token=${token}`;
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log("isConnectedRef.current in onOpen", isConnectedRef.current);
      if (!isConnectedRef.current) {
        isConnectedRef.current = true;

        console.log("isConnectedRef.current in onOpen", isConnectedRef.current);
        isConnectedCallBack(true);
        // setIsConnected(true); // to update the hook state for the
      }
      console.log("WebSocket connected");
    };

    ws.onmessage = handleWebSocketMessage;

    ws.onclose = () => {
      console.log("isConnectedRef.current in onclose", isConnectedRef.current);
      if (isConnectedRef.current) {
        isConnectedRef.current = false;
        console.log(
          "isConnectedRef.current in onclose",
          isConnectedRef.current
        );
        isConnectedCallBack(false);
        // setIsConnected(false);
      }
      console.log("WebSocket disconnected");
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    socketRef.current = ws;

    return () => {
      ws.close();
      socketRef.current = null;
    };
  }, [serverUrl, handleWebSocketMessage]);

  const sendMessage = useCallback((data) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify(data));
    } else {
      console.error("WebSocket is not connected");
    }
  }, []);

  const isConnected = () => isConnectedRef.current;

  useEffect(() => {
    console.log(
      "isConnectedRef.current from useEffect",
      isConnectedRef.current
    );
  }, [isConnectedRef]);

  return {
    sendMessage,
    isConnected,
    isConnect,
  };
};
