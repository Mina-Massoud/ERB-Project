import React from "react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";

// Define invoice item type
interface InvoiceItem {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

// Define invoice type
interface Invoice {
  id: string;
  invoiceNumber: string;
  clientId: string;
  items: InvoiceItem[];
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

interface InvoiceDetailsProps {
  invoice: Invoice;
  formatCurrency: (amount: number) => string;
  formatDate: (dateString: string) => string;
  getClientName: (clientId: string) => string;
}

const InvoiceDetails: React.FC<InvoiceDetailsProps> = ({ 
  invoice, 
  formatCurrency, 
  formatDate,
  getClientName
}) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <h3 className="text-sm font-medium text-gray-500">Invoice Number</h3>
          <p>{invoice.invoiceNumber}</p>
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-500">Client</h3>
          <p>{getClientName(invoice.clientId)}</p>
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-500">Created</h3>
          <p>{formatDate(invoice.createdAt)}</p>
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-500">Due Date</h3>
          <p>{formatDate(invoice.dueDate)}</p>
        </div>
        {invoice.taxRegion && (
          <div>
            <h3 className="text-sm font-medium text-gray-500">Tax Region</h3>
            <p>{invoice.taxRegion.toUpperCase()}</p>
          </div>
        )}
      </div>
      
      <div>
        <h3 className="text-sm font-medium text-gray-500 mb-2">Items</h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Description</TableHead>
              <TableHead className="text-right">Quantity</TableHead>
              <TableHead className="text-right">Unit Price</TableHead>
              <TableHead className="text-right">Subtotal</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoice.items.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.name}</TableCell>
                <TableCell className="text-right">{item.quantity}</TableCell>
                <TableCell className="text-right">{formatCurrency(item.unitPrice)}</TableCell>
                <TableCell className="text-right">{formatCurrency(item.subtotal)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      
      <div className="space-y-2 pt-4 border-t">
        <div className="flex justify-between">
          <span>Subtotal:</span>
          <span>{formatCurrency(invoice.subtotal)}</span>
        </div>
        <div className="flex justify-between">
          <span>Tax ({invoice.taxRate}%):</span>
          <span>{formatCurrency(invoice.taxAmount)}</span>
        </div>
        <div className="flex justify-between">
          <span>Discount ({invoice.discountRate}%):</span>
          <span>-{formatCurrency(invoice.discountAmount)}</span>
        </div>
        <div className="flex justify-between font-medium pt-2 border-t">
          <span>Total:</span>
          <span>{formatCurrency(invoice.total)}</span>
        </div>
      </div>
    </div>
  );
};

export default InvoiceDetails;
