import { ProjectTeamClient } from "./project-team-client"

export default function ProjectTeamPage({ params }: { params: { id: string } }) {
  // This is a server component that receives params directly from Next.js
  return <ProjectTeamClient id={params.id} />
} 