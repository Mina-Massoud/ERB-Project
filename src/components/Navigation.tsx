import React from "react";
import { useCostManagement } from "@/provider/cost-management-provider";
import { Button } from "@/components/ui/button";

const Navigation: React.FC = () => {
  const { state, setActivePage } = useCostManagement();
  const { activePage } = state;

  const navItems = [
    { id: "costEntry", label: "Cost Entry" },
    { id: "invoices", label: "Invoices" },
    { id: "payments", label: "Payments" },
    { id: "receipts", label: "Receipts" },
  ];

  return (
    <div className="p-6">
      <div className="container mx-auto">
        <div className="flex flex-wrap gap-2">
          {navItems.map((item) => (
            <Button
              key={item.id}
              variant={activePage === item.id ? "default" : "outline"}
              onClick={() => setActivePage(item.id as any)}
            >
              {item.label}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Navigation;
