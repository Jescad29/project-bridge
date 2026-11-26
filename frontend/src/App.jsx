import { Toaster } from "@/components/ui/sonner";
import { AppRouter } from "@/routes/AppRouter";

export default function App() {
  return (
    <>
      <AppRouter />
      <Toaster richColors position="bottom-right" />
    </>
  );
}