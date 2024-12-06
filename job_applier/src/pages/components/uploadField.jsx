import React, { useEffect, useState, useRef } from "react";
import { UploadCloud } from "lucide-react";
import { useAuthenticatedWebSocket } from "../../services/useWebsocket";
import { getServerUrl } from "../../api/config";
import { Button } from "@/components/ui/button";
import webSocketManager from "../../websocketClass";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

export const UploadComponent = ({ onProcessSuccess }) => {
  const { toast } = useToast();
  const [isConnect, setIsConnected] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [currentFile, setCurrentFile] = useState(null);
  const [uploadError, setUploadError] = useState(null);
  const [loaderMessage, setLoaderMessage] = useState("");
  const [showLoader, setShowLoader] = useState(false);
  const timeoutRef = useRef(null); // Ref to track timeout

  const startTimeout = () => {
    clearTimeout(timeoutRef.current); // Clear any existing timeout
    timeoutRef.current = setTimeout(() => {
      setLoaderMessage("Request timed out. Please try again.");
      setShowLoader(false);
    }, 30000); // 30-second timeout
  };

  const resetTimeout = () => {
    clearTimeout(timeoutRef.current); // Clear the timeout
  };

  const onUploadStart = (value) => {
    console.log("Upload started:", value);
    if (value) {
      setLoaderMessage("Upload started...");
      setShowLoader(true);
      startTimeout(); // Start timeout for the request
    }
  };

  const onFileUploaded = (value) => {
    console.log("File uploaded:", value);
    if (value) {
      setTimeout(() => {
        setLoaderMessage("File uploaded successfully!, file being processed");
      }, 2000);
    }
  };

  const onFileProcessed = (value, data) => {
    console.log("File processed:", value);
    if (value) {
      setTimeout(() => {
        setLoaderMessage("File processed successfully! Navigating...");
        resetTimeout(); // Reset timeout as processing is complete
        onProcessSuccess(true, data);
        setShowLoader(false);
      }, 3000);
    }
  };

  const handleTimeoutError = () => {
    setLoaderMessage("Request timed out. Please try again.");
    setShowLoader(false);
    resetTimeout();
  };

  useEffect(() => {
    return () => {
      resetTimeout(); // Clean up timeout on component unmount
    };
  }, []);

  const handleFileUpload = (event) => {
    const files = event.target.files;
    if (files?.length) {
      if (uploadProgress > 0 && uploadProgress < 100) {
        setIsModalOpen(true);
        setCurrentFile(files[0]);
      } else {
        startUpload(files[0]);
      }
    }
  };

  const onError = (msg) => {
    resetTimeout(); // Reset timeout if there's an error
    setLoaderMessage("An error occurred. Please try again.");
    setShowLoader(false);
    toast({
      title: "Oops! Something Went Wrong",
      description: msg,
      variant: "destructive",
    });
  };

  const handleDragOver = (event) => event.preventDefault();

  const handleDrop = (event) => {
    event.preventDefault();
    const files = event.dataTransfer.files;
    if (files?.length) {
      if (uploadProgress > 0 && uploadProgress < 100) {
        setIsModalOpen(true);
        setCurrentFile(files[0]);
      } else {
        startUpload(files[0]);
      }
    }
  };

  console.log("isConnect", isConnect);

  const startUpload = (file) => {
    if (!file) return;
    const chunkSize = (1024 * 1024) / 10; // 256KB
    const totalChunks = Math.ceil(file.size / chunkSize);
    let currentChunk = 0;
    const sendNextChunk = () => {
      if (!isConnect) {
        console.error("WebSocket is not connected");
        setUploadError("WebSocket is not connected");
        return;
      }
      console.log("after isConnect if condition check", isConnect);
      const start = currentChunk * chunkSize;
      const end = Math.min(start + chunkSize, file.size);
      const chunk = file.slice(start, end);
      const isLastChunk = currentChunk === totalChunks - 1;

      const reader = new FileReader();
      reader.onload = (e) => {
        console.log("inside reader.onload function", e);
        const base64Chunk = btoa(
          String.fromCharCode(...new Uint8Array(e.target.result))
        );
        // file upload begin

        // Send the chunk
        webSocketManager.sendMessage({
          action: "upload",
          fileName: file.name,
          chunk: base64Chunk,
          currentChunk: currentChunk + 1,
          totalChunks,
          isLastChunk,
        });

        currentChunk += 1;

        // Update progress
        const progress = Math.floor((currentChunk / totalChunks) * 100);
        setUploadProgress(progress);

        // Continue with the next chunk
        if (currentChunk < totalChunks) {
          sendNextChunk();
        } else {
          console.log("File upload completed");
          onFileUploaded(true);
        }
      };

      reader.readAsArrayBuffer(chunk);
    };
    setUploadError(null); // Reset error state
    setUploadProgress(0); // Reset progress

    setCurrentFile(null);
    onUploadStart(true);
    try {
      sendNextChunk();
    } catch (e) {
      onUploadStart(false);
    }
  };

  const handleReUpload = () => {
    setUploadProgress(0);
    setUploadError(null); // Reset error state
    if (currentFile) {
      startUpload(currentFile);
    }
    setIsModalOpen(false);
  };

  const handleCancelUpload = () => {
    setUploadProgress(0);
    setUploadError(null); // Reset error state
    setIsModalOpen(false);
    setCurrentFile(null);
  };
  console.log("isCOnnect", isConnect);
  const handleMessage = (message) => {
    console.log("WebSocket message received:", message);
    const { event, status, message: msg, data } = message;

    // error
    if (status === "success") {
      if (event === "upload") {
        // file upload done
        onFileUploaded(true);
      } else if (event === "process") {
        // file process done
        onFileProcessed(true, data._doc);
      }
    } else if (status === "error") {
      setShowLoader(false);
      onError(msg);
    }
  };

  const handleConnectionState = (state) => {
    setIsConnected(state);
    console.log("WebSocket connection state:", state);
  };

  useEffect(() => {
    webSocketManager.initialize(getServerUrl());

    webSocketManager.addConnectionHandler(handleConnectionState);

    // Add a message handler

    webSocketManager.addMessageHandler(handleMessage);

    // Cleanup handlers on component unmount
    return () => {
      webSocketManager.removeConnectionHandler(handleConnectionState);
      webSocketManager.removeMessageHandler(handleMessage);
    };
  }, []);

  const sendTestMessage = () => {
    webSocketManager.sendMessage({ action: "test", data: "Hello WebSocket" });
  };

  return (
    <>
      {showLoader ? (
        <div className="flex flex-col items-center justify-center space-y-2">
          <div className="loader"></div>
          <div className="text-center text-sm text-blue-500 transition-opacity duration-300">
            {loaderMessage}
          </div>
        </div>
      ) : (
        <div
          className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-300 rounded-lg bg-muted hover:bg-accent cursor-pointer transition-colors duration-150 relative"
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <input
            type="file"
            className="absolute inset-0 opacity-0 cursor-pointer"
            onChange={handleFileUpload}
            accept=".pdf"
            multiple
            disabled={!isConnect}
          />

          <UploadCloud className="h-10 w-10 text-gray-500 mb-3" />
          <p className="text-sm text-gray-700">
            <strong className="text-primary">Click to upload</strong> or drag
            and drop
          </p>
          <p className="text-xs text-gray-500 mt-1">PDF only</p>

          {uploadError && (
            <p className="text-xs text-red-500 mt-2">Error: {uploadError}</p>
          )}
          {!isConnect && (
            <p className="text-xs text-red-500 mt-2">
              WebSocket connection is not established.
            </p>
          )}

          <Dialog open={isModalOpen} onOpenChange={handleCancelUpload}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Upload in Progress</DialogTitle>
                <DialogDescription>
                  An upload is already in progress. Would you like to cancel it
                  and re-upload the selected file?
                </DialogDescription>
              </DialogHeader>
              <div className="flex justify-end gap-4">
                <Button variant="secondary" onClick={handleCancelUpload}>
                  Cancel
                </Button>
                <Button onClick={handleReUpload}>Re-upload</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      )}
    </>
  );
};
