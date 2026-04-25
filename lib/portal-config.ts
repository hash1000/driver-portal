export type Role = "admin" | "driver";

export type User = {
  id: string;
  username: string;
  password: string;
  name: string;
  role: Role;
};

export type Job = {
  id: string;
  contract: string;
  reg: string;
  date: string;
  completedDate?: string;
  collectionSite: string;
  destinationSite?: string;
  jobRef: string;
  arrivalTime: string;
  exitTime?: string;
  completeArrivalTime?: string;
  completeDepartureTime?: string;
  completeJobRef?: string;
  collectionReference?: string;
  costingType?: "per_load" | "per_tonne";
  costingPrice?: string;
  costingWeight?: string;
  costingTotal?: string;
  notes?: string;
  destinationNotes?: string;
  driverUsername?: string;
  driverName?: string;
};

export type FuelEntry = {
  id: string;
  type: string;
  litres: string;
  reg: string;
  date: string;
  driverUsername?: string;
  driverName?: string;
};

export type IssueReport = {
  id: string;
  text: string;
  driverUsername?: string;
  driverName?: string;
  reg: string;
  contract: string;
  date: string;
};

export type MileageEntry = {
  id: string;
  date: string;
  reg: string;
  openingMileage?: string;
  closingMileage?: string;
  driverUsername?: string;
  driverName?: string;
};

export type SiteEntry = {
  name: string;
  siteType: "collection" | "destination" | "both";
};

export type PortalData = {
  users: User[];
  contracts: string[];
  vehicleRegs: string[];
  sitesByContract: Record<string, string[]>;
  destinationSitesByContract: Record<string, string[]>;
  allSitesByContract: Record<string, SiteEntry[]>;
  activeJobs: Job[];
  semiCompletedJobs: Job[];
  completedJobs: Job[];
  fuelEntries: FuelEntry[];
  mileageEntries: MileageEntry[];
  issueReports: IssueReport[];
};

export const DEFAULT_DRIVERS: User[] = [
  { id: "admin", username: "admin", password: "password123", name: "Admin", role: "admin" },
  ...Array.from({ length: 20 }, (_, i) => ({
    id: `driver-${String(i + 1).padStart(2, "0")}`,
    username: `driver${String(i + 1).padStart(2, "0")}`,
    password: "password123",
    name: `Driver ${String(i + 1).padStart(2, "0")}`,
    role: "driver" as const,
  })),
];

export const INITIAL_CONTRACTS = ["AWM", "J & J Ward", "Mick Hawarth", "Fraser", "Other"];

export const INITIAL_REGS = [
  "BT06 ELL",
  "BT09 ELL",
  "JT04 ELL",
  "JT06 ELL",
  "YN18 JJV",
  "WH68 CEA",
  "GJ15 PDZ",
  "PX15 WLP",
  "NK20 XWR",
  "MK17 WKC",
];

export const INITIAL_SITES_BY_CONTRACT: Record<string, string[]> = {
  AWM: [
    "AWM Barnard",
    "AWM Barnard -> Stourton",
    "AWM Clover Nook",
    "AWM Geldard Road",
    "AWM Stourton",
    "B&M Landor Street",
    "B&M Trafford Park",
    "FCC Chesterfield",
    "Fletchers Sheffield",
    "JWS Salford",
    "LSS Cross Green",
    "MID UK Barkston / Ancaster",
    "MID UK Caythorpe",
    "Peak Waste Ashbourne",
    "Van Werven Selby",
    "WSR Widnes",
  ],
  "J & J Ward": ["B1", "B2", "B3", "B4", "B5"],
  "Mick Hawarth": ["C1", "C2", "C3", "C4", "C5"],
  Fraser: ["D1", "D2", "D3", "D4", "D5"],
  Other: ["E1", "E2", "E3", "E4", "E5"],
};

export const EMPTY_PORTAL_DATA: PortalData = {
  users: DEFAULT_DRIVERS,
  contracts: INITIAL_CONTRACTS,
  vehicleRegs: INITIAL_REGS,
  sitesByContract: Object.fromEntries(
    Object.entries(INITIAL_SITES_BY_CONTRACT).map(([k, v]) => [k, v])
  ),
  destinationSitesByContract: Object.fromEntries(
    Object.entries(INITIAL_SITES_BY_CONTRACT).map(([k, v]) => [k, v])
  ),
  allSitesByContract: Object.fromEntries(
    Object.entries(INITIAL_SITES_BY_CONTRACT).map(([k, v]) => [
      k,
      v.map((name) => ({ name, siteType: "both" as const })),
    ])
  ),
  activeJobs: [],
  semiCompletedJobs: [],
  completedJobs: [],
  fuelEntries: [],
  mileageEntries: [],
  issueReports: [],
};

export function normalize(value: string) {
  return value.trim().toLowerCase();
}

export function normalizeSiteType(value?: string): SiteEntry["siteType"] {
  const normalized = normalize(value || "both");
  if (normalized === "pickup") {
    return "collection";
  }
  if (normalized === "destination") {
    return "destination";
  }
  if (normalized === "collection") {
    return "collection";
  }
  return "both";
}
