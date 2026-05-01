// SFI Platform — Mock data layer
// All data centers around Jobs (atomic unit). Other entities reference jobId.

export type RegId =
  | "SEA EXPORT"
  | "SEA IMPORT"
  | "AIR EXPORT"
  | "AIR IMPORT"
  | "LAND PORT EXPORT"
  | "LAND PORT IMPORT";

export type JobStatus = "ACTIVE" | "PENDING DOCS" | "CLEARED" | "INCOMPLETE" | "COMPLETED" | "HOLD" | "CANCELLED";

export type Currency = "USD" | "EUR" | "GBP";

export interface Party {
  id: string;
  name: string;
  address: string;
  contact: string;
  concerns: string[]; // sub-companies / divisions
}

export interface Job {
  jobNo: string;
  jobDate: string; // ISO
  jobYear: number;
  regId: RegId;
  jobType: "EXPORT" | "IMPORT";
  shipmentMode: "Sea" | "Air" | "Land";
  status: JobStatus;
  completion: number; // 0..100
  // parties
  partyId: string;
  partyName: string;
  concern: string;
  consigneeName: string;
  consigneeAddress: string;
  // shipment
  goodsDescription: string;
  packageQty: number;
  packageType: string;
  cbm: number;
  grossWeight: number;
  netWeight: number;
  cfValue: number;
  currency: Currency;
  exchangeRate: number;
  cfValueBdt: number;
  assessableValue: number;
  unitValue: number;
  // documentation
  beNo?: string;
  beDate?: string;
  invoiceNo?: string;
  invoiceDate?: string;
  lcNo?: string;
  lcDate?: string;
  ipEpNo?: string;
  ipEpDate?: string;
  hsCode?: string;
  // air-only
  awbNo?: string;
  awbDate?: string;
  // shipping/logistics
  blNo?: string;
  blDate?: string;
  containerNo?: string;
  vesselName?: string;
  shippingAgent?: string;
  offDock?: string;
  transportName?: string;
  station: "Chittagong Port" | "Benapole" | "Hazrat Shahjalal Airport";
  remarks?: string;
  portCharge: "NIL" | "Paid" | "Pending";
  commission: number;
  // assignment
  assignedTo: string;
  lastUpdate: string; // ISO date of last modification
}

export const parties: Party[] = [
  {
    id: "p1",
    name: "Rahman Fabrics Ltd.",
    address: "Plot 42, BSCIC, Gazipur",
    contact: "+880 1711 234567",
    concerns: ["Rahman Knitwear", "Rahman Yarn Division"],
  },
  {
    id: "p2",
    name: "Bengal Pharma Industries",
    address: "Tongi I/A, Dhaka",
    contact: "+880 1812 345678",
    concerns: ["Bengal Pharma Export Unit", "Bengal API"],
  },
  {
    id: "p3",
    name: "Padma Electronics",
    address: "Motijheel C/A, Dhaka",
    contact: "+880 1913 456789",
    concerns: ["Padma Mobile", "Padma Home Appliance"],
  },
  {
    id: "p4",
    name: "Meghna Textile Mills",
    address: "Narayanganj",
    contact: "+880 1614 567890",
    concerns: ["Meghna Garments"],
  },
  {
    id: "p5",
    name: "Surma FMCG Ltd.",
    address: "Sylhet",
    contact: "+880 1515 678901",
    concerns: ["Surma Foods", "Surma Beverage"],
  },
];

export const expenseHeads = [
  "Customs Duty",
  "VAT (AT)",
  "Port Charge",
  "Shipping Line Charge",
  "Off-Dock Handling",
  "Transport (Truck)",
  "Documentation",
  "Survey Fee",
  "Demurrage",
  "Labour",
  "Misc",
];

export const shippingAgents = [
  "Maersk Bangladesh",
  "MSC Bangladesh",
  "CMA CGM Bangladesh",
  "Hapag-Lloyd",
  "ONE Line",
  "Evergreen",
];

export const offDocks = ["NIL", "Summit Alliance Off-Dock", "QNS Container Services", "Ocean Container Ltd."];

export const stations = ["Chittagong Port", "Benapole", "Hazrat Shahjalal Airport"] as const;

const today = new Date();
const daysAgo = (n: number) => {
  const d = new Date(today);
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
};

export const jobs: Job[] = [
  {
    jobNo: "1345",
    jobDate: daysAgo(2),
    jobYear: today.getFullYear(),
    regId: "SEA IMPORT",
    jobType: "IMPORT",
    shipmentMode: "Sea",
    status: "ACTIVE",
    completion: 60,
    partyId: "p1",
    partyName: "Rahman Fabrics Ltd.",
    concern: "Rahman Knitwear",
    consigneeName: "Rahman Knitwear",
    consigneeAddress: "Plot 42, BSCIC, Gazipur",
    goodsDescription: "100% Cotton Yarn - 30s",
    packageQty: 480,
    packageType: "Bags",
    cbm: 64.5,
    grossWeight: 12500,
    netWeight: 12000,
    cfValue: 48000,
    currency: "USD",
    exchangeRate: 119.5,
    cfValueBdt: 5736000,
    assessableValue: 5800000,
    unitValue: 100,
    beNo: "BE-2024-08712",
    beDate: daysAgo(1),
    invoiceNo: "INV-CN-44211",
    invoiceDate: daysAgo(20),
    lcNo: "LC-DBBL-771",
    lcDate: daysAgo(35),
    ipEpNo: "IP-2024-3344",
    ipEpDate: daysAgo(30),
    hsCode: "5205.13.00",
    blNo: "MAEU-BD-998877",
    blDate: daysAgo(8),
    containerNo: "MSKU-7788991",
    vesselName: "MV Maersk Chittagong",
    shippingAgent: "Maersk Bangladesh",
    offDock: "Summit Alliance Off-Dock",
    transportName: "Karim Transport",
    station: "Chittagong Port",
    remarks: "Cotton bales — handle dry",
    portCharge: "Pending",
    commission: 25000,
    assignedTo: "Nadia Islam",
  },
  {
    jobNo: "1346",
    jobDate: daysAgo(5),
    jobYear: today.getFullYear(),
    regId: "AIR IMPORT",
    jobType: "IMPORT",
    shipmentMode: "Air",
    status: "PENDING DOCS",
    completion: 35,
    partyId: "p2",
    partyName: "Bengal Pharma Industries",
    concern: "Bengal API",
    consigneeName: "Bengal API",
    consigneeAddress: "Tongi I/A, Dhaka",
    goodsDescription: "API raw materials (cold chain)",
    packageQty: 24,
    packageType: "Cartons",
    cbm: 3.2,
    grossWeight: 480,
    netWeight: 420,
    cfValue: 78000,
    currency: "USD",
    exchangeRate: 119.5,
    cfValueBdt: 9321000,
    assessableValue: 9400000,
    unitValue: 3250,
    invoiceNo: "INV-IN-991",
    invoiceDate: daysAgo(7),
    hsCode: "2941.90.00",
    awbNo: "AWB-176-22113344",
    awbDate: daysAgo(5),
    station: "Hazrat Shahjalal Airport",
    portCharge: "NIL",
    commission: 18000,
    assignedTo: "Nadia Islam",
  },
  {
    jobNo: "1347",
    jobDate: daysAgo(8),
    jobYear: today.getFullYear(),
    regId: "SEA EXPORT",
    jobType: "EXPORT",
    shipmentMode: "Sea",
    status: "CLEARED",
    completion: 90,
    partyId: "p4",
    partyName: "Meghna Textile Mills",
    concern: "Meghna Garments",
    consigneeName: "H&M Sweden AB",
    consigneeAddress: "Stockholm, Sweden",
    goodsDescription: "Knit T-shirts (men's)",
    packageQty: 1240,
    packageType: "Cartons",
    cbm: 88.4,
    grossWeight: 14800,
    netWeight: 14000,
    cfValue: 96000,
    currency: "USD",
    exchangeRate: 119.5,
    cfValueBdt: 11472000,
    assessableValue: 11500000,
    unitValue: 4.2,
    invoiceNo: "INV-EXP-2231",
    invoiceDate: daysAgo(10),
    hsCode: "6109.10.00",
    blNo: "MSCU-EXP-44551",
    blDate: daysAgo(6),
    containerNo: "MSCU-1122334",
    vesselName: "MSC Diana",
    shippingAgent: "MSC Bangladesh",
    offDock: "NIL",
    transportName: "Sundarban Logistics",
    station: "Chittagong Port",
    portCharge: "Paid",
    commission: 32000,
    assignedTo: "Nadia Islam",
  },
  {
    jobNo: "1348",
    jobDate: daysAgo(12),
    jobYear: today.getFullYear(),
    regId: "LAND PORT IMPORT",
    jobType: "IMPORT",
    shipmentMode: "Land",
    status: "INCOMPLETE",
    completion: 45,
    partyId: "p3",
    partyName: "Padma Electronics",
    concern: "Padma Home Appliance",
    consigneeName: "Padma Home Appliance",
    consigneeAddress: "Motijheel, Dhaka",
    goodsDescription: "LED panels & accessories",
    packageQty: 320,
    packageType: "Cartons",
    cbm: 42.0,
    grossWeight: 5800,
    netWeight: 5400,
    cfValue: 36000,
    currency: "USD",
    exchangeRate: 119.5,
    cfValueBdt: 4302000,
    assessableValue: 4350000,
    unitValue: 112,
    invoiceNo: "INV-IN-7714",
    invoiceDate: daysAgo(14),
    hsCode: "8528.72.00",
    station: "Benapole",
    portCharge: "Pending",
    commission: 15000,
    assignedTo: "Nadia Islam",
  },
  {
    jobNo: "1342",
    jobDate: daysAgo(28),
    jobYear: today.getFullYear(),
    regId: "SEA IMPORT",
    jobType: "IMPORT",
    shipmentMode: "Sea",
    status: "COMPLETED",
    completion: 100,
    partyId: "p5",
    partyName: "Surma FMCG Ltd.",
    concern: "Surma Foods",
    consigneeName: "Surma Foods",
    consigneeAddress: "Sylhet",
    goodsDescription: "Edible oil (palm) drums",
    packageQty: 600,
    packageType: "Drums",
    cbm: 120,
    grossWeight: 24000,
    netWeight: 23000,
    cfValue: 58000,
    currency: "USD",
    exchangeRate: 118.0,
    cfValueBdt: 6844000,
    assessableValue: 6900000,
    unitValue: 96,
    beNo: "BE-2024-08512",
    beDate: daysAgo(20),
    invoiceNo: "INV-MY-3321",
    invoiceDate: daysAgo(40),
    hsCode: "1511.90.00",
    blNo: "ONE-771122",
    containerNo: "ONEU-9988771",
    vesselName: "ONE Harmony",
    shippingAgent: "ONE Line",
    station: "Chittagong Port",
    portCharge: "Paid",
    commission: 28000,
    assignedTo: "Nadia Islam",
  },
];

export interface Expense {
  id: string;
  jobNo: string;
  expenseHead: string;
  amount: number;
  description: string;
  date: string;
  approvedBy?: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
}

export const expenses: Expense[] = [
  { id: "e1", jobNo: "1345", expenseHead: "Customs Duty", amount: 1450000, description: "Duty paid via DBBL", date: daysAgo(1), status: "APPROVED", approvedBy: "Tanvir Rahim" },
  { id: "e2", jobNo: "1345", expenseHead: "Port Charge", amount: 78000, description: "CPA charges", date: daysAgo(1), status: "PENDING" },
  { id: "e3", jobNo: "1345", expenseHead: "Off-Dock Handling", amount: 42000, description: "Summit Alliance", date: daysAgo(1), status: "PENDING" },
  { id: "e4", jobNo: "1346", expenseHead: "Documentation", amount: 8500, description: "Air courier docs", date: daysAgo(4), status: "APPROVED", approvedBy: "Karim Hossain" },
  { id: "e5", jobNo: "1347", expenseHead: "Shipping Line Charge", amount: 95000, description: "MSC THC", date: daysAgo(7), status: "APPROVED", approvedBy: "Tanvir Rahim" },
  { id: "e6", jobNo: "1347", expenseHead: "Transport (Truck)", amount: 22000, description: "Factory to port", date: daysAgo(8), status: "APPROVED", approvedBy: "Tanvir Rahim" },
  { id: "e7", jobNo: "1348", expenseHead: "Customs Duty", amount: 870000, description: "Duty (partial)", date: daysAgo(10), status: "PENDING" },
  { id: "e8", jobNo: "1342", expenseHead: "Customs Duty", amount: 1620000, description: "Duty paid", date: daysAgo(25), status: "APPROVED", approvedBy: "Tanvir Rahim" },
];

export interface Bill {
  id: string;
  billNo: string;
  jobNo: string;
  partyName: string;
  billAmount: number;
  billDate: string;
  dueDate: string;
  status: "PENDING" | "FORWARDED" | "PAID" | "PARTIAL";
  forwardedDate?: string;
  forwardRef?: string;
}

export const bills: Bill[] = [
  { id: "b1", billNo: "BILL-2024-0451", jobNo: "1345", partyName: "Rahman Fabrics Ltd.", billAmount: 1745000, billDate: daysAgo(1), dueDate: daysAgo(-14), status: "PENDING" },
  { id: "b2", billNo: "BILL-2024-0449", jobNo: "1347", partyName: "Meghna Textile Mills", billAmount: 1280000, billDate: daysAgo(5), dueDate: daysAgo(-10), status: "FORWARDED", forwardedDate: daysAgo(4), forwardRef: "FWD-991" },
  { id: "b3", billNo: "BILL-2024-0445", jobNo: "1342", partyName: "Surma FMCG Ltd.", billAmount: 1980000, billDate: daysAgo(22), dueDate: daysAgo(-7), status: "PAID" },
  { id: "b4", billNo: "BILL-2024-0440", jobNo: "1348", partyName: "Padma Electronics", billAmount: 980000, billDate: daysAgo(9), dueDate: daysAgo(5), status: "PARTIAL" },
];

export type DispatchStatus = "Cleared" | "Truck Assigned" | "In Transit" | "Delivered";

export interface Dispatch {
  id: string;
  jobNo: string;
  partyName: string;
  destination: string;
  transportName: string;
  vehicleNo?: string;
  driverContact?: string;
  status: DispatchStatus;
  podUrl?: string;
}

export const dispatches: Dispatch[] = [
  { id: "d1", jobNo: "1347", partyName: "Meghna Textile Mills", destination: "Chittagong Port Yard 3", transportName: "Sundarban Logistics", vehicleNo: "DM-CHA-1144", driverContact: "+880 1711 998877", status: "Delivered", podUrl: "/pod/d1.jpg" },
  { id: "d2", jobNo: "1345", partyName: "Rahman Fabrics Ltd.", destination: "Gazipur Factory", transportName: "Karim Transport", vehicleNo: "DM-LA-7789", driverContact: "+880 1812 112233", status: "Truck Assigned" },
  { id: "d3", jobNo: "1342", partyName: "Surma FMCG Ltd.", destination: "Sylhet Warehouse", transportName: "Surma Carriers", vehicleNo: "DM-SY-2231", status: "In Transit" },
  { id: "d4", jobNo: "1348", partyName: "Padma Electronics", destination: "Motijheel Warehouse", transportName: "Pending Assignment", status: "Cleared" },
];

export interface TransportVendor {
  id: string;
  name: string;
  contact: string;
  routeSpec: string;
  ratePerTrip: number;
  active: boolean;
}

export const transportVendors: TransportVendor[] = [
  { id: "v1", name: "Karim Transport", contact: "+880 1812 112233", routeSpec: "Chittagong → Dhaka/Gazipur", ratePerTrip: 28000, active: true },
  { id: "v2", name: "Sundarban Logistics", contact: "+880 1711 998877", routeSpec: "Chittagong → Anywhere", ratePerTrip: 32000, active: true },
  { id: "v3", name: "Surma Carriers", contact: "+880 1515 776655", routeSpec: "Chittagong → Sylhet", ratePerTrip: 38000, active: true },
  { id: "v4", name: "Benapole Express", contact: "+880 1614 223344", routeSpec: "Benapole → Dhaka", ratePerTrip: 22000, active: true },
  { id: "v5", name: "Old Reliable Tpt", contact: "+880 1313 445566", routeSpec: "Local Dhaka", ratePerTrip: 8000, active: false },
];

export interface ActivityLog {
  id: string;
  timestamp: string;
  user: string;
  role: string;
  action: string;
  recordType: string;
  recordId: string;
}

export const activityLogs: ActivityLog[] = [
  { id: "a1", timestamp: new Date().toISOString(), user: "Nadia Islam", role: "Operations", action: "Created", recordType: "Job", recordId: "1345" },
  { id: "a2", timestamp: new Date(Date.now() - 3600000).toISOString(), user: "Tanvir Rahim", role: "Accounts", action: "Approved Expense", recordType: "Expense", recordId: "e1" },
  { id: "a3", timestamp: new Date(Date.now() - 7200000).toISOString(), user: "Karim Hossain", role: "Manager", action: "Forwarded Bill", recordType: "Bill", recordId: "b2" },
  { id: "a4", timestamp: new Date(Date.now() - 86400000).toISOString(), user: "Nadia Islam", role: "Operations", action: "Updated Status", recordType: "Job", recordId: "1347" },
];

export interface Voucher {
  id: string;
  voucherNo: string;
  date: string;
  type: "Receipt" | "Payment" | "Journal" | "Contra";
  debitAccount: string;
  creditAccount: string;
  amount: number;
  narration: string;
  jobNo?: string;
}

export const vouchers: Voucher[] = [
  { id: "v1", voucherNo: "RV-2024-1101", date: daysAgo(1), type: "Receipt", debitAccount: "DBBL Bank", creditAccount: "Rahman Fabrics Ltd.", amount: 500000, narration: "Advance against Job 1345", jobNo: "1345" },
  { id: "v2", voucherNo: "PV-2024-2231", date: daysAgo(2), type: "Payment", debitAccount: "Customs Duty", creditAccount: "DBBL Bank", amount: 1450000, narration: "Duty Job 1345", jobNo: "1345" },
  { id: "v3", voucherNo: "JV-2024-091", date: daysAgo(3), type: "Journal", debitAccount: "Office Rent", creditAccount: "Rent Payable", amount: 75000, narration: "Office rent accrual" },
];

export const chartOfAccounts = [
  { code: "1000", name: "Cash in Hand", type: "Asset" },
  { code: "1010", name: "DBBL Bank", type: "Asset" },
  { code: "1020", name: "EBL Bank", type: "Asset" },
  { code: "1100", name: "Accounts Receivable", type: "Asset" },
  { code: "2000", name: "Accounts Payable", type: "Liability" },
  { code: "2100", name: "Rent Payable", type: "Liability" },
  { code: "3000", name: "Capital", type: "Equity" },
  { code: "4000", name: "Service Revenue", type: "Income" },
  { code: "4010", name: "Commission Income", type: "Income" },
  { code: "5000", name: "Customs Duty", type: "Expense" },
  { code: "5010", name: "Port Charge", type: "Expense" },
  { code: "5020", name: "Office Rent", type: "Expense" },
  { code: "5030", name: "Salaries", type: "Expense" },
];

// Helpers
export const fmtBDT = (n: number) =>
  "৳" + n.toLocaleString("en-BD", { maximumFractionDigits: 0 });

export const fmtDate = (iso: string) => {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
};

export const statusVariant = (s: JobStatus): "active" | "warn" | "info" | "danger" | "muted" => {
  switch (s) {
    case "ACTIVE":
      return "active";
    case "PENDING DOCS":
      return "warn";
    case "CLEARED":
      return "info";
    case "INCOMPLETE":
      return "danger";
    case "COMPLETED":
      return "muted";
    case "HOLD":
      return "warn";
    case "CANCELLED":
      return "danger";
  }
};
