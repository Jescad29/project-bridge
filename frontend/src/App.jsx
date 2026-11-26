import { Toaster } from "@/components/ui/sonner";
import { ProjectsPage } from "./features/projects/pages/ProjectsPage";

export default function App() {
  return (
    <>
      <ProjectsPage />
      <Toaster richColors position="bottom-right" />
    </>
  );
}