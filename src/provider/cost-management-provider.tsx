import React, {
  createContext,
  useContext,
  useReducer,
  type ReactNode,
} from "react";

// Define types for our cost management system
type CostCategory = "materials" | "labor" | "overhead" | "marketing" | "other";
type PaymentMethod = "cash" | "credit" | "bank_transfer" | "check" | "other";
type InvoiceStatus =
  | "draft"
  | "sent"
  | "paid"
  | "partially_paid"
  | "overdue"
  | "cancelled";
type NotificationType = "email" | "sms" | "in-app";
export type TaxRegion = "usa" | "eu" | "uk" | "canada" | "australia" | "japan" | "other";

// Cost Entry Types
interface CostEntry {
  id: string;
  category: CostCategory;
  amount: number;
  date: string;
  description: string;
  createdAt: string;
}

// Invoice Types
interface InvoiceItem {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

// Tax Rules by Region
interface TaxRule {
  region: TaxRegion;
  baseRate: number;
  specialCategories?: Record<string, number>;
  exemptionThreshold?: number;
  hasVAT: boolean;
}

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
  status: InvoiceStatus;
  createdAt: string;
  updatedAt: string;
}

// Payment Types
interface Payment {
  id: string;
  invoiceId: string;
  amount: number;
  method: PaymentMethod;
  date: string;
  notes?: string;
}

// Receipt Types
interface Receipt {
  id: string;
  invoiceId: string;
  paymentId: string;
  amount: number;
  date: string;
  format: "pdf" | "digital";
}

// Notification Types
interface Notification {
  id: string;
  invoiceId: string;
  type: NotificationType;
  clientContact: string;
  message: string;
  sentAt: string;
  status: "sent" | "failed" | "delivered";
}

// Report Types
interface InvoiceSummaryReport {
  id: string;
  dateRange: {
    start: string;
    end: string;
  };
  filters: {
    status?: InvoiceStatus[];
    clientId?: string;
  };
  data: {
    totalInvoices: number;
    totalAmount: number;
    paidAmount: number;
    unpaidAmount: number;
    overdueAmount: number;
    invoicesByStatus: Record<InvoiceStatus, number>;
  };
  generatedAt: string;
}

// Page Types
type CostManagementPage = 'costEntry' | 'invoices' | 'payments' | 'receipts' | 'reports' | 'dashboard';

// State Type
interface CostManagementState {
  activePage: CostManagementPage;
  costEntries: CostEntry[];
  invoices: Invoice[];
  payments: Payment[];
  receipts: Receipt[];
  notifications: Notification[];
  reports: InvoiceSummaryReport[];
  
  // Form state for cost entry
  costEntryForm: {
    category: "materials" | "labor" | "overhead" | "marketing" | "other";
    amount: string;
    date: string;
    description: string;
  };

  // Form state for invoice creation
  invoiceForm: {
    clientId: string;
    invoiceItems: Array<{ name: string; quantity: number; unitPrice: number }>;
    taxRate: string;
    useTaxRegion: boolean;
    taxRegion: TaxRegion;
    discountRate: string;
    dueDate: string;
  };
}

// Action Types
type CostManagementAction =
  | { type: "SET_ACTIVE_PAGE"; payload: CostManagementPage }
  | { type: "ADD_COST_ENTRY"; payload: Omit<CostEntry, "id" | "createdAt"> }
  | { type: "DELETE_COST_ENTRY"; payload: { id: string } }
  | { type: "UPDATE_COST_ENTRY_FORM"; payload: Partial<CostManagementState["costEntryForm"]> }
  | { type: "UPDATE_INVOICE_FORM"; payload: Partial<CostManagementState["invoiceForm"]> }
  | {
      type: "GENERATE_INVOICE";
      payload: {
        clientId: string;
        items: Omit<InvoiceItem, "id" | "subtotal">[];
        taxRate: number;
        taxRegion?: TaxRegion;
        discountRate: number;
        dueDate: string;
      };
    }
  | {
      type: "EDIT_INVOICE";
      payload: {
        id: string;
        updates: Partial<
          Omit<Invoice, "id" | "invoiceNumber" | "createdAt" | "updatedAt">
        >;
      };
    }
  | {
      type: "SEND_INVOICE_REMINDER";
      payload: {
        invoiceId: string;
        type: NotificationType;
        clientContact: string;
        message: string;
      };
    }
  | {
      type: "LOG_PAYMENT";
      payload: {
        invoiceId: string;
        amount: number;
        method: PaymentMethod;
        date: string;
        notes?: string;
      };
    }
  | {
      type: "GENERATE_RECEIPT";
      payload: {
        invoiceId: string;
        paymentId: string;
        format: "pdf" | "digital";
      };
    }
  | {
      type: "UPDATE_INVOICE_STATUS";
      payload: { invoiceId: string; status: InvoiceStatus };
    }
  | {
      type: "GENERATE_INVOICE_SUMMARY_REPORT";
      payload: {
        dateRange: { start: string; end: string };
        filters?: { status?: InvoiceStatus[]; clientId?: string };
      };
    };

// Initial State
const initialState: CostManagementState = {
  activePage: 'costEntry',
  costEntries: [],
  invoices: [],
  payments: [],
  receipts: [],
  notifications: [],
  reports: [],
  costEntryForm: {
    category: "materials",
    amount: "",
    date: new Date().toISOString().split('T')[0],
    description: "",
  },
  invoiceForm: {
    clientId: "",
    invoiceItems: [{ name: "", quantity: 1, unitPrice: 0 }],
    taxRate: "0",
    useTaxRegion: false,
    taxRegion: "usa",
    discountRate: "0",
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  },
};

// Helper Functions
const generateId = (): string => {
  return (
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15)
  );
};

const generateInvoiceNumber = (): string => {
  const prefix = "INV";
  const timestamp = Date.now().toString().substring(7);
  const random = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, "0");
  return `${prefix}-${timestamp}-${random}`;
};

const calculateSubtotal = (items: InvoiceItem[]): number => {
  return items.reduce((total, item) => total + item.subtotal, 0);
};

// Regional tax rules
const taxRules: TaxRule[] = [
  {
    region: "usa",
    baseRate: 7.25, // Average US sales tax
    specialCategories: {
      food: 0, // Many states exempt food
      medical: 0,
      digital: 6.0,
    },
    exemptionThreshold: 0,
    hasVAT: false,
  },
  {
    region: "eu",
    baseRate: 21, // Average EU VAT
    specialCategories: {
      food: 10,
      books: 6,
      medical: 0,
    },
    exemptionThreshold: 0,
    hasVAT: true,
  },
  {
    region: "uk",
    baseRate: 20, // UK VAT
    specialCategories: {
      food: 0,
      books: 0,
      children: 0,
    },
    exemptionThreshold: 85000, // Annual threshold
    hasVAT: true,
  },
  {
    region: "canada",
    baseRate: 5, // GST
    specialCategories: {
      food: 0,
      medical: 0,
    },
    exemptionThreshold: 30000, // Small supplier exemption
    hasVAT: false,
  },
  {
    region: "australia",
    baseRate: 10, // GST
    specialCategories: {
      food: 0,
      medical: 0,
      education: 0,
    },
    exemptionThreshold: 75000,
    hasVAT: true,
  },
  {
    region: "japan",
    baseRate: 10,
    specialCategories: {
      food: 8,
    },
    hasVAT: true,
  },
  {
    region: "other",
    baseRate: 15, // Default rate
    hasVAT: false,
  },
];

const getTaxRuleByRegion = (region?: TaxRegion): TaxRule => {
  if (!region) return taxRules.find(rule => rule.region === "other")!;
  return taxRules.find(rule => rule.region === region) || taxRules.find(rule => rule.region === "other")!;
};

const calculateTaxAmount = (subtotal: number, taxRate: number, region?: TaxRegion): number => {
  if (region) {
    const taxRule = getTaxRuleByRegion(region);
    // If using regional tax, use the base rate from the tax rule
    // In a real system, we would apply different rates to different items based on categories
    return subtotal * (taxRule.baseRate / 100);
  }
  // Fall back to manual tax rate if no region specified
  return subtotal * (taxRate / 100);
};

const calculateDiscountAmount = (
  subtotal: number,
  discountRate: number
): number => {
  return subtotal * (discountRate / 100);
};

const calculateTotal = (
  subtotal: number,
  taxAmount: number,
  discountAmount: number
): number => {
  return subtotal + taxAmount - discountAmount;
};

// Reducer Function
const costManagementReducer = (
  state: CostManagementState,
  action: CostManagementAction
): CostManagementState => {
  switch (action.type) {
    case "SET_ACTIVE_PAGE":
      return {
        ...state,
        activePage: action.payload,
      };
      
    case "UPDATE_INVOICE_FORM":
      return {
        ...state,
        invoiceForm: {
          ...state.invoiceForm,
          ...action.payload,
        },
      };
    // Cost Entry SDK
    case "ADD_COST_ENTRY": {
      const newCostEntry: CostEntry = {
        id: generateId(),
        ...action.payload,
        createdAt: new Date().toISOString(),
      };
      return {
        ...state,
        costEntries: [...state.costEntries, newCostEntry],
      };
    }

    case "DELETE_COST_ENTRY": {
      return {
        ...state,
        costEntries: state.costEntries.filter(
          (entry) => entry.id !== action.payload.id
        ),
      };
    }
    
    case "UPDATE_COST_ENTRY_FORM": {
      return {
        ...state,
        costEntryForm: {
          ...state.costEntryForm,
          ...action.payload
        }
      };
    }

    // Invoice Generation SDK
    case "GENERATE_INVOICE": {
      const { clientId, items, taxRate, taxRegion, discountRate, dueDate } =
        action.payload;

      // Create invoice items with IDs and subtotals
      const invoiceItems: InvoiceItem[] = items.map((item) => ({
        id: generateId(),
        ...item,
        subtotal: item.quantity * item.unitPrice,
      }));

      const subtotal = calculateSubtotal(invoiceItems);
      const taxAmount = calculateTaxAmount(subtotal, taxRate, taxRegion);
      const discountAmount = calculateDiscountAmount(subtotal, discountRate);
      const total = calculateTotal(subtotal, taxAmount, discountAmount);

      const newInvoice: Invoice = {
        id: generateId(),
        invoiceNumber: generateInvoiceNumber(),
        clientId,
        items: invoiceItems,
        subtotal,
        taxRate,
        taxAmount,
        taxRegion,
        discountRate,
        discountAmount,
        total,
        dueDate,
        status: "draft",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      return {
        ...state,
        invoices: [...state.invoices, newInvoice],
      };
    }

    // Invoice Editing Library
    case "EDIT_INVOICE": {
      const { id, updates } = action.payload;

      return {
        ...state,
        invoices: state.invoices.map((invoice) => {
          if (invoice.id === id) {
            let updatedInvoice = {
              ...invoice,
              ...updates,
              updatedAt: new Date().toISOString(),
            };

            // Recalculate financials if items, tax rate, or discount rate changed
            if (
              updates.items ||
              updates.taxRate !== undefined ||
              updates.discountRate !== undefined
            ) {
              const items = updates.items || invoice.items;
              const taxRate =
                updates.taxRate !== undefined
                  ? updates.taxRate
                  : invoice.taxRate;
              const discountRate =
                updates.discountRate !== undefined
                  ? updates.discountRate
                  : invoice.discountRate;

              const subtotal = calculateSubtotal(items);
              const taxAmount = calculateTaxAmount(subtotal, taxRate);
              const discountAmount = calculateDiscountAmount(
                subtotal,
                discountRate
              );
              const total = calculateTotal(subtotal, taxAmount, discountAmount);

              updatedInvoice = {
                ...updatedInvoice,
                items,
                subtotal,
                taxRate,
                taxAmount,
                discountRate,
                discountAmount,
                total,
              };
            }

            return updatedInvoice;
          }
          return invoice;
        }),
      };
    }

    // Invoice Due Reminder SDK
    case "SEND_INVOICE_REMINDER": {
      const { invoiceId, type, clientContact, message } = action.payload;

      const newNotification: Notification = {
        id: generateId(),
        invoiceId,
        type,
        clientContact,
        message,
        sentAt: new Date().toISOString(),
        status: "sent", // In a real app, this would be updated based on actual delivery status
      };

      return {
        ...state,
        notifications: [...state.notifications, newNotification],
      };
    }

    // Payment Logging SDK
    case "LOG_PAYMENT": {
      const { invoiceId, amount, method, date, notes } = action.payload;

      const newPayment: Payment = {
        id: generateId(),
        invoiceId,
        amount,
        method,
        date,
        notes,
      };

      // Find the invoice to update its status
      const invoice = state.invoices.find((inv) => inv.id === invoiceId);
      let updatedInvoices = [...state.invoices];

      if (invoice) {
        // Calculate total payments for this invoice
        const existingPayments = state.payments.filter(
          (p) => p.invoiceId === invoiceId
        );
        const totalPaid =
          existingPayments.reduce((sum, p) => sum + p.amount, 0) + amount;

        // Determine new status
        let newStatus: InvoiceStatus = invoice.status;
        if (totalPaid >= invoice.total) {
          newStatus = "paid";
        } else if (totalPaid > 0) {
          newStatus = "partially_paid";
        }

        // Update invoice status if needed
        if (newStatus !== invoice.status) {
          updatedInvoices = state.invoices.map((inv) =>
            inv.id === invoiceId
              ? {
                  ...inv,
                  status: newStatus,
                  updatedAt: new Date().toISOString(),
                }
              : inv
          );
        }
      }

      return {
        ...state,
        payments: [...state.payments, newPayment],
        invoices: updatedInvoices,
      };
    }

    // Payment Receipt Generator Library
    case "GENERATE_RECEIPT": {
      const { invoiceId, paymentId, format } = action.payload;

      // Find the payment to get the amount
      const payment = state.payments.find((p) => p.id === paymentId);

      if (!payment) {
        return state; // Payment not found
      }

      const newReceipt: Receipt = {
        id: generateId(),
        invoiceId,
        paymentId,
        amount: payment.amount,
        date: new Date().toISOString(),
        format,
      };

      return {
        ...state,
        receipts: [...state.receipts, newReceipt],
      };
    }

    // Invoice Status Tracking SDK
    case "UPDATE_INVOICE_STATUS": {
      const { invoiceId, status } = action.payload;

      return {
        ...state,
        invoices: state.invoices.map((invoice) =>
          invoice.id === invoiceId
            ? { ...invoice, status, updatedAt: new Date().toISOString() }
            : invoice
        ),
      };
    }

    // Invoice Summary Report SDK
    case "GENERATE_INVOICE_SUMMARY_REPORT": {
      const { dateRange, filters } = action.payload;

      // Filter invoices by date range and other filters
      const filteredInvoices = state.invoices.filter((invoice) => {
        const invoiceDate = new Date(invoice.createdAt);
        const startDate = new Date(dateRange.start);
        const endDate = new Date(dateRange.end);

        const dateInRange = invoiceDate >= startDate && invoiceDate <= endDate;

        // Apply status filter if provided
        const statusMatch =
          !filters?.status || filters.status.includes(invoice.status);

        // Apply client filter if provided
        const clientMatch =
          !filters?.clientId || invoice.clientId === filters.clientId;

        return dateInRange && statusMatch && clientMatch;
      });

      // Calculate report data
      const totalInvoices = filteredInvoices.length;
      const totalAmount = filteredInvoices.reduce(
        (sum, inv) => sum + inv.total,
        0
      );

      const paidInvoices = filteredInvoices.filter(
        (inv) => inv.status === "paid"
      );
      const paidAmount = paidInvoices.reduce((sum, inv) => sum + inv.total, 0);

      const unpaidInvoices = filteredInvoices.filter((inv) =>
        ["draft", "sent", "partially_paid"].includes(inv.status)
      );
      const unpaidAmount = unpaidInvoices.reduce(
        (sum, inv) => sum + inv.total,
        0
      );

      const overdueInvoices = filteredInvoices.filter(
        (inv) => inv.status === "overdue"
      );
      const overdueAmount = overdueInvoices.reduce(
        (sum, inv) => sum + inv.total,
        0
      );

      // Count invoices by status
      const invoicesByStatus = filteredInvoices.reduce((acc, inv) => {
        acc[inv.status] = (acc[inv.status] || 0) + 1;
        return acc;
      }, {} as Record<InvoiceStatus, number>);

      const newReport: InvoiceSummaryReport = {
        id: generateId(),
        dateRange,
        filters: filters || {},
        data: {
          totalInvoices,
          totalAmount,
          paidAmount,
          unpaidAmount,
          overdueAmount,
          invoicesByStatus,
        },
        generatedAt: new Date().toISOString(),
      };

      return {
        ...state,
        reports: [...state.reports, newReport],
      };
    }

    default:
      return state;
  }
};

// Context
interface CostManagementContextType {
  state: CostManagementState;
  // Navigation
  setActivePage: (page: CostManagementPage) => void;
  // Cost Entry SDK
  addCostEntry: (entry: Omit<CostEntry, "id" | "createdAt">) => void;
  deleteCostEntry: (id: string) => void;
  // Cost Entry Form State Management
  updateCostEntryForm: (formData: Partial<CostManagementState["costEntryForm"]>) => void;
  updateInvoiceForm: (formData: Partial<CostManagementState["invoiceForm"]>) => void;
  // Tax Calculation Library
  calculateTaxForRegion: (subtotal: number, region: TaxRegion) => number;
  getTaxRules: () => TaxRule[];

  // Invoice Generation SDK
  generateInvoice: (
    clientId: string,
    items: Omit<InvoiceItem, "id" | "subtotal">[],
    taxRate: number,
    discountRate: number,
    dueDate: string,
    taxRegion?: TaxRegion
  ) => void;

  // Invoice Editing Library
  editInvoice: (
    id: string,
    updates: Partial<
      Omit<Invoice, "id" | "invoiceNumber" | "createdAt" | "updatedAt">
    >
  ) => void;

  // Invoice Due Reminder SDK
  sendInvoiceReminder: (
    invoiceId: string,
    type: NotificationType,
    clientContact: string,
    message: string
  ) => void;

  // Payment Logging SDK
  logPayment: (
    invoiceId: string,
    amount: number,
    method: PaymentMethod,
    date: string,
    notes?: string
  ) => void;

  // Payment Receipt Generator Library
  generateReceipt: (
    invoiceId: string,
    paymentId: string,
    format: "pdf" | "digital"
  ) => void;

  // Invoice Status Tracking SDK
  updateInvoiceStatus: (invoiceId: string, status: InvoiceStatus) => void;

  // Invoice Summary Report SDK
  generateInvoiceSummaryReport: (
    dateRange: { start: string; end: string },
    filters?: { status?: InvoiceStatus[]; clientId?: string }
  ) => void;
}

const CostManagementContext = createContext<
  CostManagementContextType | undefined
>(undefined);

// Provider Component
interface CostManagementProviderProps {
  children: ReactNode;
}

export const CostManagementProvider: React.FC<CostManagementProviderProps> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(costManagementReducer, initialState);

  // Navigation
  const setActivePage = (page: CostManagementPage) => {
    dispatch({ type: "SET_ACTIVE_PAGE", payload: page });
  };

  // Cost Entry SDK
  const addCostEntry = (entry: Omit<CostEntry, "id" | "createdAt">) => {
    dispatch({ type: "ADD_COST_ENTRY", payload: entry });
  };

  const deleteCostEntry = (id: string) => {
    dispatch({ type: "DELETE_COST_ENTRY", payload: { id } });
  };
  
  // Cost Entry Form State Management
  const updateCostEntryForm = (formData: Partial<CostManagementState["costEntryForm"]>) => {
    dispatch({ type: "UPDATE_COST_ENTRY_FORM", payload: formData });
  };

  // Invoice Form State Management
  const updateInvoiceForm = (formData: Partial<CostManagementState["invoiceForm"]>) => {
    dispatch({ type: "UPDATE_INVOICE_FORM", payload: formData });
  };

  // Invoice Generation SDK
  const generateInvoice = (
    clientId: string,
    items: Omit<InvoiceItem, "id" | "subtotal">[],
    taxRate: number,
    discountRate: number,
    dueDate: string,
    taxRegion?: TaxRegion
  ) => {
    dispatch({
      type: "GENERATE_INVOICE",
      payload: { clientId, items, taxRate, taxRegion, discountRate, dueDate },
    });
  };
  
  // Tax Calculation Library
  const calculateTaxForRegion = (subtotal: number, region: TaxRegion): number => {
    return calculateTaxAmount(subtotal, 0, region);
  };
  
  const getTaxRules = (): TaxRule[] => {
    return [...taxRules];
  };

  // Invoice Editing Library
  const editInvoice = (
    id: string,
    updates: Partial<
      Omit<Invoice, "id" | "invoiceNumber" | "createdAt" | "updatedAt">
    >
  ) => {
    dispatch({ type: "EDIT_INVOICE", payload: { id, updates } });
  };

  // Invoice Due Reminder SDK
  const sendInvoiceReminder = (
    invoiceId: string,
    type: NotificationType,
    clientContact: string,
    message: string
  ) => {
    dispatch({
      type: "SEND_INVOICE_REMINDER",
      payload: { invoiceId, type, clientContact, message },
    });
  };

  // Payment Logging SDK
  const logPayment = (
    invoiceId: string,
    amount: number,
    method: PaymentMethod,
    date: string,
    notes?: string
  ) => {
    dispatch({
      type: "LOG_PAYMENT",
      payload: { invoiceId, amount, method, date, notes },
    });
  };

  // Payment Receipt Generator Library
  const generateReceipt = (
    invoiceId: string,
    paymentId: string,
    format: "pdf" | "digital"
  ) => {
    dispatch({
      type: "GENERATE_RECEIPT",
      payload: { invoiceId, paymentId, format },
    });
  };

  // Invoice Status Tracking SDK
  const updateInvoiceStatus = (invoiceId: string, status: InvoiceStatus) => {
    dispatch({ type: "UPDATE_INVOICE_STATUS", payload: { invoiceId, status } });
  };

  // Invoice Summary Report SDK
  const generateInvoiceSummaryReport = (
    dateRange: { start: string; end: string },
    filters?: { status?: InvoiceStatus[]; clientId?: string }
  ) => {
    dispatch({
      type: "GENERATE_INVOICE_SUMMARY_REPORT",
      payload: { dateRange, filters },
    });
  };

  const value = {
    state,
    setActivePage,
    addCostEntry,
    deleteCostEntry,
    updateCostEntryForm,
    updateInvoiceForm,
    calculateTaxForRegion,
    getTaxRules,
    generateInvoice,
    editInvoice,
    sendInvoiceReminder,
    logPayment,
    generateReceipt,
    updateInvoiceStatus,
    generateInvoiceSummaryReport,
  };

  return (
    <CostManagementContext.Provider value={value}>
      {children}
    </CostManagementContext.Provider>
  );
};

// Custom Hook for using the context
export const useCostManagement = (): CostManagementContextType => {
  const context = useContext(CostManagementContext);
  if (context === undefined) {
    throw new Error(
      "useCostManagement must be used within a CostManagementProvider"
    );
  }
  return context;
};
