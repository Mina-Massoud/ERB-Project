import React, { useState } from "react";
import { useCostManagement } from "@/provider/cost-management-provider";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, FileText, Printer } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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

interface ReceiptPreviewProps {
  paymentId: string;
  open: boolean;
  onClose: () => void;
}

const ReceiptPreview: React.FC<ReceiptPreviewProps> = ({ 
  paymentId, 
  open, 
  onClose 
}) => {
  const { state, generateReceipt } = useCostManagement();
  const { payments, invoices, receipts } = state;
  const [activeTab, setActiveTab] = useState<"digital" | "pdf">("digital");
  
  // Find the payment
  const payment = payments.find(p => p.id === paymentId);
  if (!payment) return null;
  
  // Find related invoice
  const invoice = invoices.find(i => i.id === payment.invoiceId);
  if (!invoice) return null;
  
  // Find client
  const client = mockClients.find(c => c.id === invoice.clientId);
  
  // Find receipt if it exists
  const receipt = receipts.find(r => r.paymentId === paymentId);
  
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
  
  // Generate receipt if it doesn't exist
  const handleGenerateReceipt = (format: "pdf" | "digital") => {
    generateReceipt(invoice.id, payment.id, format);
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Receipt Preview</DialogTitle>
          <DialogDescription>
            View receipt for payment on invoice {invoice.invoiceNumber}
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="digital" value={activeTab} onValueChange={(value) => setActiveTab(value as "digital" | "pdf")}>
          <div className="flex justify-between items-center mb-4">
            <TabsList>
              <TabsTrigger value="digital">Digital View</TabsTrigger>
              <TabsTrigger value="pdf">PDF View</TabsTrigger>
            </TabsList>
            
            <div className="flex gap-2">
              {!receipt && (
                <Button 
                  variant="outline" 
                  size="sm"
                  className="flex items-center gap-1"
                  onClick={() => handleGenerateReceipt(activeTab)}
                >
                  <FileText className="h-4 w-4" />
                  Generate {activeTab.toUpperCase()} Receipt
                </Button>
              )}
              <Button 
                variant="outline" 
                size="sm"
                className="flex items-center gap-1"
                onClick={handlePrintReceipt}
              >
                <Printer className="h-4 w-4" />
                Print
              </Button>
              <Button 
                size="sm"
                className="flex items-center gap-1"
                onClick={handleDownloadReceipt}
              >
                <Download className="h-4 w-4" />
                Download
              </Button>
            </div>
          </div>
          
          <TabsContent value="digital" className="mt-0">
            <div className="receipt-container p-6 border rounded-lg bg-white" id="digital-receipt">
              {/* Digital Receipt Header */}
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h2 className="text-2xl font-bold">{companyInfo.name}</h2>
                  <p className="text-gray-600">{companyInfo.address}</p>
                  <p className="text-gray-600">{companyInfo.city}</p>
                  <p className="text-gray-600">{companyInfo.phone}</p>
                </div>
                <div className="text-right">
                  <h1 className="text-3xl font-bold text-primary">RECEIPT</h1>
                  <p className="text-gray-600">Receipt #: {receipt?.id.substring(0, 8) || "PREVIEW"}</p>
                  <p className="text-gray-600">Date: {formatDate(payment.date)}</p>
                </div>
              </div>
              
              {/* Client Info */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold mb-2">Bill To:</h3>
                <p className="font-medium">{client?.name}</p>
                {client?.address && <p className="text-gray-600">{client.address}</p>}
                <p className="text-gray-600">{client?.email}</p>
              </div>
              
              {/* Payment Details */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold mb-2">Payment Details:</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-600">Invoice Number:</p>
                    <p className="font-medium">{invoice.invoiceNumber}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Payment Method:</p>
                    <p className="font-medium">{getPaymentMethodDisplay(payment.method)}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Payment Date:</p>
                    <p className="font-medium">{formatDate(payment.date)}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Amount Paid:</p>
                    <p className="font-medium">{formatCurrency(payment.amount)}</p>
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
          </TabsContent>
          
          <TabsContent value="pdf" className="mt-0">
            <div className="receipt-container p-6 border rounded-lg bg-white" id="pdf-receipt">
              {/* PDF Receipt - More formal layout */}
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h2 className="text-2xl font-bold">{companyInfo.name}</h2>
                  <p className="text-gray-600">{companyInfo.address}</p>
                  <p className="text-gray-600">{companyInfo.city}</p>
                  <p className="text-gray-600">Tax ID: {companyInfo.taxId}</p>
                </div>
                <div className="text-right">
                  <h1 className="text-3xl font-bold text-primary">PAYMENT RECEIPT</h1>
                  <p className="text-gray-600">Receipt #: {receipt?.id.substring(0, 8) || "PREVIEW"}</p>
                  <p className="text-gray-600">Date Issued: {formatDate(new Date().toISOString())}</p>
                  <p className="text-gray-600">Payment Date: {formatDate(payment.date)}</p>
                </div>
              </div>
              
              {/* Client Info */}
              <div className="mb-8 p-4 bg-gray-50 rounded-md">
                <h3 className="text-lg font-semibold mb-2">Client Information:</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-600">Name:</p>
                    <p className="font-medium">{client?.name}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Email:</p>
                    <p className="font-medium">{client?.email}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Phone:</p>
                    <p className="font-medium">{client?.phone}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Address:</p>
                    <p className="font-medium">{client?.address || "N/A"}</p>
                  </div>
                </div>
              </div>
              
              {/* Invoice Reference */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold mb-2">Invoice Reference:</h3>
                <table className="min-w-full border">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="py-2 px-4 border text-left">Invoice Number</th>
                      <th className="py-2 px-4 border text-left">Invoice Date</th>
                      <th className="py-2 px-4 border text-left">Due Date</th>
                      <th className="py-2 px-4 border text-left">Total Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="py-2 px-4 border">{invoice.invoiceNumber}</td>
                      <td className="py-2 px-4 border">{formatDate(invoice.createdAt)}</td>
                      <td className="py-2 px-4 border">{formatDate(invoice.dueDate)}</td>
                      <td className="py-2 px-4 border">{formatCurrency(invoice.total)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              
              {/* Payment Details */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold mb-2">Payment Details:</h3>
                <table className="min-w-full border">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="py-2 px-4 border text-left">Payment Method</th>
                      <th className="py-2 px-4 border text-left">Payment Date</th>
                      <th className="py-2 px-4 border text-left">Amount Paid</th>
                      <th className="py-2 px-4 border text-left">Payment Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="py-2 px-4 border">{getPaymentMethodDisplay(payment.method)}</td>
                      <td className="py-2 px-4 border">{formatDate(payment.date)}</td>
                      <td className="py-2 px-4 border">{formatCurrency(payment.amount)}</td>
                      <td className="py-2 px-4 border">
                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                          Completed
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              
              {/* Notes */}
              {payment.notes && (
                <div className="mb-8 p-4 border border-gray-200 rounded-md">
                  <h3 className="text-lg font-semibold mb-2">Additional Notes:</h3>
                  <p className="text-gray-600">{payment.notes}</p>
                </div>
              )}
              
              {/* Legal Footer */}
              <div className="mt-12 pt-4 border-t">
                <p className="text-sm text-gray-500">This receipt serves as confirmation of payment received. Please retain this document for your records.</p>
                <div className="flex justify-between items-center mt-4">
                  <p className="text-sm text-gray-500">Receipt generated on: {formatDate(new Date().toISOString())} at {formatTime(new Date().toISOString())}</p>
                  <p className="text-sm text-gray-500">Page 1 of 1</p>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default ReceiptPreview;
