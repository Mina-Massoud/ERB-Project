import React, { useState } from "react";
import { useCostManagement } from "@/provider/cost-management-provider";
import { Button } from "@/components/ui/button";
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import InvoiceDetails from "./InvoiceDetails";
import InvoiceEditDialog from "./InvoiceEditDialog";
import InvoiceReminderDialog from "./InvoiceReminderDialog";
import InvoicePaymentDialog from "./InvoicePaymentDialog";

// Define a client type for demo purposes
interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
}

// Mock clients for demo
const mockClients: Client[] = [
  { id: "client1", name: "Acme Corporation", email: "billing@acme.com", phone: "555-123-4567" },
  { id: "client2", name: "Globex Industries", email: "accounts@globex.com", phone: "555-987-6543" },
  { id: "client3", name: "Stark Enterprises", email: "finance@stark.com", phone: "555-789-0123" },
];

const InvoiceList: React.FC = () => {
  const { state, updateInvoiceStatus } = useCostManagement();
  const { invoices } = state;

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  // Get status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-200 text-gray-800';
      case 'sent':
        return 'bg-blue-200 text-blue-800';
      case 'paid':
        return 'bg-green-200 text-green-800';
      case 'partially_paid':
        return 'bg-yellow-200 text-yellow-800';
      case 'overdue':
        return 'bg-red-200 text-red-800';
      case 'cancelled':
        return 'bg-gray-200 text-gray-800 line-through';
      default:
        return 'bg-gray-200 text-gray-800';
    }
  };

  // Get client name by ID
  const getClientName = (clientId: string) => {
    const client = mockClients.find(c => c.id === clientId);
    return client ? client.name : 'Unknown Client';
  };

  if (invoices.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-gray-500">No invoices found. Create your first invoice to get started.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Accordion type="single" collapsible className="w-full">
        {invoices.map((invoice) => (
          <AccordionItem key={invoice.id} value={invoice.id}>
            <AccordionTrigger className="px-4 py-2 rounded-md">
              <div className="flex flex-1 justify-between items-center">
                <div className="flex items-center space-x-4">
                  <div className="font-medium">{invoice.invoiceNumber}</div>
                  <div>{getClientName(invoice.clientId)}</div>
                </div>
                <div className="flex items-center space-x-4">
                  <div>{formatCurrency(invoice.total)}</div>
                  <div>Due: {formatDate(invoice.dueDate)}</div>
                  <Badge className={getStatusColor(invoice.status)}>
                    {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1).replace('_', ' ')}
                  </Badge>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 py-2">
              <div className="space-y-4">
                <InvoiceDetails invoice={invoice} formatCurrency={formatCurrency} formatDate={formatDate} getClientName={getClientName} />
                
                <div className="flex flex-wrap gap-2">
                  <InvoiceEditDialog invoice={invoice} />
                  
                  <InvoiceReminderDialog invoice={invoice} />
                  
                  {/* Add the new Payment Dialog component */}
                  {invoice.status !== 'cancelled' && invoice.status !== 'paid' && (
                    <InvoicePaymentDialog 
                      invoice={invoice} 
                      onPaymentLogged={() => {
                        // This will refresh the component when payment is logged
                        // In a real app, you might want to fetch updated data from an API
                      }}
                    />
                  )}
                  
                  <div className="flex flex-wrap gap-2">
                    {invoice.status === 'draft' && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => updateInvoiceStatus(invoice.id, 'sent')}
                      >
                        Mark as Sent
                      </Button>
                    )}
                    
                    {invoice.status !== 'cancelled' && invoice.status !== 'paid' && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => updateInvoiceStatus(invoice.id, 'cancelled')}
                      >
                        Cancel Invoice
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
};

export default InvoiceList;
