import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export function CustomLoader() {
  return (
    <div className="flex flex-col items-center space-y-8 p-8 bg-background rounded-lg shadow-lg w-full">
      <div className="flex items-center space-x-4">
        <Skeleton className="h-12 w-12 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-[250px]" />
          <Skeleton className="h-4 w-[200px]" />
        </div>
      </div>
      <Skeleton className="h-4 w-[90%]" />
      <Skeleton className="h-4 w-[80%]" />
      <Skeleton className="h-4 w-[85%]" />
      <div className="flex space-x-4 w-full">
        <Skeleton className="h-32 w-32 rounded-md" />
        <div className="flex-1 space-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-[90%]" />
          <Skeleton className="h-4 w-[80%]" />
          <Skeleton className="h-4 w-[70%]" />
        </div>
      </div>
      <div className="flex justify-between w-full">
        <Skeleton className="h-10 w-24 rounded-md" />
        <Skeleton className="h-10 w-24 rounded-md" />
        <Skeleton className="h-10 w-24 rounded-md" />
      </div>
    </div>
  );
}
