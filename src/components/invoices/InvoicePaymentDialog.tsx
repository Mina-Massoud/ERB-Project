import React, { useState } from "react";
import { useCostManagement } from "@/provider/cost-management-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { CheckCircle, DollarSign } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

// Define invoice type
interface Invoice {
  id: string;
  invoiceNumber: string;
  clientId: string;
  items: any[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  taxRegion?: string;
  discountRate: number;
  discountAmount: number;
  total: number;
  dueDate: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

// Define payment method type
type PaymentMethod = "cash" | "credit" | "bank_transfer" | "check" | "other";

interface InvoicePaymentDialogProps {
  invoice: Invoice;
  onPaymentLogged?: () => void;
}

const InvoicePaymentDialog: React.FC<InvoicePaymentDialogProps> = ({ 
  invoice,
  onPaymentLogged
}) => {
  const { logPayment, generateReceipt, state } = useCostManagement();
  
  // State for payment dialog
  const [isOpen, setIsOpen] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState<string>(invoice.total.toString());
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("credit");
  const [paymentDate, setPaymentDate] = useState<string>(format(new Date(), "yyyy-MM-dd"));
  const [paymentNotes, setPaymentNotes] = useState<string>("");
  const [generateDigitalReceipt, setGenerateDigitalReceipt] = useState<boolean>(true);
  const [showPaymentSuccess, setShowPaymentSuccess] = useState<boolean>(false);
  const [newPaymentId, setNewPaymentId] = useState<string>("");

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  // Calculate remaining balance
  const calculateRemainingBalance = () => {
    const existingPayments = state.payments.filter(p => p.invoiceId === invoice.id);
    const totalPaid = existingPayments.reduce((sum, p) => sum + p.amount, 0);
    return invoice.total - totalPaid;
  };

  // Start payment process
  const startPaymentProcess = () => {
    const remainingBalance = calculateRemainingBalance();
    setPaymentAmount(remainingBalance.toString());
    setPaymentDate(format(new Date(), "yyyy-MM-dd"));
    setIsOpen(true);
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!paymentAmount || !paymentDate || !paymentMethod) {
      alert("Please fill in all required fields");
      return;
    }

    const amount = parseFloat(paymentAmount);
    if (isNaN(amount) || amount <= 0) {
      alert("Please enter a valid payment amount");
      return;
    }

    // Log the payment
    logPayment(
      invoice.id,
      amount,
      paymentMethod,
      paymentDate,
      paymentNotes
    );

    toast.success('Payment completed successfully!');

    // Find the newly created payment
    setTimeout(() => {
      const newPayment = state.payments
        .filter(p => p.invoiceId === invoice.id)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
      
      if (newPayment && generateDigitalReceipt) {
        setNewPaymentId(newPayment.id);
        generateReceipt(invoice.id, newPayment.id, "digital");
      }
      
      setShowPaymentSuccess(true);
      
      // Reset form after 3 seconds and close dialog
      setTimeout(() => {
        setShowPaymentSuccess(false);
        setIsOpen(false);
        setPaymentMethod("credit");
        setPaymentAmount("");
        setPaymentDate(format(new Date(), "yyyy-MM-dd"));
        setPaymentNotes("");
        setNewPaymentId("");
        
        // Call the callback if provided
        if (onPaymentLogged) {
          onPaymentLogged();
        }
      }, 3000);
    }, 100);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={startPaymentProcess}
          className="flex items-center gap-1"
        >
          <DollarSign className="h-4 w-4" />
          Log Payment
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Log Payment for Invoice</DialogTitle>
          <DialogDescription>
            Record a payment for invoice {invoice.invoiceNumber} ({formatCurrency(invoice.total)})
          </DialogDescription>
        </DialogHeader>
        
        {showPaymentSuccess ? (
          <Alert className="">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertTitle>Payment Logged Successfully!</AlertTitle>
            <AlertDescription>
              {generateDigitalReceipt && newPaymentId ? 
                "A digital receipt has been generated for this payment." : 
                "The payment has been recorded."}
            </AlertDescription>
          </Alert>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="payment-amount">Payment Amount</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                    <Input
                      id="payment-amount"
                      value={paymentAmount}
                      onChange={(e) => setPaymentAmount(e.target.value)}
                      placeholder="0.00"
                      className="pl-8"
                      required
                      type="number"
                      step="0.01"
                      min="0.01"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="payment-date">Payment Date</Label>
                  <Input
                    id="payment-date"
                    value={paymentDate}
                    onChange={(e) => setPaymentDate(e.target.value)}
                    type="date"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="payment-method">Payment Method</Label>
                <Select
                  value={paymentMethod}
                  onValueChange={(value: PaymentMethod) => setPaymentMethod(value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select payment method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="credit">Credit Card</SelectItem>
                    <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                    <SelectItem value="check">Check</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="payment-notes">Notes (Optional)</Label>
                <Textarea
                  id="payment-notes"
                  value={paymentNotes}
                  onChange={(e) => setPaymentNotes(e.target.value)}
                  placeholder="Add any additional notes about this payment"
                  rows={3}
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="generate-receipt"
                  checked={generateDigitalReceipt}
                  onChange={(e) => setGenerateDigitalReceipt(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <Label htmlFor="generate-receipt" className="text-sm font-normal">
                  Generate digital receipt for this payment
                </Label>
              </div>
              
              <div className="rounded-md bg-blue-50 p-4 mt-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <DollarSign className="h-5 w-5 text-blue-400" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-blue-800">Payment Summary</h3>
                    <div className="mt-2 text-sm text-blue-700">
                      <p>Invoice Total: {formatCurrency(invoice.total)}</p>
                      <p>Remaining Balance: {formatCurrency(calculateRemainingBalance())}</p>
                      {parseFloat(paymentAmount) > 0 && (
                        <p>
                          After this payment: {formatCurrency(calculateRemainingBalance() - parseFloat(paymentAmount))}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
              <Button type="submit">Log Payment</Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default InvoicePaymentDialog;
