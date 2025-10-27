"use client";

import type React from "react";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface ImageUploaderProps {
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
}

export function ImageUploader({ value, onChange, onBlur }: ImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Simulate file upload
    setIsUploading(true);
    setError(null);

    // For demo purposes, we'll just create a data URL
    const reader = new FileReader();
    reader.onload = () => {
      // Make sure we're passing a string to onChange
      const result = reader.result as string;
      console.log("Image uploaded:", result.substring(0, 50) + "..."); // Log for debugging
      onChange(result);
      setIsUploading(false);
    };
    reader.onerror = () => {
      setError("Failed to read file");
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    onChange("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handlePaste = async (e: React.ClipboardEvent) => {
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf("image") !== -1) {
        const blob = items[i].getAsFile();
        if (!blob) continue;

        setIsUploading(true);
        setError(null);

        const reader = new FileReader();
        reader.onload = () => {
          // Make sure we're passing a string to onChange
          const result = reader.result as string;
          console.log("Image pasted:", result.substring(0, 50) + "..."); // Log for debugging
          onChange(result);
          setIsUploading(false);
        };
        reader.onerror = () => {
          setError("Failed to read pasted image");
          setIsUploading(false);
        };
        reader.readAsDataURL(blob);
        break;
      }
    }
  };

  return (
    <div className="space-y-2" onPaste={handlePaste}>
      <Input
        type="file"
        accept="image/*"
        className="hidden"
        ref={fileInputRef}
        onChange={handleFileChange}
        onBlur={onBlur}
      />

      {value ? (
        <div className="relative rounded-md overflow-hidden border">
          <img
            src={value || "/placeholder.svg"}
            alt="Uploaded image"
            className="w-full h-48 object-cover"
          />
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2 h-8 w-8 rounded-full"
            onClick={handleRemoveImage}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div
          className={cn(
            "border-2 border-dashed rounded-md p-6 flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 transition-colors",
            isUploading && "opacity-50 cursor-not-allowed"
          )}
          onClick={() => !isUploading && fileInputRef.current?.click()}
        >
          <div className="rounded-full bg-primary/10 p-3 mb-3">
            <ImageIcon className="h-6 w-6 text-primary" />
          </div>
          <div className="text-center space-y-1">
            <p className="text-sm font-medium">
              {isUploading ? "Uploading..." : "Upload an image"}
            </p>
            <p className="text-xs text-muted-foreground">
              Click to browse or paste from clipboard
            </p>
          </div>
        </div>
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
