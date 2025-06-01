import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AttachmentList } from '@/components/attachment-list';

interface ProjectDetailsProps {
  project: any;
}

export function ProjectDetails({ project }: ProjectDetailsProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Project: {project?.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="tasks">Tasks</TabsTrigger>
              <TabsTrigger value="budget">Budget</TabsTrigger>
              <TabsTrigger value="attachments">Attachments</TabsTrigger>
              <TabsTrigger value="team">Team</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="pt-4">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Description</h3>
                <p>{project?.description || 'No description provided.'}</p>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground">Start Date</h4>
                    <p>{new Date(project?.startDate).toLocaleDateString() || 'Not set'}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground">End Date</h4>
                    <p>{new Date(project?.endDate).toLocaleDateString() || 'Not set'}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground">Status</h4>
                    <p>{project?.status || 'Not set'}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground">Client</h4>
                    <p>{project?.client?.name || 'No client'}</p>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="tasks" className="pt-4">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Tasks</h3>
                <p>Task list would go here.</p>
              </div>
            </TabsContent>
            
            <TabsContent value="budget" className="pt-4">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Budget</h3>
                <p>Budget information would go here.</p>
              </div>
            </TabsContent>
            
            <TabsContent value="attachments" className="pt-4">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Project Attachments</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Upload, manage and access project documents and files
                </p>
                
                {/* Attachment List Component */}
                <AttachmentList
                  entityType="projects"
                  entityId={project?.id}
                  onUploadSuccess={() => {
                    console.log('File uploaded successfully');
                  }}
                  className="mt-4"
                />
              </div>
            </TabsContent>
            
            <TabsContent value="team" className="pt-4">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Team Members</h3>
                <p>Team members would be listed here.</p>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
} 