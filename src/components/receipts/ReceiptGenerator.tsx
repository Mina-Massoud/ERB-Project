import React, { useState } from "react";
import { useCostManagement } from "@/provider/cost-management-provider";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle, FileText, Plus } from "lucide-react";

interface ReceiptGeneratorProps {
  onReceiptGenerated?: () => void;
}

const ReceiptGenerator: React.FC<ReceiptGeneratorProps> = ({ 
  onReceiptGenerated
}) => {
  const { generateReceipt, state } = useCostManagement();
  const { payments, receipts, invoices } = state;
  
  // State for receipt dialog
  const [isOpen, setIsOpen] = useState(false);
  const [selectedPaymentId, setSelectedPaymentId] = useState<string>("");
  const [receiptFormat, setReceiptFormat] = useState<"pdf" | "digital">("digital");
  const [showSuccess, setShowSuccess] = useState<boolean>(false);

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

  // Get payments without receipts
  const getPaymentsWithoutReceipts = () => {
    const paymentsWithReceipts = receipts.map(r => r.paymentId);
    return payments.filter(p => !paymentsWithReceipts.includes(p.id));
  };

  // Get invoice number by ID
  const getInvoiceNumber = (invoiceId: string) => {
    const invoice = invoices.find(inv => inv.id === invoiceId);
    return invoice ? invoice.invoiceNumber : "Unknown";
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

  // Start receipt generation process
  const startReceiptGeneration = () => {
    setSelectedPaymentId("");
    setReceiptFormat("digital");
    setIsOpen(true);
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedPaymentId) {
      alert("Please select a payment");
      return;
    }

    // Find the payment to get the invoice ID
    const payment = payments.find(p => p.id === selectedPaymentId);
    if (!payment) return;

    // Generate the receipt
    generateReceipt(
      payment.invoiceId,
      selectedPaymentId,
      receiptFormat
    );

    setShowSuccess(true);
    
    // Reset form after 2 seconds and close dialog
    setTimeout(() => {
      setShowSuccess(false);
      setIsOpen(false);
      setSelectedPaymentId("");
      setReceiptFormat("digital");
      
      // Call the callback if provided
      if (onReceiptGenerated) {
        onReceiptGenerated();
      }
    }, 2000);
  };

  const paymentsWithoutReceipts = getPaymentsWithoutReceipts();

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          onClick={startReceiptGeneration}
          className="flex items-center gap-1"
        >
          <Plus className="h-4 w-4" />
          Generate Receipt
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Generate Receipt</DialogTitle>
          <DialogDescription>
            Create a receipt for a payment that doesn't have one
          </DialogDescription>
        </DialogHeader>
        
        {showSuccess ? (
          <Alert>
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertTitle>Receipt Generated!</AlertTitle>
            <AlertDescription>
              The receipt has been successfully generated.
            </AlertDescription>
          </Alert>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="payment-select">Select Payment</Label>
                <Select
                  value={selectedPaymentId}
                  onValueChange={setSelectedPaymentId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a payment" />
                  </SelectTrigger>
                  <SelectContent>
                    {paymentsWithoutReceipts.length === 0 ? (
                      <div className="p-2 text-sm text-gray-500">All payments have receipts</div>
                    ) : (
                      paymentsWithoutReceipts.map(payment => (
                        <SelectItem key={payment.id} value={payment.id}>
                          {getInvoiceNumber(payment.invoiceId)} - {formatCurrency(payment.amount)} ({formatDate(payment.date)})
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
              
              {selectedPaymentId && (
                <div className="space-y-2">
                  <Label htmlFor="receipt-format">Receipt Format</Label>
                  <Select
                    value={receiptFormat}
                    onValueChange={(value: "pdf" | "digital") => setReceiptFormat(value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select format" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="digital">Digital</SelectItem>
                      <SelectItem value="pdf">PDF</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
              
              {selectedPaymentId && (
                <div className="rounded-md bg-blue-50 p-4 mt-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <FileText className="h-5 w-5 text-blue-400" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-blue-800">Payment Information</h3>
                      <div className="mt-2 text-sm text-blue-700">
                        {(() => {
                          const payment = payments.find(p => p.id === selectedPaymentId);
                          if (!payment) return null;
                          
                          return (
                            <>
                              <p>Invoice: {getInvoiceNumber(payment.invoiceId)}</p>
                              <p>Amount: {formatCurrency(payment.amount)}</p>
                              <p>Date: {formatDate(payment.date)}</p>
                              <p>Method: {getPaymentMethodDisplay(payment.method)}</p>
                            </>
                          );
                        })()}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
              <Button 
                type="submit"
                disabled={!selectedPaymentId}
              >
                Generate Receipt
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ReceiptGenerator;
