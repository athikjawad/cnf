export type ShipmentStatus =
  | "Documents Pending"
  | "Arrived at Port"
  | "Customs Review"
  | "Cleared"
  | "Truck Assigned"
  | "In Transit"
  | "Delivered"
  | "Delayed";

export type ShipmentMode = "Sea" | "Air" | "Land";
export type ShipmentType = "Import" | "Export";
export type Port = "Chittagong" | "Mongla" | "Hazrat Shahjalal" | "Benapole";

export interface Shipment {
  id: string;
  jobNo: string;
  client: string;
  type: ShipmentType;
  mode: ShipmentMode;
  port: Port;
  blNo: string;
  containerNo: string;
  commodity: string;
  origin: string;
  destination: string;
  status: ShipmentStatus;
  eta: string;
  value: number;
  profit: number;
  assignedTo: string;
  createdAt: string;
}

export interface Client {
  id: string;
  name: string;
  contact: string;
  phone: string;
  email: string;
  address: string;
  industry: string;
  shipments: number;
  outstanding: number;
  totalRevenue: number;
}

export interface Task {
  id: string;
  title: string;
  shipmentJobNo: string;
  assignee: string;
  dueDate: string;
  priority: "Low" | "Medium" | "High" | "Urgent";
  status: "Open" | "In Progress" | "Done";
}

export interface Document {
  id: string;
  name: string;
  type: "BL" | "Invoice" | "Packing List" | "LC" | "Certificate of Origin" | "Customs Bill";
  shipmentJobNo: string;
  uploadedBy: string;
  uploadedAt: string;
  status: "Verified" | "Pending Review" | "Issue Found";
  size: string;
}

export interface Transport {
  id: string;
  vendor: string;
  truckNo: string;
  driver: string;
  phone: string;
  route: string;
  rate: number;
  shipmentJobNo: string;
  status: "Available" | "Booked" | "In Transit" | "Delivered";
}

export interface Invoice {
  id: string;
  invoiceNo: string;
  client: string;
  shipmentJobNo: string;
  amount: number;
  paid: number;
  due: number;
  issuedDate: string;
  dueDate: string;
  status: "Paid" | "Partial" | "Overdue" | "Pending";
}

export const shipments: Shipment[] = [
  { id: "1", jobNo: "JOB-2025-1042", client: "Apex Garments Ltd.", type: "Import", mode: "Sea", port: "Chittagong", blNo: "MAEU-7820145", containerNo: "MSKU-4421809", commodity: "Cotton Fabric (China)", origin: "Shanghai, CN", destination: "Gazipur", status: "Customs Review", eta: "2025-04-22", value: 84500, profit: 4200, assignedTo: "Karim Hossain", createdAt: "2025-04-08" },
  { id: "2", jobNo: "JOB-2025-1041", client: "Bengal Pharma", type: "Import", mode: "Air", port: "Hazrat Shahjalal", blNo: "AWB-235-44190", containerNo: "—", commodity: "Pharmaceutical APIs", origin: "Mumbai, IN", destination: "Tongi", status: "Cleared", eta: "2025-04-19", value: 32100, profit: 2800, assignedTo: "Nadia Rahman", createdAt: "2025-04-15" },
  { id: "3", jobNo: "JOB-2025-1040", client: "Star Electronics BD", type: "Import", mode: "Sea", port: "Chittagong", blNo: "EVRG-8841220", containerNo: "EGHU-7710043", commodity: "LED TV Panels", origin: "Busan, KR", destination: "Dhaka", status: "In Transit", eta: "2025-04-20", value: 121000, profit: 6500, assignedTo: "Karim Hossain", createdAt: "2025-04-02" },
  { id: "4", jobNo: "JOB-2025-1039", client: "Apex Garments Ltd.", type: "Export", mode: "Sea", port: "Chittagong", blNo: "ONEY-3340119", containerNo: "TGHU-9920381", commodity: "Knit Garments", origin: "Gazipur", destination: "Hamburg, DE", status: "Delivered", eta: "2025-04-15", value: 215000, profit: 9800, assignedTo: "Sumon Ali", createdAt: "2025-03-28" },
  { id: "5", jobNo: "JOB-2025-1038", client: "Greenfield FMCG", type: "Import", mode: "Land", port: "Benapole", blNo: "LND-22041", containerNo: "—", commodity: "Edible Oil Drums", origin: "Kolkata, IN", destination: "Jessore", status: "Delayed", eta: "2025-04-18", value: 45200, profit: -800, assignedTo: "Sumon Ali", createdAt: "2025-04-10" },
  { id: "6", jobNo: "JOB-2025-1037", client: "Modhumoti Foods", type: "Import", mode: "Sea", port: "Mongla", blNo: "HLCU-6620412", containerNo: "HLXU-3329910", commodity: "Wheat", origin: "Sydney, AU", destination: "Khulna", status: "Truck Assigned", eta: "2025-04-21", value: 67800, profit: 3400, assignedTo: "Nadia Rahman", createdAt: "2025-04-05" },
  { id: "7", jobNo: "JOB-2025-1036", client: "Square Machinery", type: "Import", mode: "Sea", port: "Chittagong", blNo: "CMA-5520199", containerNo: "CMAU-1180420", commodity: "Industrial Machinery", origin: "Hamburg, DE", destination: "Narayanganj", status: "Documents Pending", eta: "2025-04-25", value: 156000, profit: 7200, assignedTo: "Karim Hossain", createdAt: "2025-04-12" },
  { id: "8", jobNo: "JOB-2025-1035", client: "Bengal Pharma", type: "Import", mode: "Air", port: "Hazrat Shahjalal", blNo: "AWB-176-33028", containerNo: "—", commodity: "Vaccine Cold Chain", origin: "Frankfurt, DE", destination: "Dhaka", status: "Arrived at Port", eta: "2025-04-19", value: 88400, profit: 5100, assignedTo: "Nadia Rahman", createdAt: "2025-04-16" },
];

export const clients: Client[] = [
  { id: "c1", name: "Apex Garments Ltd.", contact: "Md. Tariq Aziz", phone: "+880 1711-220190", email: "tariq@apexgarments.bd", address: "Plot 41, Konabari, Gazipur", industry: "RMG / Garments", shipments: 24, outstanding: 8200, totalRevenue: 142000 },
  { id: "c2", name: "Bengal Pharma", contact: "Dr. Sharmin Akter", phone: "+880 1819-445201", email: "procure@bengalpharma.com", address: "Tongi I/A, Gazipur", industry: "Pharmaceutical", shipments: 18, outstanding: 4400, totalRevenue: 96500 },
  { id: "c3", name: "Star Electronics BD", contact: "Imran Khan", phone: "+880 1755-118840", email: "imran@starelec.bd", address: "Motijheel C/A, Dhaka", industry: "Electronics", shipments: 12, outstanding: 12500, totalRevenue: 78200 },
  { id: "c4", name: "Greenfield FMCG", contact: "Rezaul Karim", phone: "+880 1922-662201", email: "ops@greenfield.bd", address: "Jessore Road, Khulna", industry: "FMCG", shipments: 9, outstanding: 2100, totalRevenue: 41800 },
  { id: "c5", name: "Modhumoti Foods", contact: "Faria Hossain", phone: "+880 1711-009912", email: "faria@modhumoti.bd", address: "Khulna BSCIC", industry: "FMCG", shipments: 14, outstanding: 0, totalRevenue: 62200 },
  { id: "c6", name: "Square Machinery", contact: "Anwar Sadat", phone: "+880 1733-201144", email: "anwar@squaremach.bd", address: "Narayanganj EPZ", industry: "Machinery", shipments: 6, outstanding: 18900, totalRevenue: 54100 },
];

export const tasks: Task[] = [
  { id: "t1", title: "Submit Bill of Entry to Customs", shipmentJobNo: "JOB-2025-1042", assignee: "Karim Hossain", dueDate: "2025-04-20", priority: "Urgent", status: "In Progress" },
  { id: "t2", title: "Collect Delivery Order from Shipping Line", shipmentJobNo: "JOB-2025-1037", assignee: "Nadia Rahman", dueDate: "2025-04-21", priority: "High", status: "Open" },
  { id: "t3", title: "Verify HS Code for LED Panels", shipmentJobNo: "JOB-2025-1040", assignee: "Karim Hossain", dueDate: "2025-04-19", priority: "High", status: "Done" },
  { id: "t4", title: "Arrange covered van — Khulna to Jessore", shipmentJobNo: "JOB-2025-1038", assignee: "Sumon Ali", dueDate: "2025-04-19", priority: "Urgent", status: "In Progress" },
  { id: "t5", title: "Re-submit packing list — qty mismatch", shipmentJobNo: "JOB-2025-1036", assignee: "Karim Hossain", dueDate: "2025-04-22", priority: "Medium", status: "Open" },
  { id: "t6", title: "Coordinate cold-chain handover", shipmentJobNo: "JOB-2025-1035", assignee: "Nadia Rahman", dueDate: "2025-04-19", priority: "Urgent", status: "Open" },
  { id: "t7", title: "Final delivery confirmation", shipmentJobNo: "JOB-2025-1039", assignee: "Sumon Ali", dueDate: "2025-04-15", priority: "Low", status: "Done" },
];

export const documents: Document[] = [
  { id: "d1", name: "BL_MAEU-7820145.pdf", type: "BL", shipmentJobNo: "JOB-2025-1042", uploadedBy: "Karim Hossain", uploadedAt: "2025-04-09", status: "Verified", size: "412 KB" },
  { id: "d2", name: "Invoice_APX-220419.pdf", type: "Invoice", shipmentJobNo: "JOB-2025-1042", uploadedBy: "Karim Hossain", uploadedAt: "2025-04-09", status: "Verified", size: "188 KB" },
  { id: "d3", name: "PackingList_APX-220419.pdf", type: "Packing List", shipmentJobNo: "JOB-2025-1042", uploadedBy: "Karim Hossain", uploadedAt: "2025-04-09", status: "Issue Found", size: "96 KB" },
  { id: "d4", name: "BL_EVRG-8841220.pdf", type: "BL", shipmentJobNo: "JOB-2025-1040", uploadedBy: "Karim Hossain", uploadedAt: "2025-04-03", status: "Verified", size: "388 KB" },
  { id: "d5", name: "LC_BEN-PHARMA-0418.pdf", type: "LC", shipmentJobNo: "JOB-2025-1041", uploadedBy: "Nadia Rahman", uploadedAt: "2025-04-15", status: "Verified", size: "240 KB" },
  { id: "d6", name: "COO_China_APX.pdf", type: "Certificate of Origin", shipmentJobNo: "JOB-2025-1042", uploadedBy: "Karim Hossain", uploadedAt: "2025-04-10", status: "Pending Review", size: "144 KB" },
  { id: "d7", name: "Invoice_SQM-220425.pdf", type: "Invoice", shipmentJobNo: "JOB-2025-1036", uploadedBy: "Karim Hossain", uploadedAt: "2025-04-13", status: "Issue Found", size: "210 KB" },
];

export const transports: Transport[] = [
  { id: "tr1", vendor: "Padma Transport", truckNo: "Dhaka Metro-Ta-15-9912", driver: "Jamal Uddin", phone: "+880 1712-330912", route: "Chittagong → Gazipur", rate: 22000, shipmentJobNo: "JOB-2025-1042", status: "Booked" },
  { id: "tr2", vendor: "Meghna Logistics", truckNo: "Ctg Metro-Tha-11-2234", driver: "Rofiqul Islam", phone: "+880 1819-441120", route: "Chittagong → Dhaka", rate: 19500, shipmentJobNo: "JOB-2025-1040", status: "In Transit" },
  { id: "tr3", vendor: "Karnaphuli Trans.", truckNo: "Ctg Metro-Ta-14-7740", driver: "Mostafa Kamal", phone: "+880 1733-220914", route: "Mongla → Khulna", rate: 9800, shipmentJobNo: "JOB-2025-1037", status: "Booked" },
  { id: "tr4", vendor: "Padma Transport", truckNo: "Dhaka Metro-Ta-19-4421", driver: "Selim Mia", phone: "+880 1922-110044", route: "Benapole → Jessore", rate: 7200, shipmentJobNo: "JOB-2025-1038", status: "Delivered" },
  { id: "tr5", vendor: "Bengal Movers", truckNo: "Dhaka Metro-Ta-22-8810", driver: "Habibur Rahman", phone: "+880 1711-554420", route: "Available", rate: 0, shipmentJobNo: "—", status: "Available" },
];

export const invoices: Invoice[] = [
  { id: "i1", invoiceNo: "INV-2025-0421", client: "Apex Garments Ltd.", shipmentJobNo: "JOB-2025-1039", amount: 9800, paid: 9800, due: 0, issuedDate: "2025-04-15", dueDate: "2025-04-30", status: "Paid" },
  { id: "i2", invoiceNo: "INV-2025-0420", client: "Star Electronics BD", shipmentJobNo: "JOB-2025-1040", amount: 6500, paid: 0, due: 6500, issuedDate: "2025-04-10", dueDate: "2025-04-25", status: "Pending" },
  { id: "i3", invoiceNo: "INV-2025-0419", client: "Square Machinery", shipmentJobNo: "JOB-2025-1036", amount: 7200, paid: 0, due: 7200, issuedDate: "2025-03-28", dueDate: "2025-04-12", status: "Overdue" },
  { id: "i4", invoiceNo: "INV-2025-0418", client: "Bengal Pharma", shipmentJobNo: "JOB-2025-1041", amount: 2800, paid: 1400, due: 1400, issuedDate: "2025-04-12", dueDate: "2025-04-27", status: "Partial" },
  { id: "i5", invoiceNo: "INV-2025-0417", client: "Modhumoti Foods", shipmentJobNo: "JOB-2025-1037", amount: 3400, paid: 3400, due: 0, issuedDate: "2025-04-08", dueDate: "2025-04-23", status: "Paid" },
  { id: "i6", invoiceNo: "INV-2025-0416", client: "Greenfield FMCG", shipmentJobNo: "JOB-2025-1038", amount: 2100, paid: 0, due: 2100, issuedDate: "2025-03-25", dueDate: "2025-04-09", status: "Overdue" },
];

export const monthlyRevenue = [
  { month: "Nov", revenue: 38200, shipments: 18 },
  { month: "Dec", revenue: 42500, shipments: 22 },
  { month: "Jan", revenue: 47800, shipments: 25 },
  { month: "Feb", revenue: 51200, shipments: 28 },
  { month: "Mar", revenue: 58900, shipments: 32 },
  { month: "Apr", revenue: 64200, shipments: 35 },
];

export const portPerformance = [
  { port: "Chittagong", shipments: 48, avgDays: 5.2 },
  { port: "Hazrat Shahjalal", shipments: 22, avgDays: 2.1 },
  { port: "Mongla", shipments: 14, avgDays: 6.0 },
  { port: "Benapole", shipments: 9, avgDays: 3.4 },
];

export const statusColor: Record<ShipmentStatus, string> = {
  "Documents Pending": "bg-warning/15 text-warning-foreground border-warning/40",
  "Arrived at Port": "bg-info/15 text-info border-info/40",
  "Customs Review": "bg-accent text-accent-foreground border-accent",
  "Cleared": "bg-success/15 text-success border-success/40",
  "Truck Assigned": "bg-primary/10 text-primary border-primary/30",
  "In Transit": "bg-primary/15 text-primary border-primary/40",
  "Delivered": "bg-success/20 text-success border-success/50",
  "Delayed": "bg-destructive/15 text-destructive border-destructive/40",
};
