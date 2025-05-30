import { ProjectDetailClient } from "./project-detail-client"

export default function ProjectDetailPage({ params }: { params: { id: string } }) {
  // This is a server component that receives params directly from Next.js
  return <ProjectDetailClient id={params.id} />
} 