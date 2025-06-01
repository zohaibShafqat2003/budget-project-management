"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AttachmentList } from '@/components/attachment-list';
import { toast } from 'sonner';

interface ProjectAttachmentsProps {
  projectId: string;
}

export function ProjectAttachments({ projectId }: ProjectAttachmentsProps) {
  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Project Attachments</CardTitle>
      </CardHeader>
      <CardContent>
        <AttachmentList
          entityType="projects"
          entityId={projectId}
          onUploadSuccess={() => {
            toast.success("File uploaded successfully");
          }}
        />
      </CardContent>
    </Card>
  );
} 