import React from 'react';
import { File, FileText, Image, FileImage, FileVideo, FileAudio, FileBadge, FileSpreadsheet, FileCode, AlertCircle, FileIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatFileSize, getFileIcon, isPreviewableImage } from '@/lib/api/attachments';

interface FilePreviewProps {
  fileName: string;
  fileType: string;
  fileSize: number;
  previewUrl?: string;
  className?: string;
  isDownloading?: boolean;
  onClick?: () => void;
}

export function FilePreview({
  fileName,
  fileType,
  fileSize,
  previewUrl,
  className,
  isDownloading = false,
  onClick,
}: FilePreviewProps) {
  const renderIcon = () => {
    const size = 48;
    const iconProps = { size, className: "text-muted-foreground" };
    
    if (fileType.startsWith('image/')) return <Image {...iconProps} />;
    if (fileType.startsWith('video/')) return <FileVideo {...iconProps} />;
    if (fileType.startsWith('audio/')) return <FileAudio {...iconProps} />;
    if (fileType.includes('pdf')) return <FileText {...iconProps} />;
    if (fileType.includes('word') || fileType.includes('document')) return <FileText {...iconProps} />;
    if (fileType.includes('excel') || fileType.includes('spreadsheet')) return <FileSpreadsheet {...iconProps} />;
    if (fileType.includes('code') || fileType.includes('javascript') || fileType.includes('html')) return <FileCode {...iconProps} />;
    if (fileType.includes('zip') || fileType.includes('compressed')) return <FileBadge {...iconProps} />;
    
    return <File {...iconProps} />;
  };

  const isImage = isPreviewableImage(fileType);

  return (
    <div 
      className={cn(
        "border rounded-lg overflow-hidden flex flex-col",
        onClick && "cursor-pointer hover:border-primary transition-colors",
        className
      )}
      onClick={onClick}
    >
      <div className="p-4 flex-1 flex items-center justify-center min-h-[200px] bg-muted/30 relative">
        {isDownloading && (
          <div className="absolute inset-0 bg-background/80 flex items-center justify-center z-10">
            <div className="animate-pulse">Downloading...</div>
          </div>
        )}
        
        {isImage && previewUrl ? (
          <div className="w-full h-full flex items-center justify-center">
            <img 
              src={previewUrl} 
              alt={fileName}
              className="max-w-full max-h-[200px] object-contain" 
            />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center">
            {renderIcon()}
            <span className="text-xs text-muted-foreground mt-2 uppercase">{fileType.split('/')[1] || 'file'}</span>
          </div>
        )}
      </div>
      
      <div className="p-3 border-t bg-card">
        <h4 className="font-medium truncate text-sm" title={fileName}>
          {fileName}
        </h4>
        <p className="text-xs text-muted-foreground mt-1">
          {formatFileSize(fileSize)}
        </p>
      </div>
    </div>
  );
}

interface FilePreviewErrorProps {
  message: string;
  className?: string;
}

export function FilePreviewError({ message, className }: FilePreviewErrorProps) {
  return (
    <div className={cn("border border-destructive rounded-lg p-4 flex items-center gap-2 text-destructive", className)}>
      <AlertCircle className="h-5 w-5" />
      <span className="text-sm">{message}</span>
    </div>
  );
}

interface FileIconPreviewProps {
  fileType: string;
  size?: number;
  className?: string;
}

export function FileTypeIcon({ fileType, size = 24, className }: FileIconPreviewProps) {
  const iconName = getFileIcon(fileType);
  const iconProps = { size, className: cn("text-muted-foreground", className) };
  
  switch (iconName) {
    case 'image':
      return <FileImage {...iconProps} />;
    case 'video':
      return <FileVideo {...iconProps} />;
    case 'audio':
      return <FileAudio {...iconProps} />;
    case 'file-text':
      return <FileText {...iconProps} />;
    case 'file-spreadsheet':
      return <FileSpreadsheet {...iconProps} />;
    case 'archive':
      return <FileBadge {...iconProps} />;
    default:
      return <FileIcon {...iconProps} />;
  }
} 