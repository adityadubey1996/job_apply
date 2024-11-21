import React, { useState, useRef, useEffect } from "react";
import { GripHorizontal } from "lucide-react";
import { cn } from "@/lib/utils"; // Assuming a utility for conditional classes

const ResizableSplitPane = ({ leftComponent, rightComponent }) => {
  const [dividerPosition, setDividerPosition] = useState(50); // 50-50 default split
  const containerRef = useRef(null);
  const [containerWidth, setContainerWidth] = useState(0);

  // Calculate container width when the component mounts
  useEffect(() => {
    if (containerRef.current) {
      setContainerWidth(containerRef.current.offsetWidth);
    }
    const handleResize = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const handleMouseMove = (e) => {
    if (!containerRef.current) return;

    // Calculate new divider position as a percentage of the container width
    const containerLeft = containerRef.current.getBoundingClientRect().left;
    const newDividerPosition =
      ((e.clientX - containerLeft) / containerWidth) * 100;

    setDividerPosition((prev) => {
      // Ensure the divider stays between 10% and 90%
      return Math.max(10, Math.min(90, newDividerPosition));
    });
  };

  const handleMouseUp = () => {
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);
  };

  const handleMouseDown = () => {
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  return (
    <div ref={containerRef} className=" flex h-screen w-full">
      {/* Left Pane */}
      <div
        className="overflow-auto"
        style={{
          width: `${dividerPosition}%`,
        }}
      >
        {leftComponent}
      </div>

      {/* Divider */}
      <div
        className={cn(
          "flex items-center justify-center cursor-col-resize bg-gray-200 relative z-10",
          "hover:bg-gray-300 transition-all"
        )}
        style={{
          width: "2px",
        }}
        onMouseDown={handleMouseDown}
      >
        <div
          className={cn(
            "w-8 h-8 bg-gray-500 rounded-full flex items-center justify-center",
            "text-white hover:bg-gray-600 transition-colors"
          )}
        >
          <GripHorizontal size={16} />
        </div>
      </div>

      {/* Right Pane */}
      <div
        className="overflow-auto"
        style={{
          width: `${100 - dividerPosition}%`,
        }}
      >
        {rightComponent}
      </div>
    </div>
  );
};

export default ResizableSplitPane;
