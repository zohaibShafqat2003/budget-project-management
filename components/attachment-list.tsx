import React, { useState, useEffect } from 'react';
import { 
  getAttachments, 
  downloadAttachment, 
  deleteAttachment,
  generateAttachmentDownloadUrl,
  getAttachmentVersions,
  getAttachmentPreviewUrl,
  isFilePreviewable,
  formatFileSize
} from '@/lib/api/attachments';
import { FilePreview, FilePreviewError, FileTypeIcon } from './ui/file-preview';
import { Button } from './ui/button';
import { FileUpload } from './ui/file-upload';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose
} from './ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from './ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from './ui/table';
import { Skeleton } from './ui/skeleton';
import { ScrollArea } from './ui/scroll-area';
import { Badge } from './ui/badge';
import { 
  Download, 
  MoreVertical, 
  Trash2, 
  Upload, 
  Eye, 
  History,
  File,
  ExternalLink
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Pagination } from './ui/pagination';

interface AttachmentListProps {
  entityType: 'projects' | 'epics' | 'stories' | 'tasks';
  entityId: string;
  onUploadSuccess?: () => void;
  className?: string;
}

export function AttachmentList({
  entityType,
  entityId,
  onUploadSuccess,
  className
}: AttachmentListProps) {
  const [attachments, setAttachments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadDescription, setUploadDescription] = useState('');
  const [selectedAttachment, setSelectedAttachment] = useState<any | null>(null);
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [versionDialogOpen, setVersionDialogOpen] = useState(false);
  const [versions, setVersions] = useState<any[]>([]);
  const [loadingVersions, setLoadingVersions] = useState(false);
  const [showGrid, setShowGrid] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 1
  });
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loadingPreview, setLoadingPreview] = useState(false);

  useEffect(() => {
    fetchAttachments();
  }, [entityType, entityId, pagination.page]);

  const fetchAttachments = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await getAttachments(entityType, entityId, pagination.page, pagination.limit);
      
      if (response.success) {
        setAttachments(response.data || []);
        if (response.pagination) {
          setPagination(response.pagination);
        }
      } else {
        setError(response.message || 'Failed to load attachments');
      }
    } catch (err) {
      setError('An error occurred while loading attachments');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadFile = async () => {
    if (!uploadFile) return;
    
    try {
      setIsUploading(true);
      
      // Import the upload function dynamically to avoid circular dependencies
      const { uploadAttachment } = await import('@/lib/api/attachments');
      
      const result = await uploadAttachment(
        entityType,
        entityId,
        uploadFile,
        uploadDescription,
        false // isPublic
      );
      
      if (result.success) {
        toast.success('File uploaded successfully');
        fetchAttachments();
        setUploadDialogOpen(false);
        setUploadFile(null);
        setUploadDescription('');
        if (onUploadSuccess) onUploadSuccess();
      } else {
        toast.error(result.message || 'Failed to upload file');
      }
    } catch (err: any) {
      toast.error(err.message || 'An error occurred during upload');
      console.error(err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDownload = async (attachment: any) => {
    try {
      setDownloadingId(attachment.id);
      
      const response = await downloadAttachment(attachment.id);
      
      if (!response.success) {
        throw new Error(response.message || 'Download failed');
      }
      
      // Create a download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', response.fileName || attachment.originalName);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('File downloaded successfully');
    } catch (err: any) {
      toast.error(err.message || 'Failed to download file');
      console.error(err);
    } finally {
      setDownloadingId(null);
    }
  };

  const handleDelete = async (attachment: any) => {
    if (!confirm('Are you sure you want to delete this file?')) return;
    
    try {
      const result = await deleteAttachment(attachment.id);
      
      if (result.success) {
        toast.success('File deleted successfully');
        fetchAttachments();
      } else {
        toast.error(result.message || 'Failed to delete file');
      }
    } catch (err) {
      toast.error('An error occurred while deleting the file');
      console.error(err);
    }
  };

  const handlePreview = async (attachment: any) => {
    try {
      setSelectedAttachment(attachment);
      setPreviewDialogOpen(true);
      setLoadingPreview(true);
      
      // Generate a secure URL for viewing this attachment
      const urlResponse = await generateAttachmentDownloadUrl(attachment.id);
      
      if (urlResponse.success) {
        setPreviewUrl(urlResponse.data.url);
      } else {
        toast.error('Failed to generate preview URL');
        setPreviewUrl(null);
      }
    } catch (err) {
      toast.error('Failed to prepare preview');
      console.error(err);
      setPreviewUrl(null);
    } finally {
      setLoadingPreview(false);
    }
  };

  const handleShowVersions = async (attachment: any) => {
    try {
      setLoadingVersions(true);
      setSelectedAttachment(attachment);
      
      const response = await getAttachmentVersions(attachment.id);
      
      if (response.success) {
        setVersions(response.data || []);
      } else {
        toast.error(response.message || 'Failed to load versions');
      }
    } catch (err) {
      toast.error('An error occurred while loading versions');
      console.error(err);
    } finally {
      setLoadingVersions(false);
      setVersionDialogOpen(true);
    }
  };

  const renderFileList = () => {
    if (loading) {
      return Array(3).fill(0).map((_, i) => (
        <div key={i} className="border rounded-lg p-4 space-y-3">
          <Skeleton className="h-[200px] w-full rounded-md" />
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-3 w-1/4" />
        </div>
      ));
    }

    if (error) {
      return <FilePreviewError message={error} />;
    }

    if (attachments.length === 0) {
      return (
        <div className="text-center py-12 border rounded-lg">
          <File className="mx-auto h-12 w-12 text-muted-foreground mb-3" />
          <h3 className="text-lg font-medium">No attachments yet</h3>
          <p className="text-muted-foreground mb-4">Upload files to get started</p>
          <Button onClick={() => setUploadDialogOpen(true)}>
            Upload File
          </Button>
        </div>
      );
    }

    if (showGrid) {
      return attachments.map((attachment) => (
        <div key={attachment.id} className="relative group">
          <FilePreview
            fileName={attachment.originalName}
            fileType={attachment.fileType}
            fileSize={attachment.fileSize}
            previewUrl={isFilePreviewable(attachment.fileType) ? getAttachmentPreviewUrl(attachment) : undefined}
            isDownloading={downloadingId === attachment.id}
            onClick={() => isFilePreviewable(attachment.fileType) ? handlePreview(attachment) : handleDownload(attachment)}
          />
          
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 bg-background/80">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleDownload(attachment)}>
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </DropdownMenuItem>
                
                {isFilePreviewable(attachment.fileType) && (
                  <DropdownMenuItem onClick={() => handlePreview(attachment)}>
                    <Eye className="mr-2 h-4 w-4" />
                    Preview
                  </DropdownMenuItem>
                )}
                
                <DropdownMenuItem onClick={() => handleShowVersions(attachment)}>
                  <History className="mr-2 h-4 w-4" />
                  Versions
                </DropdownMenuItem>
                
                <DropdownMenuItem onClick={() => handleDelete(attachment)}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          <div className="p-2">
            <h3 className="font-medium truncate" title={attachment.originalName}>
              {attachment.originalName}
            </h3>
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>{formatFileSize(attachment.fileSize)}</span>
              <span>{format(new Date(attachment.createdAt), 'MMM d, yyyy')}</span>
            </div>
          </div>
        </div>
      ));
    } else {
      return (
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Size</TableHead>
                <TableHead>Uploaded</TableHead>
                <TableHead>Uploader</TableHead>
                <TableHead className="w-[120px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {attachments.map((attachment) => (
                <TableRow key={attachment.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <FileTypeIcon fileType={attachment.fileType} />
                      <span className="truncate max-w-[200px]" title={attachment.originalName}>
                        {attachment.originalName}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>{formatFileSize(attachment.fileSize)}</TableCell>
                  <TableCell>{format(new Date(attachment.createdAt), 'MMM d, yyyy')}</TableCell>
                  <TableCell>{attachment.uploader?.name || 'Unknown'}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleDownload(attachment)}
                        disabled={downloadingId === attachment.id}
                        title="Download"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      
                      {isFilePreviewable(attachment.fileType) && (
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handlePreview(attachment)}
                          title="Preview"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      )}
                      
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleShowVersions(attachment)}
                        title="Versions"
                      >
                        <History className="h-4 w-4" />
                      </Button>
                      
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleDelete(attachment)}
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      );
    }
  };

  return (
    <div className={className}>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Attachments</h2>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setShowGrid(!showGrid)}
          >
            {showGrid ? 'List View' : 'Grid View'}
          </Button>
          <Button 
            size="sm" 
            onClick={() => setUploadDialogOpen(true)}
          >
            <Upload className="mr-2 h-4 w-4" />
            Upload
          </Button>
        </div>
      </div>

      {/* File Grid or List */}
      <div className={showGrid ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" : ""}>
        {renderFileList()}
      </div>

      {/* Pagination */}
      {!loading && attachments.length > 0 && pagination.pages > 1 && (
        <div className="mt-4 flex justify-center">
          <Pagination
            currentPage={pagination.page}
            totalPages={pagination.pages}
            onPageChange={(page) => setPagination({ ...pagination, page })}
          />
        </div>
      )}

      {/* Upload Dialog */}
      <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Upload File</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <FileUpload
              onFileSelect={(file) => setUploadFile(file)}
              label="File to upload"
            />
            
            <div className="space-y-2">
              <Label htmlFor="description">Description (optional)</Label>
              <Textarea
                id="description"
                placeholder="Enter a description for this file"
                value={uploadDescription}
                onChange={(e) => setUploadDescription(e.target.value)}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setUploadDialogOpen(false)}
              disabled={isUploading}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleUploadFile}
              disabled={!uploadFile || isUploading}
            >
              {isUploading ? 'Uploading...' : 'Upload'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      {selectedAttachment && (
        <Dialog open={previewDialogOpen} onOpenChange={setPreviewDialogOpen}>
          <DialogContent className="sm:max-w-3xl">
            <DialogHeader>
              <DialogTitle className="truncate">{selectedAttachment.originalName}</DialogTitle>
            </DialogHeader>
            
            <div className="flex flex-col items-center justify-center py-4">
              {loadingPreview ? (
                <div className="w-full h-[60vh] flex items-center justify-center">
                  <Skeleton className="h-full w-full rounded-md" />
                </div>
              ) : isFilePreviewable(selectedAttachment.fileType) && previewUrl ? (
                <div className="w-full max-h-[60vh] overflow-hidden flex items-center justify-center">
                  {selectedAttachment.fileType.startsWith('image/') ? (
                    <img 
                      src={previewUrl} 
                      alt={selectedAttachment.originalName}
                      className="max-w-full max-h-[60vh] object-contain" 
                    />
                  ) : (
                    <div className="w-full h-[60vh] border rounded">
                      <iframe 
                        src={previewUrl} 
                        title={selectedAttachment.originalName}
                        className="w-full h-full"
                      />
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12">
                  <FileTypeIcon fileType={selectedAttachment.fileType} size={64} />
                  <p className="mt-4">This file type cannot be previewed</p>
                  <Button 
                    onClick={() => handleDownload(selectedAttachment)}
                    className="mt-4"
                    disabled={downloadingId === selectedAttachment.id}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    {downloadingId === selectedAttachment.id ? 'Downloading...' : 'Download File'}
                  </Button>
                </div>
              )}
            </div>
            
            <div className="text-sm text-muted-foreground">
              <p>Size: {formatFileSize(selectedAttachment.fileSize)}</p>
              <p>Uploaded: {format(new Date(selectedAttachment.createdAt), 'MMM d, yyyy')}</p>
              {selectedAttachment.description && (
                <p className="mt-2">{selectedAttachment.description}</p>
              )}
            </div>
            
            <DialogFooter>
              <Button 
                onClick={() => handleDownload(selectedAttachment)}
                disabled={downloadingId === selectedAttachment.id}
              >
                <Download className="mr-2 h-4 w-4" />
                {downloadingId === selectedAttachment.id ? 'Downloading...' : 'Download'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Versions Dialog */}
      {selectedAttachment && (
        <Dialog open={versionDialogOpen} onOpenChange={setVersionDialogOpen}>
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>File Versions</DialogTitle>
            </DialogHeader>
            
            <div className="py-4">
              <div className="flex items-center gap-2 mb-4">
                <FileTypeIcon fileType={selectedAttachment.fileType} size={32} />
                <div>
                  <h3 className="font-medium truncate">{selectedAttachment.originalName}</h3>
                  <p className="text-sm text-muted-foreground">
                    {versions.length} version{versions.length !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
              
              <ScrollArea className="h-[300px]">
                {loadingVersions ? (
                  <div className="space-y-4">
                    {Array(3).fill(0).map((_, i) => (
                      <div key={i} className="flex items-center gap-4">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-[200px]" />
                          <Skeleton className="h-3 w-[100px]" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Version</TableHead>
                        <TableHead>Uploaded</TableHead>
                        <TableHead>Size</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {versions.map((version) => (
                        <TableRow key={version.id} className={version.isLatestVersion ? 'bg-muted/50' : ''}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              v{version.versionNumber}
                              {version.isLatestVersion && (
                                <Badge variant="secondary" className="ml-2">Latest</Badge>
                              )}
                            </div>
                            {version.versionComment && (
                              <p className="text-sm text-muted-foreground mt-1 truncate max-w-[200px]">
                                {version.versionComment}
                              </p>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span>{format(new Date(version.createdAt), 'MMM d, yyyy')}</span>
                              <span className="text-sm text-muted-foreground">
                                {version.uploader?.name || 'Unknown'}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>{formatFileSize(version.fileSize)}</TableCell>
                          <TableCell>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => handleDownload(version)}
                              disabled={downloadingId === version.id}
                            >
                              <Download className="h-4 w-4 mr-2" />
                              {downloadingId === version.id ? 'Downloading...' : 'Download'}
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </ScrollArea>
            </div>
            
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setVersionDialogOpen(false)}
              >
                Close
              </Button>
              <Button
                onClick={() => {
                  setVersionDialogOpen(false);
                  setUploadDialogOpen(true);
                }}
              >
                <Upload className="mr-2 h-4 w-4" />
                Upload New Version
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
} 