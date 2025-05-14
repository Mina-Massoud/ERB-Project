import React from "react";
import { useCostManagement } from "@/provider/cost-management-provider";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, Printer } from "lucide-react";

// Define a client type for demo purposes
interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  address?: string;
}

// Mock clients for demo
const mockClients: Client[] = [
  { 
    id: "client1", 
    name: "Acme Corporation", 
    email: "billing@acme.com", 
    phone: "555-123-4567",
    address: "123 Main St, Anytown, USA 12345"
  },
  { 
    id: "client2", 
    name: "Globex Industries", 
    email: "accounts@globex.com", 
    phone: "555-987-6543",
    address: "456 Tech Blvd, Innovation City, USA 67890"
  },
  { 
    id: "client3", 
    name: "Stark Enterprises", 
    email: "finance@stark.com", 
    phone: "555-789-0123",
    address: "789 Tower Ave, Metropolis, USA 54321"
  },
];

// Company info
const companyInfo = {
  name: "Your Company",
  address: "1000 Business Ave, Suite 500",
  city: "San Francisco, CA 94107",
  phone: "(555) 555-5555",
  email: "billing@yourcompany.com",
  website: "www.yourcompany.com",
  taxId: "12-3456789"
};

interface ReceiptViewerProps {
  receiptId: string;
  open: boolean;
  onClose: () => void;
}

const ReceiptViewer: React.FC<ReceiptViewerProps> = ({ 
  receiptId, 
  open, 
  onClose 
}) => {
  const { state } = useCostManagement();
  const { receipts, payments, invoices } = state;
  
  // Find the receipt
  const receipt = receipts.find(r => r.id === receiptId);
  if (!receipt) return null;
  
  // Find related payment and invoice
  const payment = payments.find(p => p.id === receipt.paymentId);
  const invoice = invoices.find(i => i.id === receipt.invoiceId);
  if (!payment || !invoice) return null;
  
  // Find client
  const client = mockClients.find(c => c.id === invoice.clientId);
  
  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };
  
  // Format time
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString();
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
  
  // Print receipt
  const handlePrintReceipt = () => {
    window.print();
  };
  
  // Download receipt as PDF
  const handleDownloadReceipt = () => {
    // In a real app, this would generate and download a PDF
    alert("This would download a PDF receipt in a real application.");
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Receipt #{receipt.id.substring(0, 8)}</DialogTitle>
          <DialogDescription>
            Payment receipt for invoice {invoice.invoiceNumber}
          </DialogDescription>
        </DialogHeader>
        
        <div className="receipt-container p-6 border rounded-lg" id="printable-receipt">
          {/* Receipt Header */}
          <div className="flex justify-between items-start mb-8">
            <div>
              <h2 className="text-2xl font-bold">{companyInfo.name}</h2>
              <p className="text-gray-600">{companyInfo.address}</p>
              <p className="text-gray-600">{companyInfo.city}</p>
              <p className="text-gray-600">{companyInfo.phone}</p>
              <p className="text-gray-600">{companyInfo.email}</p>
            </div>
            <div className="text-right">
              <h1 className="text-3xl font-bold text-primary">RECEIPT</h1>
              <p className="text-gray-600">Receipt #: {receipt.id.substring(0, 8)}</p>
              <p className="text-gray-600">Date: {formatDate(receipt.date)}</p>
              <p className="text-gray-600">Time: {formatTime(receipt.date)}</p>
            </div>
          </div>
          
          {/* Client Info */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-2">Bill To:</h3>
            <p className="font-medium">{client?.name}</p>
            {client?.address && <p className="text-gray-600">{client.address}</p>}
            <p className="text-gray-600">{client?.email}</p>
            <p className="text-gray-600">{client?.phone}</p>
          </div>
          
          {/* Invoice Reference */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-2">Payment Details:</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-gray-600">Invoice Number:</p>
                <p className="font-medium">{invoice.invoiceNumber}</p>
              </div>
              <div>
                <p className="text-gray-600">Invoice Date:</p>
                <p className="font-medium">{formatDate(invoice.createdAt)}</p>
              </div>
              <div>
                <p className="text-gray-600">Payment Method:</p>
                <p className="font-medium">{getPaymentMethodDisplay(payment.method)}</p>
              </div>
              <div>
                <p className="text-gray-600">Payment Date:</p>
                <p className="font-medium">{formatDate(payment.date)}</p>
              </div>
            </div>
          </div>
          
          {/* Payment Summary */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-2">Payment Summary:</h3>
            <div className="border-t border-b py-4">
              <div className="flex justify-between items-center">
                <p className="font-medium">Amount Paid:</p>
                <p className="font-bold text-xl">{formatCurrency(receipt.amount)}</p>
              </div>
            </div>
          </div>
          
          {/* Notes */}
          {payment.notes && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-2">Notes:</h3>
              <p className="text-gray-600">{payment.notes}</p>
            </div>
          )}
          
          {/* Footer */}
          <div className="text-center text-gray-500 mt-12">
            <p>Thank you for your business!</p>
            <p className="text-sm mt-2">{companyInfo.website} | {companyInfo.email}</p>
          </div>
        </div>
        
        {/* Actions */}
        <div className="flex justify-end gap-2 mt-4">
          <Button 
            variant="outline" 
            className="flex items-center gap-1"
            onClick={handlePrintReceipt}
          >
            <Printer className="h-4 w-4" />
            Print
          </Button>
          <Button 
            className="flex items-center gap-1"
            onClick={handleDownloadReceipt}
          >
            <Download className="h-4 w-4" />
            Download PDF
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ReceiptViewer;
