import React from "react";
import { useCostManagement } from "@/provider/cost-management-provider";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Printer } from "lucide-react";

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

const PaymentList: React.FC = () => {
  const { state, generateReceipt } = useCostManagement();
  const { payments, invoices, receipts } = state;

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

  // Get payment method display name
  const getPaymentMethodDisplay = (method: string) => {
    const methodMap: Record<string, string> = {
      cash: "Cash",
      credit: "Credit Card",
      bank_transfer: "Bank Transfer",
      check: "Check",
      other: "Other"
    };
    return methodMap[method] || method;
  };

  // Get invoice number by ID
  const getInvoiceNumber = (invoiceId: string) => {
    const invoice = invoices.find(inv => inv.id === invoiceId);
    return invoice ? invoice.invoiceNumber : "Unknown";
  };

  // Get client name by invoice ID
  const getClientName = (invoiceId: string) => {
    const invoice = invoices.find(inv => inv.id === invoiceId);
    if (!invoice) return "Unknown Client";
    
    const client = mockClients.find(c => c.id === invoice.clientId);
    return client ? client.name : "Unknown Client";
  };

  // Check if receipt exists for payment
  const hasReceipt = (paymentId: string) => {
    return receipts.some(r => r.paymentId === paymentId);
  };

  // Generate a receipt for a payment
  const handleGenerateReceipt = (invoiceId: string, paymentId: string) => {
    generateReceipt(invoiceId, paymentId, "digital");
  };

  // Sort payments by date (newest first)
  const sortedPayments = [...payments].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  if (payments.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-gray-500">No payments recorded yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Invoice</TableHead>
            <TableHead>Client</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Method</TableHead>
            <TableHead>Notes</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedPayments.map((payment) => (
            <TableRow key={payment.id}>
              <TableCell>{formatDate(payment.date)}</TableCell>
              <TableCell>
                <Badge variant="outline">
                  {getInvoiceNumber(payment.invoiceId)}
                </Badge>
              </TableCell>
              <TableCell>{getClientName(payment.invoiceId)}</TableCell>
              <TableCell>{formatCurrency(payment.amount)}</TableCell>
              <TableCell>{getPaymentMethodDisplay(payment.method)}</TableCell>
              <TableCell className="max-w-xs truncate">
                {payment.notes || "-"}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  {hasReceipt(payment.id) ? (
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="flex items-center gap-1"
                    >
                      <FileText className="h-4 w-4" />
                      View Receipt
                    </Button>
                  ) : (
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="flex items-center gap-1"
                      onClick={() => handleGenerateReceipt(payment.invoiceId, payment.id)}
                    >
                      <Printer className="h-4 w-4" />
                      Generate Receipt
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default PaymentList;
