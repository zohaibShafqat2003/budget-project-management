import React, { useState, useRef } from 'react';
import { Button } from './button';
import { Upload, X, FileIcon, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  accept?: string;
  maxSize?: number; // in bytes
  label?: string;
  className?: string;
  buttonText?: string;
  multiple?: boolean;
  disabled?: boolean;
}

export function FileUpload({
  onFileSelect,
  accept = '*',
  maxSize = 10 * 1024 * 1024, // 10MB default
  label = 'Upload a file',
  className,
  buttonText = 'Select File',
  multiple = false,
  disabled = false,
}: FileUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    const file = files[0]; // Handle only first file if multiple
    
    // Validate file size
    if (file.size > maxSize) {
      setError(`File is too large. Maximum size is ${formatSize(maxSize)}.`);
      return;
    }

    setSelectedFile(file);
    setError(null);
    onFileSelect(file);
  };

  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileChange(e.dataTransfer.files);
    }
  };

  const handleButtonClick = () => {
    if (inputRef.current) {
      inputRef.current.click();
    }
  };

  const clearFile = () => {
    setSelectedFile(null);
    setError(null);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  const formatSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={cn("flex flex-col space-y-2", className)}>
      {label && <p className="text-sm font-medium mb-1">{label}</p>}
      
      <div
        className={cn(
          "border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer transition-colors",
          dragActive ? "border-primary bg-muted/30" : "border-muted-foreground/20",
          disabled ? "opacity-50 cursor-not-allowed" : "hover:border-primary/50",
          "relative"
        )}
        onDragEnter={!disabled ? handleDrag : undefined}
        onDragLeave={!disabled ? handleDrag : undefined}
        onDragOver={!disabled ? handleDrag : undefined}
        onDrop={!disabled ? handleDrop : undefined}
        onClick={!disabled ? handleButtonClick : undefined}
      >
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          accept={accept}
          multiple={multiple}
          disabled={disabled}
          onChange={(e) => handleFileChange(e.target.files)}
        />
        
        {!selectedFile && (
          <div className="flex flex-col items-center gap-2 text-center">
            <Upload className="h-10 w-10 text-muted-foreground" />
            <p className="text-sm text-muted-foreground font-medium">
              Drag and drop your file here or click to browse
            </p>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="mt-2"
              disabled={disabled}
            >
              {buttonText}
            </Button>
            <p className="text-xs text-muted-foreground mt-1">
              Maximum file size: {formatSize(maxSize)}
            </p>
          </div>
        )}
        
        {selectedFile && (
          <div className="flex items-center gap-2 p-2 border rounded w-full relative">
            <FileIcon className="h-6 w-6 text-muted-foreground" />
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-medium truncate">{selectedFile.name}</p>
              <p className="text-xs text-muted-foreground">{formatSize(selectedFile.size)}</p>
            </div>
            <button
              type="button"
              className="rounded-full hover:bg-muted p-1"
              onClick={(e) => {
                e.stopPropagation();
                clearFile();
              }}
              disabled={disabled}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
      
      {error && (
        <div className="flex items-center gap-2 text-destructive text-sm mt-1">
          <AlertCircle className="h-4 w-4" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
} 