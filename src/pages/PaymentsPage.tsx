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
import PaymentList from "@/components/payments/PaymentList";
import PaymentLogDialog from "@/components/payments/PaymentLogDialog";
import { useCostManagement } from "@/provider/cost-management-provider";
import { Button } from "@/components/ui/button";
import { BarChart3, Calendar, DollarSign, Download } from "lucide-react";

const PaymentsPage: React.FC = () => {
  const { state } = useCostManagement();
  const { payments, invoices } = state;
  const [activeTab, setActiveTab] = useState("all");
  const [refreshKey, setRefreshKey] = useState(0);
  
  // Function to refresh the payment list
  const refreshPayments = () => {
    setRefreshKey(prev => prev + 1);
  };

  // Calculate total payments
  const totalPayments = payments.reduce((sum, payment) => sum + payment.amount, 0);

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  // Get current month payments
  const getCurrentMonthPayments = () => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    return payments.filter(payment => {
      const paymentDate = new Date(payment.date);
      return paymentDate >= startOfMonth;
    }).reduce((sum, payment) => sum + payment.amount, 0);
  };

  // Get unpaid invoice total
  const getUnpaidInvoiceTotal = () => {
    return invoices
      .filter(inv => inv.status !== 'paid' && inv.status !== 'cancelled')
      .reduce((sum, inv) => sum + inv.total, 0);
  };

  // Export payments data as CSV
  const exportPaymentsCSV = () => {
    // In a real application, this would generate a CSV file with payment data
    alert("This would download a CSV file with payment data in a real application.");
  };

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Payment Management</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* Total Payments Card */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Payments</p>
                <h2 className="text-3xl font-bold">{formatCurrency(totalPayments)}</h2>
              </div>
              <div className="p-2 bg-primary/10 rounded-full">
                <DollarSign className="h-6 w-6 text-primary" />
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
                <h2 className="text-3xl font-bold">{formatCurrency(getCurrentMonthPayments())}</h2>
              </div>
              <div className="p-2 bg-primary/10 rounded-full">
                <Calendar className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Outstanding Invoices Card */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Outstanding Invoices</p>
                <h2 className="text-3xl font-bold">{formatCurrency(getUnpaidInvoiceTotal())}</h2>
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
            <CardTitle>Payment History</CardTitle>
            <CardDescription>
              View and manage all payment records
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <PaymentLogDialog onPaymentLogged={refreshPayments} />
            <Button 
              variant="outline" 
              size="sm" 
              className="flex items-center gap-1"
              onClick={exportPaymentsCSV}
            >
              <Download className="h-4 w-4" />
              Export
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="mb-6">
            <TabsList>
              <TabsTrigger value="all">All Payments</TabsTrigger>
              <TabsTrigger value="recent">Recent (30 days)</TabsTrigger>
              <TabsTrigger value="thisMonth">This Month</TabsTrigger>
            </TabsList>
            <TabsContent value="all">
              <PaymentList key={`all-${refreshKey}`} />
            </TabsContent>
            <TabsContent value="recent">
              {/* In a real app, we would filter payments for the last 30 days */}
              <PaymentList key={`recent-${refreshKey}`} />
            </TabsContent>
            <TabsContent value="thisMonth">
              {/* In a real app, we would filter payments for the current month */}
              <PaymentList key={`thisMonth-${refreshKey}`} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentsPage;
