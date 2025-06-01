import { ProjectAttachments } from "../components/project-attachments";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function ProjectAttachmentsPage({ params }: { params: { id: string } }) {
  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <Button variant="outline" asChild>
          <Link href={`/projects/${params.id}`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Project
          </Link>
        </Button>
      </div>
      
      <h1 className="text-2xl font-bold">Project Attachments</h1>
      <ProjectAttachments projectId={params.id} />
    </div>
  );
} 