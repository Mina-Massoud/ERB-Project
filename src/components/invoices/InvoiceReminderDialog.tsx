import React, { useState } from "react";
import { useCostManagement } from "@/provider/cost-management-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle } from "lucide-react";

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

interface InvoiceReminderDialogProps {
  invoice: Invoice;
}

const InvoiceReminderDialog: React.FC<InvoiceReminderDialogProps> = ({ invoice }) => {
  const { sendInvoiceReminder } = useCostManagement();
  
  // State for reminder dialog
  const [isOpen, setIsOpen] = useState(false);
  const [reminderType, setReminderType] = useState<"email" | "sms" | "in-app">("email");
  const [reminderContact, setReminderContact] = useState<string>("");
  const [reminderMessage, setReminderMessage] = useState<string>("");
  const [showReminderSent, setShowReminderSent] = useState<boolean>(false);

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

  // Generate reminder message based on invoice details
  const generateReminderMessage = () => {
    const client = mockClients.find(c => c.id === invoice.clientId);
    const dueDate = formatDate(invoice.dueDate);
    const amount = formatCurrency(invoice.total);
    const createdDate = formatDate(invoice.createdAt);
    const daysSinceDue = Math.floor((new Date().getTime() - new Date(invoice.dueDate).getTime()) / (1000 * 3600 * 24));
    
    let message = `Dear ${client?.name},\n\n`;
    
    // Customize message based on invoice status
    if (invoice.status === 'draft' || invoice.status === 'sent') {
      message += `This is a friendly reminder about invoice #${invoice.invoiceNumber} for ${amount} that was issued on ${createdDate} and is due for payment on ${dueDate}.\n\n`;
      message += `The invoice includes the following services:\n`;
      
      // Add invoice items if available
      if (invoice.items && invoice.items.length > 0) {
        invoice.items.forEach(item => {
          if (item.description && item.amount) {
            message += `- ${item.description}: ${formatCurrency(item.amount)}\n`;
          }
        });
      }
      
      message += `\nPlease ensure payment is made by the due date to avoid any late fees.`;
    } else if (invoice.status === 'overdue') {
      message += `We would like to bring to your attention that invoice #${invoice.invoiceNumber} for ${amount} is now overdue by ${daysSinceDue} days.\n\n`;
      message += `The payment was originally due on ${dueDate}.\n\n`;
      message += `Please process this payment as soon as possible. If you've already sent the payment, please disregard this reminder.\n\n`;
      message += `If you're experiencing any difficulties with the payment process or have any questions about this invoice, please don't hesitate to contact our accounting department.`;
    } else if (invoice.status === 'partially_paid') {
      message += `Thank you for your partial payment on invoice #${invoice.invoiceNumber}.\n\n`;
      message += `We appreciate your commitment to settling your account. However, we would like to remind you that there is still a remaining balance of ${amount} that was due on ${dueDate}.\n\n`;
      message += `Please arrange for the remaining payment at your earliest convenience.`;
    }
    
    message += `\n\nIf you have any questions or concerns, please don't hesitate to contact us.\n\n`;
    message += `Best regards,\nYour Company`;
    
    return message;
  };
  
  // Start reminder process
  const startReminderProcess = () => {
    const client = mockClients.find(c => c.id === invoice.clientId);
    setReminderContact(client?.email || "");
    setReminderMessage(generateReminderMessage());
    setIsOpen(true);
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!reminderContact || !reminderMessage) {
      alert("Please fill in all required fields");
      return;
    }

    sendInvoiceReminder(
      invoice.id,
      reminderType,
      reminderContact,
      reminderMessage
    );

    setShowReminderSent(true);
    
    // Reset form after 3 seconds and close dialog
    setTimeout(() => {
      setShowReminderSent(false);
      setIsOpen(false);
      setReminderType("email");
      setReminderContact("");
      setReminderMessage("");
    }, 3000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" onClick={startReminderProcess}>Send Reminder</Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Send Invoice Reminder</DialogTitle>
          <DialogDescription>
            Send a reminder to the client about invoice {invoice.invoiceNumber}.
          </DialogDescription>
        </DialogHeader>
        
        {showReminderSent ? (
          <Alert className="">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertTitle>Success!</AlertTitle>
            <AlertDescription>
              Your reminder has been sent successfully.
            </AlertDescription>
          </Alert>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reminder-type">Notification Type</Label>
                <Select
                  value={reminderType}
                  onValueChange={(value: "email" | "sms" | "in-app") => setReminderType(value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="sms">SMS</SelectItem>
                    <SelectItem value="in-app">In-App Notification</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="reminder-contact">
                  {reminderType === 'email' ? 'Email Address' : reminderType === 'sms' ? 'Phone Number' : 'User ID'}
                </Label>
                <Input
                  id="reminder-contact"
                  value={reminderContact}
                  onChange={(e) => setReminderContact(e.target.value)}
                  placeholder={reminderType === 'email' ? 'client@example.com' : reminderType === 'sms' ? '+1234567890' : 'user-id'}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="reminder-message">Auto-generated Message</Label>
                <div className="border rounded-md p-4 whitespace-pre-wrap h-64 overflow-y-auto text-sm">
                  {reminderMessage}
                </div>
                <p className="text-xs text-gray-500 mt-1">This message is automatically generated based on the invoice details.</p>
              </div>
            </div>
            
            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
              <Button type="submit">Send Reminder</Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default InvoiceReminderDialog;
