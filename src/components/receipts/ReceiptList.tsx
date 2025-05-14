import React, { useState } from "react";
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
import { Download, Eye, FileText, Printer } from "lucide-react";
import ReceiptViewer from "./ReceiptViewer";

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

const ReceiptList: React.FC = () => {
  const { state } = useCostManagement();
  const { receipts, payments, invoices } = state;
  const [selectedReceipt, setSelectedReceipt] = useState<string | null>(null);

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

  // Get payment method by payment ID
  const getPaymentMethod = (paymentId: string) => {
    const payment = payments.find(p => p.id === paymentId);
    if (!payment) return "Unknown";
    
    const methodMap: Record<string, string> = {
      cash: "Cash",
      credit: "Credit Card",
      bank_transfer: "Bank Transfer",
      check: "Check",
      other: "Other"
    };
    
    return methodMap[payment.method] || payment.method;
  };

  // View receipt
  const handleViewReceipt = (receiptId: string) => {
    setSelectedReceipt(receiptId);
  };

  // Download receipt
  const handleDownloadReceipt = (receiptId: string) => {
    // In a real app, this would generate and download a PDF
    alert("This would download a PDF receipt in a real application.");
  };

  // Sort receipts by date (newest first)
  const sortedReceipts = [...receipts].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  if (receipts.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-gray-500">No receipts generated yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Receipt ID</TableHead>
            <TableHead>Invoice</TableHead>
            <TableHead>Client</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Payment Method</TableHead>
            <TableHead>Format</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedReceipts.map((receipt) => (
            <TableRow key={receipt.id}>
              <TableCell>{formatDate(receipt.date)}</TableCell>
              <TableCell>
                <Badge variant="outline" className="font-mono">
                  {receipt.id.substring(0, 8)}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge variant="outline">
                  {getInvoiceNumber(receipt.invoiceId)}
                </Badge>
              </TableCell>
              <TableCell>{getClientName(receipt.invoiceId)}</TableCell>
              <TableCell>{formatCurrency(receipt.amount)}</TableCell>
              <TableCell>{getPaymentMethod(receipt.paymentId)}</TableCell>
              <TableCell>
                <Badge variant={receipt.format === "pdf" ? "default" : "secondary"}>
                  {receipt.format.toUpperCase()}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="flex items-center gap-1"
                    onClick={() => handleViewReceipt(receipt.id)}
                  >
                    <Eye className="h-4 w-4" />
                    View
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="flex items-center gap-1"
                    onClick={() => handleDownloadReceipt(receipt.id)}
                  >
                    <Download className="h-4 w-4" />
                    {receipt.format === "pdf" ? "Download" : "Export"}
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Receipt Viewer Dialog */}
      {selectedReceipt && (
        <ReceiptViewer 
          receiptId={selectedReceipt} 
          open={!!selectedReceipt}
          onClose={() => setSelectedReceipt(null)}
        />
      )}
    </div>
  );
};

export default ReceiptList;
