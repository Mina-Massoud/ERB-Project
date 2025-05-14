import React, { useState } from "react";
import { useCostManagement } from "@/provider/cost-management-provider";
import type { TaxRegion } from "@/provider/cost-management-provider";
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
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

// Define invoice item type
interface InvoiceItem {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

// Define editing invoice item type
interface EditingInvoiceItem {
  id?: string;
  name: string;
  quantity: number;
  unitPrice: number;
  subtotal?: number;
}

// Define invoice type
// Using imported TaxRegion type

interface Invoice {
  id: string;
  invoiceNumber: string;
  clientId: string;
  items: InvoiceItem[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  taxRegion?: TaxRegion;
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

interface InvoiceEditDialogProps {
  invoice: Invoice;
}

const InvoiceEditDialog: React.FC<InvoiceEditDialogProps> = ({ invoice }) => {
  const { editInvoice, getTaxRules } = useCostManagement();
  const taxRules = getTaxRules();
  
  // State for editing
  const [isOpen, setIsOpen] = useState(false);
  const [editingClientId, setEditingClientId] = useState<string>(invoice.clientId);
  const [editingItems, setEditingItems] = useState<EditingInvoiceItem[]>(invoice.items.map(item => ({
    id: item.id,
    name: item.name,
    quantity: item.quantity,
    unitPrice: item.unitPrice
  })));
  const [editingTaxRate, setEditingTaxRate] = useState<string>(invoice.taxRate.toString());
  const [editingUseTaxRegion, setEditingUseTaxRegion] = useState<boolean>(!!invoice.taxRegion);
  const [editingTaxRegion, setEditingTaxRegion] = useState<TaxRegion>(invoice.taxRegion as TaxRegion || "usa");
  const [editingDiscountRate, setEditingDiscountRate] = useState<string>(invoice.discountRate.toString());
  const [editingDueDate, setEditingDueDate] = useState<string>(invoice.dueDate);

  // Add a new item to the invoice
  const addEditingInvoiceItem = () => {
    setEditingItems([...editingItems, { name: "", quantity: 1, unitPrice: 0 }]);
  };

  // Remove an item from the invoice
  const removeEditingInvoiceItem = (index: number) => {
    setEditingItems(editingItems.filter((_, i) => i !== index));
  };

  // Update an invoice item
  const updateEditingInvoiceItem = (index: number, field: string, value: string) => {
    const newItems = [...editingItems];
    newItems[index] = {
      ...newItems[index],
      [field]: field === 'name' ? value : parseFloat(value) || 0
    };
    setEditingItems(newItems);
  };

  // Calculate invoice subtotal
  const calculateEditingSubtotal = () => {
    return editingItems.reduce((total, item) => total + (item.quantity * item.unitPrice), 0);
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  // Calculate tax amount
  const calculateEditingTaxAmount = (subtotal: number) => {
    if (editingUseTaxRegion) {
      const rule = taxRules.find(r => r.region === editingTaxRegion);
      return subtotal * (rule?.baseRate || 0) / 100;
    }
    return subtotal * (parseFloat(editingTaxRate) || 0) / 100;
  };

  // Calculate discount amount
  const calculateEditingDiscountAmount = (subtotal: number) => {
    return subtotal * (parseFloat(editingDiscountRate) || 0) / 100;
  };

  // Calculate total
  const calculateEditingTotal = () => {
    const subtotal = calculateEditingSubtotal();
    const taxAmount = calculateEditingTaxAmount(subtotal);
    const discountAmount = calculateEditingDiscountAmount(subtotal);
    return subtotal + taxAmount - discountAmount;
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingClientId || editingItems.some(item => !item.name) || !editingDueDate) {
      alert("Please fill in all required fields");
      return;
    }

    const subtotal = calculateEditingSubtotal();
    const taxAmount = calculateEditingTaxAmount(subtotal);
    const discountAmount = calculateEditingDiscountAmount(subtotal);
    const total = calculateEditingTotal();

    editInvoice(invoice.id, {
      clientId: editingClientId,
      items: editingItems.map(item => ({
        id: item.id || Math.random().toString(36).substring(2, 15),
        name: item.name,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        subtotal: item.quantity * item.unitPrice
      })),
      subtotal,
      taxRate: parseFloat(editingTaxRate) || 0,
      taxAmount,
      taxRegion: editingUseTaxRegion ? editingTaxRegion : undefined,
      discountRate: parseFloat(editingDiscountRate) || 0,
      discountAmount,
      total,
      dueDate: editingDueDate
    });

    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">Edit Invoice</Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Invoice {invoice.invoiceNumber}</DialogTitle>
          <DialogDescription>
            Make changes to your invoice here. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="editing-client">Client</Label>
              <Select
                value={editingClientId}
                onValueChange={(value) => setEditingClientId(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select client" />
                </SelectTrigger>
                <SelectContent>
                  {mockClients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label>Invoice Items</Label>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={addEditingInvoiceItem}
                >
                  Add Item
                </Button>
              </div>
              
              {editingItems.map((item, index) => (
                <div key={index} className="space-y-2 p-3 border rounded-md">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Item {index + 1}</span>
                    {editingItems.length > 1 && (
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="sm"
                        onClick={() => removeEditingInvoiceItem(index)}
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor={`edit-item-name-${index}`}>Description</Label>
                    <Input
                      id={`edit-item-name-${index}`}
                      value={item.name}
                      onChange={(e) => updateEditingInvoiceItem(index, 'name', e.target.value)}
                      placeholder="Item description"
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-2">
                      <Label htmlFor={`edit-item-quantity-${index}`}>Quantity</Label>
                      <Input
                        id={`edit-item-quantity-${index}`}
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        value={item.quantity}
                        onChange={(e) => updateEditingInvoiceItem(index, 'quantity', e.target.value)}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor={`edit-item-price-${index}`}>Unit Price ($)</Label>
                      <Input
                        id={`edit-item-price-${index}`}
                        type="text"
                        inputMode="decimal"
                        pattern="[0-9]+(\.[0-9]+)?"
                        value={item.unitPrice}
                        onChange={(e) => updateEditingInvoiceItem(index, 'unitPrice', e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="text-right text-sm font-medium">
                    Subtotal: {formatCurrency(item.quantity * item.unitPrice)}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="editingUseTaxRegion" 
                  checked={editingUseTaxRegion} 
                  onCheckedChange={(checked) => setEditingUseTaxRegion(checked as boolean)}
                />
                <Label htmlFor="editingUseTaxRegion">Use regional tax rules</Label>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                {editingUseTaxRegion ? (
                  <div className="space-y-2">
                    <Label htmlFor="editingTaxRegion">Tax Region</Label>
                    <Select
                      value={editingTaxRegion}
                      onValueChange={(value: string) => setEditingTaxRegion(value as TaxRegion)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select region" />
                      </SelectTrigger>
                      <SelectContent>
                        {taxRules.map((rule) => (
                          <SelectItem key={rule.region} value={rule.region}>
                            {rule.region.toUpperCase()} ({rule.baseRate}%{rule.hasVAT ? ' VAT' : ''})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <div className="text-xs text-gray-500 mt-1">
                      Base Rate: {taxRules.find(r => r.region === editingTaxRegion)?.baseRate}%
                      {taxRules.find(r => r.region === editingTaxRegion)?.hasVAT && " (VAT)"}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Label htmlFor="edit-taxRate">Tax Rate (%)</Label>
                    <Input
                      id="edit-taxRate"
                      type="text"
                      inputMode="decimal"
                      pattern="[0-9]+(\.[0-9]+)?"
                      value={editingTaxRate}
                      onChange={(e) => setEditingTaxRate(e.target.value)}
                      placeholder="0.00"
                    />
                  </div>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-discountRate">Discount Rate (%)</Label>
                <Input
                  id="edit-discountRate"
                  type="text"
                  inputMode="decimal"
                  pattern="[0-9]+(\.[0-9]+)?"
                  value={editingDiscountRate}
                  onChange={(e) => setEditingDiscountRate(e.target.value)}
                  placeholder="0.00"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-dueDate">Due Date</Label>
                <Input
                  id="edit-dueDate"
                  type="date"
                  value={editingDueDate}
                  onChange={(e) => setEditingDueDate(e.target.value)}
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2 pt-4 border-t">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>{formatCurrency(calculateEditingSubtotal())}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax ({editingUseTaxRegion ? `${taxRules.find(r => r.region === editingTaxRegion)?.baseRate}%` : `${editingTaxRate}%`}):</span>
                <span>{formatCurrency(calculateEditingTaxAmount(calculateEditingSubtotal()))}</span>
              </div>
              <div className="flex justify-between">
                <span>Discount ({editingDiscountRate}%):</span>
                <span>-{formatCurrency(calculateEditingDiscountAmount(calculateEditingSubtotal()))}</span>
              </div>
              <div className="flex justify-between font-medium pt-2 border-t">
                <span>Total:</span>
                <span>{formatCurrency(calculateEditingTotal())}</span>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
            <Button type="submit">Save Changes</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default InvoiceEditDialog;
