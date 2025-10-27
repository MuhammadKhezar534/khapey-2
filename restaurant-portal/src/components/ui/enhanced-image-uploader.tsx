"use client";

import type React from "react";

import { useState, useRef, useCallback } from "react";
import { Upload, X, Clipboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface EnhancedImageUploaderProps {
  value?: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  className?: string;
  maxHeight?: number;
  previewClassName?: string;
  label?: string;
  description?: string;
  acceptedFormats?: string[];
  maxSizeInMB?: number;
}

export function EnhancedImageUploader({
  value,
  onChange,
  onBlur,
  className,
  maxHeight = 200,
  previewClassName,
  label = "Image",
  description = "Upload an image or paste from clipboard",
  acceptedFormats = ["image/jpeg", "image/png", "image/gif", "image/webp"],
  maxSizeInMB = 5,
}: EnhancedImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = useCallback(
    (file: File): boolean => {
      setError(null);

      if (!acceptedFormats.includes(file.type)) {
        setError(
          `Invalid file type. Accepted formats: ${acceptedFormats
            .map((f) => f.replace("image/", ""))
            .join(", ")}`
        );
        return false;
      }

      const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
      if (file.size > maxSizeInBytes) {
        setError(`File size exceeds ${maxSizeInMB}MB limit`);
        return false;
      }

      return true;
    },
    [acceptedFormats, maxSizeInMB]
  );

  const handleFile = useCallback(
    (file: File) => {
      if (!validateFile(file)) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        onChange(result);
        if (onBlur) onBlur();
      };
      reader.readAsDataURL(file);
    },
    [onChange, onBlur, validateFile]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        const file = e.dataTransfer.files[0];
        handleFile(file);
      }
    },
    [handleFile]
  );

  const handlePaste = useCallback(async () => {
    try {
      const clipboardItems = await navigator.clipboard.read();
      for (const clipboardItem of clipboardItems) {
        for (const type of clipboardItem.types) {
          if (type.startsWith("image/")) {
            const blob = await clipboardItem.getType(type);
            const file = new File([blob], "pasted-image.png", { type });
            handleFile(file);
            return;
          }
        }
      }
      setError("No image found in clipboard");
    } catch (err) {
      console.error("Failed to read clipboard:", err);
      setError("Failed to read clipboard");
    }
  }, [handleFile]);

  return (
    <div className="space-y-2">
      {value ? (
        <div
          className={cn(
            "relative rounded-md overflow-hidden border border-input",
            previewClassName
          )}
        >
          <img
            src={value || "/placeholder.svg"}
            alt="Preview"
            className="w-full h-auto object-cover"
            style={{ maxHeight: `${maxHeight}px` }}
          />
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2 h-8 w-8 rounded-full"
            onClick={() => {
              onChange("");
              if (onBlur) onBlur();
            }}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div
          className={cn(
            "border border-dashed border-input rounded-md p-6 flex flex-col items-center justify-center gap-2",
            isDragging && "border-primary bg-primary/5",
            className
          )}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="flex items-center gap-1"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="h-4 w-4" />
              Upload
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="flex items-center gap-1"
              onClick={handlePaste}
            >
              <Clipboard className="h-4 w-4" />
              Paste
            </Button>
          </div>
          <p className="text-xs text-muted-foreground text-center">
            {description}
            <br />
            {`Max size: ${maxSizeInMB}MB`}
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept={acceptedFormats.join(",")}
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files.length > 0) {
                handleFile(e.target.files[0]);
              }
            }}
          />
        </div>
      )}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
