import React from "react";
import { useCostManagement } from "@/provider/cost-management-provider";
import CostEntryPage from "@/pages/CostEntryPage";
import InvoicesPage from "@/pages/InvoicesPage";
import PaymentsPage from "@/pages/PaymentsPage";
import ReceiptsPage from "@/pages/ReceiptsPage";

const PageRouter: React.FC = () => {
  const { state } = useCostManagement();
  const { activePage } = state;

  // Render the appropriate page based on the active page in state
  switch (activePage) {
    case "costEntry":
      return <CostEntryPage />;
    case "invoices":
      return <InvoicesPage />;
    case "payments":
      return <PaymentsPage />;
    case "receipts":
      return <ReceiptsPage />;
    case "reports":
      // Placeholder for future reports page
      return <div className="p-6">Reports page coming soon</div>;
    case "dashboard":
      // Placeholder for future dashboard page
      return <div className="p-6">Dashboard coming soon</div>;
    default:
      return <CostEntryPage />;
  }
};

export default PageRouter;
