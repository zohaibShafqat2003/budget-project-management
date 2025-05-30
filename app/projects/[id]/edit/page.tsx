import { EditProjectClient } from "./edit-project-client"

export default function EditProjectPage({ params }: { params: { id: string } }) {
  // This is a server component that receives params directly from Next.js
  return <EditProjectClient id={params.id} />
} 