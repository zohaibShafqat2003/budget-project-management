import React, { useState } from 'react';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from './ui/dialog';
import { Button } from './ui/button';
import { FileUpload } from './ui/file-upload';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { uploadNewVersion } from '@/lib/api/attachments';
import { toast } from 'sonner';

interface NewVersionDialogProps {
  attachmentId: string;
  fileName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function NewVersionDialog({
  attachmentId,
  fileName,
  open,
  onOpenChange,
  onSuccess
}: NewVersionDialogProps) {
  const [file, setFile] = useState<File | null>(null);
  const [versionComment, setVersionComment] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const handleUploadNewVersion = async () => {
    if (!file) return;
    
    try {
      setIsUploading(true);
      
      const result = await uploadNewVersion(
        attachmentId,
        file,
        versionComment
      );
      
      if (result.success) {
        toast.success('New version uploaded successfully');
        setFile(null);
        setVersionComment('');
        onOpenChange(false);
        if (onSuccess) onSuccess();
      } else {
        toast.error(result.message || 'Failed to upload new version');
      }
    } catch (err: any) {
      toast.error(err.message || 'An error occurred during upload');
      console.error(err);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Upload New Version</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="text-sm">
            <p className="font-medium">Current file:</p>
            <p className="text-muted-foreground truncate">{fileName}</p>
          </div>
          
          <FileUpload
            onFileSelect={(file) => setFile(file)}
            label="Select new version"
            buttonText="Choose File"
          />
          
          <div className="space-y-2">
            <Label htmlFor="versionComment">Version Comment</Label>
            <Textarea
              id="versionComment"
              placeholder="Describe what changed in this version"
              value={versionComment}
              onChange={(e) => setVersionComment(e.target.value)}
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isUploading}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleUploadNewVersion}
            disabled={!file || isUploading}
          >
            {isUploading ? 'Uploading...' : 'Upload New Version'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 