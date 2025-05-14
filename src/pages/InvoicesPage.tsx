import React from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import InvoiceForm from "@/components/invoices/InvoiceForm";
import InvoiceList from "@/components/invoices/InvoiceList";
import { useCostManagement } from "@/provider/cost-management-provider";

const InvoicesPage: React.FC = () => {
  const { updateInvoiceForm } = useCostManagement();
  
  const handleInvoiceCreated = () => {
    // Reset the form in the provider after successful creation
    updateInvoiceForm({
      clientId: "",
      invoiceItems: [{ name: "", quantity: 1, unitPrice: 0 }],
      taxRate: "0",
      useTaxRegion: false,
      taxRegion: "usa",
      discountRate: "0",
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    });
  };

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Invoice Management</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* View Invoices Section */}
        <Card className="h-fit">
          <CardHeader>
            <CardTitle>Your Invoices</CardTitle>
            <CardDescription>
              Manage your existing invoices
            </CardDescription>
          </CardHeader>
          <CardContent>
            <InvoiceList />
          </CardContent>
        </Card>
        
        {/* Create Invoice Section */}
        <Card className="h-fit">
          <CardHeader>
            <CardTitle>Create New Invoice</CardTitle>
            <CardDescription>
              Generate a new invoice for a client
            </CardDescription>
          </CardHeader>
          <CardContent>
            <InvoiceForm onInvoiceCreated={handleInvoiceCreated} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default InvoicesPage;