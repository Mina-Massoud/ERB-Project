import { CostManagementProvider } from "@/provider/cost-management-provider";
import Navigation from "@/components/Navigation";
import PageRouter from "@/components/PageRouter";
import { Toaster } from "./components/ui/sonner";

function App() {
  return (
    <CostManagementProvider>
      <Toaster richColors/>
      <div className="flex flex-col min-h-svh">
        <Navigation />
        <main className="flex-1">
          <PageRouter />
        </main>
      </div>
    </CostManagementProvider>
  )
}

export default App
