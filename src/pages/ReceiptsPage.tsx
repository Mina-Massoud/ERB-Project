import React, { useState } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import ReceiptList from "@/components/receipts/ReceiptList";
import { useCostManagement } from "@/provider/cost-management-provider";
import { Button } from "@/components/ui/button";
import { BarChart3, Calendar, Download, FileText } from "lucide-react";
import ReceiptGenerator from "@/components/receipts/ReceiptGenerator";

const ReceiptsPage: React.FC = () => {
  const { state } = useCostManagement();
  const { receipts, payments } = state;
  const [activeTab, setActiveTab] = useState("all");
  const [refreshKey, setRefreshKey] = useState(0);
  
  // Function to refresh the receipt list
  const refreshReceipts = () => {
    setRefreshKey(prev => prev + 1);
  };

  // Calculate total receipts
  const totalReceipts = receipts.length;

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  // Get total amount from receipts
  const getTotalReceiptAmount = () => {
    return receipts.reduce((sum, receipt) => sum + receipt.amount, 0);
  };

  // Get receipts from current month
  const getCurrentMonthReceiptsCount = () => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    return receipts.filter(receipt => {
      const receiptDate = new Date(receipt.date);
      return receiptDate >= startOfMonth;
    }).length;
  };

  // Get payments without receipts
  const getPaymentsWithoutReceiptsCount = () => {
    const paymentsWithReceipts = receipts.map(r => r.paymentId);
    return payments.filter(p => !paymentsWithReceipts.includes(p.id)).length;
  };

  // Export receipts data as CSV
  const exportReceiptsCSV = () => {
    // In a real application, this would generate a CSV file with receipt data
    alert("This would download a CSV file with receipt data in a real application.");
  };

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Receipt Management</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* Total Receipts Card */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Receipts</p>
                <h2 className="text-3xl font-bold">{totalReceipts}</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  {formatCurrency(getTotalReceiptAmount())}
                </p>
              </div>
              <div className="p-2 bg-primary/10 rounded-full">
                <FileText className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Current Month Card */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Current Month</p>
                <h2 className="text-3xl font-bold">{getCurrentMonthReceiptsCount()}</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Receipts generated this month
                </p>
              </div>
              <div className="p-2 bg-primary/10 rounded-full">
                <Calendar className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Pending Receipts Card */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending Receipts</p>
                <h2 className="text-3xl font-bold">{getPaymentsWithoutReceiptsCount()}</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Payments without receipts
                </p>
              </div>
              <div className="p-2 bg-primary/10 rounded-full">
                <BarChart3 className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card className="h-fit">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Receipt History</CardTitle>
            <CardDescription>
              View and manage all payment receipts
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <ReceiptGenerator onReceiptGenerated={refreshReceipts} />
            <Button 
              variant="outline" 
              size="sm" 
              className="flex items-center gap-1"
              onClick={exportReceiptsCSV}
            >
              <Download className="h-4 w-4" />
              Export
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="mb-6">
            <TabsList>
              <TabsTrigger value="all">All Receipts</TabsTrigger>
              <TabsTrigger value="digital">Digital</TabsTrigger>
              <TabsTrigger value="pdf">PDF</TabsTrigger>
            </TabsList>
            <TabsContent value="all">
              <ReceiptList key={`all-${refreshKey}`} />
            </TabsContent>
            <TabsContent value="digital">
              {/* In a real app, we would filter receipts by format */}
              <ReceiptList key={`digital-${refreshKey}`} />
            </TabsContent>
            <TabsContent value="pdf">
              {/* In a real app, we would filter receipts by format */}
              <ReceiptList key={`pdf-${refreshKey}`} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReceiptsPage;
