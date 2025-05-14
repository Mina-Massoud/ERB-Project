import React from "react";
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
import { Checkbox } from "@/components/ui/checkbox";

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

interface InvoiceFormProps {
  onInvoiceCreated?: () => void;
}

const InvoiceForm: React.FC<InvoiceFormProps> = ({ onInvoiceCreated }) => {
  const { generateInvoice, getTaxRules, state, updateInvoiceForm } = useCostManagement();
  const taxRules = getTaxRules();
  
  // Use state from the provider instead of local state
  const { clientId, invoiceItems, taxRate, useTaxRegion, taxRegion, discountRate, dueDate } = state.invoiceForm;
  
  // Update functions that modify the provider state
  const setClientId = (value: string) => {
    updateInvoiceForm({ clientId: value });
  };
  
  const setInvoiceItems = (items: Array<{ name: string; quantity: number; unitPrice: number }>) => {
    updateInvoiceForm({ invoiceItems: items });
  };
  
  const setTaxRate = (value: string) => {
    updateInvoiceForm({ taxRate: value });
  };
  
  const setUseTaxRegion = (value: boolean) => {
    updateInvoiceForm({ useTaxRegion: value });
  };
  
  const setTaxRegion = (value: "usa" | "eu" | "uk" | "canada" | "australia" | "japan" | "other") => {
    updateInvoiceForm({ taxRegion: value });
  };
  
  const setDiscountRate = (value: string) => {
    updateInvoiceForm({ discountRate: value });
  };
  
  const setDueDate = (value: string) => {
    updateInvoiceForm({ dueDate: value });
  };

  // Add a new item to the invoice
  const addInvoiceItem = () => {
    setInvoiceItems([...invoiceItems, { name: "", quantity: 1, unitPrice: 0 }]);
  };

  // Remove an item from the invoice
  const removeInvoiceItem = (index: number) => {
    setInvoiceItems(invoiceItems.filter((_, i) => i !== index));
  };

  // Update an invoice item
  const updateInvoiceItem = (index: number, field: string, value: string) => {
    const newItems = [...invoiceItems];
    newItems[index] = {
      ...newItems[index],
      [field]: field === 'name' ? value : parseFloat(value) || 0
    };
    setInvoiceItems(newItems);
  };

  // Calculate invoice subtotal
  const calculateSubtotal = () => {
    return invoiceItems.reduce((total, item) => total + (item.quantity * item.unitPrice), 0);
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!clientId || invoiceItems.some(item => !item.name) || !dueDate) {
      alert("Please fill in all required fields");
      return;
    }

    // Pass tax region if using regional tax rules
    generateInvoice(
      clientId,
      invoiceItems,
      parseFloat(taxRate) || 0,
      parseFloat(discountRate) || 0,
      dueDate,
      useTaxRegion ? taxRegion : undefined
    );
    
    if (onInvoiceCreated) {
      onInvoiceCreated();
    }
  };

  // Calculate tax amount
  const calculateTaxAmount = (subtotal: number) => {
    if (useTaxRegion) {
      const rule = taxRules.find(r => r.region === taxRegion);
      return subtotal * (rule?.baseRate || 0) / 100;
    }
    return subtotal * (parseFloat(taxRate) || 0) / 100;
  };

  // Calculate discount amount
  const calculateDiscountAmount = (subtotal: number) => {
    return subtotal * (parseFloat(discountRate) || 0) / 100;
  };

  // Calculate total
  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const taxAmount = calculateTaxAmount(subtotal);
    const discountAmount = calculateDiscountAmount(subtotal);
    return subtotal + taxAmount - discountAmount;
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="client">Client</Label>
          <Select
            value={clientId}
            onValueChange={(value) => setClientId(value)}
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
              onClick={addInvoiceItem}
            >
              Add Item
            </Button>
          </div>
          
          {invoiceItems.map((item, index) => (
            <div key={index} className="space-y-2 p-3 border rounded-md">
              <div className="flex justify-between items-center">
                <span className="font-medium">Item {index + 1}</span>
                {invoiceItems.length > 1 && (
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="sm"
                    onClick={() => removeInvoiceItem(index)}
                  >
                    Remove
                  </Button>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor={`item-name-${index}`}>Description</Label>
                <Input
                  id={`item-name-${index}`}
                  value={item.name}
                  onChange={(e) => updateInvoiceItem(index, 'name', e.target.value)}
                  placeholder="Item description"
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-2">
                  <Label htmlFor={`item-quantity-${index}`}>Quantity</Label>
                  <Input
                    id={`item-quantity-${index}`}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={item.quantity}
                    onChange={(e) => updateInvoiceItem(index, 'quantity', e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor={`item-price-${index}`}>Unit Price ($)</Label>
                  <Input
                    id={`item-price-${index}`}
                    type="text"
                    inputMode="decimal"
                    pattern="[0-9]+(\.[0-9]+)?"
                    value={item.unitPrice}
                    onChange={(e) => updateInvoiceItem(index, 'unitPrice', e.target.value)}
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
              id="useTaxRegion" 
              checked={useTaxRegion} 
              onCheckedChange={(checked) => setUseTaxRegion(checked as boolean)}
            />
            <Label htmlFor="useTaxRegion">Use regional tax rules</Label>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            {useTaxRegion ? (
              <div className="space-y-2">
                <Label htmlFor="taxRegion">Tax Region</Label>
                <Select
                  value={taxRegion}
                  onValueChange={(value: "usa" | "eu" | "uk" | "canada" | "australia" | "japan" | "other") => setTaxRegion(value)}
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
                  Base Rate: {taxRules.find(r => r.region === taxRegion)?.baseRate}%
                  {taxRules.find(r => r.region === taxRegion)?.hasVAT && " (VAT)"}
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="taxRate">Tax Rate (%)</Label>
                <Input
                  id="taxRate"
                  type="text"
                  inputMode="decimal"
                  pattern="[0-9]+(\.[0-9]+)?"
                  value={taxRate}
                  onChange={(e) => setTaxRate(e.target.value)}
                  placeholder="0.00"
                />
              </div>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="discountRate">Discount Rate (%)</Label>
            <Input
              id="discountRate"
              type="text"
              inputMode="decimal"
              pattern="[0-9]+(\.[0-9]+)?"
              value={discountRate}
              onChange={(e) => setDiscountRate(e.target.value)}
              placeholder="0.00"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="dueDate">Due Date</Label>
            <Input
              id="dueDate"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              required
            />
          </div>
        </div>
        
        <div className="space-y-2 pt-4 border-t">
          <div className="flex justify-between">
            <span>Subtotal:</span>
            <span>{formatCurrency(calculateSubtotal())}</span>
          </div>
          <div className="flex justify-between">
            <span>Tax ({useTaxRegion ? `${taxRules.find(r => r.region === taxRegion)?.baseRate}%` : `${taxRate}%`}):</span>
            <span>{formatCurrency(calculateTaxAmount(calculateSubtotal()))}</span>
          </div>
          <div className="flex justify-between">
            <span>Discount ({discountRate}%):</span>
            <span>-{formatCurrency(calculateDiscountAmount(calculateSubtotal()))}</span>
          </div>
          <div className="flex justify-between font-medium pt-2 border-t">
            <span>Total:</span>
            <span>{formatCurrency(calculateTotal())}</span>
          </div>
        </div>
      </div>
      
      <Button type="submit" className="w-full">Generate Invoice</Button>
    </form>
  );
};

export default InvoiceForm;
