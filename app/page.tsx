"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  EMPTY_PORTAL_DATA,
  INITIAL_CONTRACTS,
  normalize,
  type FuelEntry,
  type IssueReport,
  type Job,
  type MileageEntry,
  type PortalData,
  type SiteEntry,
  type User,
} from "@/lib/portal-config";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TimePicker } from "@/components/ui/time-picker";
import { NumericKeypad } from "@/components/ui/numeric-keypad";
import { DatePicker } from "@/components/ui/date-picker";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  AlertTriangle,
  CheckCircle2,
  ClipboardCheck,
  Fuel,
  LogOut,
  PlusCircle,
  Shield,
} from "lucide-react";

export default function DriverJobsPortal() {
  const [view, setView] = useState<"login" | "hub" | "setup" | "driver">("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [activeUser, setActiveUser] = useState<User | null>(null);
  const [portalReady, setPortalReady] = useState(false);
  const [portalError, setPortalError] = useState("");

  const [users, setUsers] = useState<User[]>(EMPTY_PORTAL_DATA.users);
  const [contracts, setContracts] = useState<string[]>(EMPTY_PORTAL_DATA.contracts);
  const [vehicleRegs, setVehicleRegs] = useState<string[]>(EMPTY_PORTAL_DATA.vehicleRegs);
  const [allSitesByContract, setAllSitesByContract] = useState<Record<string, SiteEntry[]>>(EMPTY_PORTAL_DATA.allSitesByContract);

  const [selectedContract, setSelectedContract] = useState("");
  const [selectedReg, setSelectedReg] = useState("");
  const [selectedDate, setSelectedDate] = useState("");

  const [activeJobs, setActiveJobs] = useState<Job[]>([]);
  const [semiCompletedJobs, setSemiCompletedJobs] = useState<Job[]>([]);
  const [completedJobs, setCompletedJobs] = useState<Job[]>([]);
  const [fuelEntries, setFuelEntries] = useState<FuelEntry[]>([]);
  const [mileageEntries, setMileageEntries] = useState<MileageEntry[]>([]);
  const [issueReports, setIssueReports] = useState<IssueReport[]>([]);

  const [collectionSite, setCollectionSite] = useState("");
  const [manualCollectionSite, setManualCollectionSite] = useState("");
  const [jobRef, setJobRef] = useState("");
  const [arrivalTime, setArrivalTime] = useState("");
  const [exitTime, setExitTime] = useState("");
  const [notes, setNotes] = useState("");

  const [selectedLiveJobId, setSelectedLiveJobId] = useState("");
  const [destinationSite, setDestinationSite] = useState("");
  const [manualDestinationSite, setManualDestinationSite] = useState("");
  const [destinationNotes, setDestinationNotes] = useState("");
  const [completeArrivalTime, setCompleteArrivalTime] = useState("");
  const [completeDepartureTime, setCompleteDepartureTime] = useState("");
  const [completeJobRef, setCompleteJobRef] = useState("");
  const [completionDate, setCompletionDate] = useState("");
  const [selectedSemiJobId, setSelectedSemiJobId] = useState("");
  const [collectionReference, setCollectionReference] = useState("");
  const [costingType, setCostingType] = useState<"per_load" | "per_tonne">("per_load");
  const [costingPrice, setCostingPrice] = useState("");
  const [costingWeight, setCostingWeight] = useState("");

  const [fuelType, setFuelType] = useState("");
  const [fuelLitres, setFuelLitres] = useState("");
  const [openingMileage, setOpeningMileage] = useState("");
  const [closingMileage, setClosingMileage] = useState("");
  const [mileageRequired, setMileageRequired] = useState(false);
  const [reportText, setReportText] = useState("");
  const [activeDriverAction, setActiveDriverAction] = useState<
    "home" | "new" | "complete" | "fuel" | "mileage" | "report"
  >("home");

  const [hubTab, setHubTab] = useState<
    "overview" | "live" | "completed" | "reports" | "drivers" | "sites" | "folders" | "fuel" | "mileage" | "weekly"
  >("overview");
  const [jobSavedNotice, setJobSavedNotice] = useState(false);
  const [jobCompleteNotice, setJobCompleteNotice] = useState(false);
  const [showChangeSetup, setShowChangeSetup] = useState(false);
  const [draftContract, setDraftContract] = useState("");
  const [draftReg, setDraftReg] = useState("");
  const [driverMgmtError, setDriverMgmtError] = useState("");
  const [siteMgmtError, setSiteMgmtError] = useState("");
  const [newDriverName, setNewDriverName] = useState("");
  const [newDriverUsername, setNewDriverUsername] = useState("");
  const [newDriverPassword, setNewDriverPassword] = useState("");
  const [newAccountRole, setNewAccountRole] = useState<"driver" | "admin">("driver");
  const [editingContract, setEditingContract] = useState(INITIAL_CONTRACTS[0] || "");
  const [newSiteName, setNewSiteName] = useState("");
  const [newSiteType, setNewSiteType] = useState<"collection" | "destination" | "both">("both");
  const [newContractName, setNewContractName] = useState("");
  const [showDieselFuel, setShowDieselFuel] = useState(true);
  const [showAdBlueFuel, setShowAdBlueFuel] = useState(true);
  const [selectedCompletedDriver, setSelectedCompletedDriver] = useState("all");
  const [selectedMileageDriver, setSelectedMileageDriver] = useState("all");
  const [mileageDateFilter, setMileageDateFilter] = useState("");
  const [mileageStatusFilter, setMileageStatusFilter] = useState<"all" | "open" | "closed">("all");
  const [weeklyReportDriver, setWeeklyReportDriver] = useState("all");
  const [weekReset, setWeekReset] = useState(false);

  // Edit job state
  const [editingJobId, setEditingJobId] = useState<string | null>(null);
  const [editingJobType, setEditingJobType] = useState<"live" | "completed" | null>(null);
  const [editingJobContract, setEditingJobContract] = useState("");
  const [editFields, setEditFields] = useState<Record<string, string>>({});

  // Seen IDs for true-unread badge tracking (persisted in localStorage)
  const [seenIds, setSeenIds] = useState<Record<string, string[]>>(() => {
    try {
      const stored = localStorage.getItem("hub_seen_ids");
      return stored ? (JSON.parse(stored) as Record<string, string[]>) : {};
    } catch {
      return {};
    }
  });

  const homeRef = useRef<HTMLDivElement | null>(null);
  const newJobRef = useRef<HTMLDivElement | null>(null);
  const completeRef = useRef<HTMLDivElement | null>(null);
  const fuelRef = useRef<HTMLDivElement | null>(null);
  const mileageRef = useRef<HTMLDivElement | null>(null);
  const reportRef = useRef<HTMLDivElement | null>(null);

  const sitesForContract = allSitesByContract[selectedContract] || [];
  const isJJWardSelectedContract = normalize(selectedContract) === normalize("J & J Ward");
  const collectionSites = sitesForContract
    .filter((site) => site.siteType !== "destination")
    .map((site) => site.name);
  const destinationSites = sitesForContract
    .filter((site) => site.siteType !== "collection")
    .map((site) => site.name);
  const liveJobsForUser = activeJobs.filter(
    (j) => normalize(j.driverUsername || "") === normalize(activeUser?.username || ""),
  );
  const completedJobsForUser = completedJobs.filter(
    (j) => normalize(j.driverUsername || "") === normalize(activeUser?.username || ""),
  );
  const completedJobsForHub = completedJobs
    .filter((job) =>
      selectedCompletedDriver === "all"
        ? true
        : normalize(job.driverUsername || "") === normalize(selectedCompletedDriver),
    )
    .slice()
    .sort((left, right) => {
      const rightDate = right.completedDate || right.date || "";
      const leftDate = left.completedDate || left.date || "";
      const byDate = rightDate.localeCompare(leftDate);
      if (byDate !== 0) {
        return byDate;
      }

      return (right.completeDepartureTime || "").localeCompare(left.completeDepartureTime || "");
    });
  const semiCompletedJobsForHub = semiCompletedJobs
    .filter((job) =>
      selectedCompletedDriver === "all"
        ? true
        : normalize(job.driverUsername || "") === normalize(selectedCompletedDriver),
    )
    .slice()
    .sort((left, right) => {
      const rightDate = right.completedDate || right.date || "";
      const leftDate = left.completedDate || left.date || "";
      const byDate = rightDate.localeCompare(leftDate);
      if (byDate !== 0) {
        return byDate;
      }
      return (right.completeDepartureTime || "").localeCompare(left.completeDepartureTime || "");
    });
  const completedJobsByContract = completedJobsForHub.reduce<Record<string, Job[]>>((acc, job) => {
    const key = job.contract || "Unknown";
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(job);
    return acc;
  }, {});
  const selectedLiveJob = liveJobsForUser.find((j) => j.id === selectedLiveJobId);
  const selectedSemiJob = semiCompletedJobsForHub.find((j) => j.id === selectedSemiJobId);
  const mileageEntriesForHub = mileageEntries
    .filter((entry) =>
      selectedMileageDriver === "all"
        ? true
        : normalize(entry.driverUsername || "") === normalize(selectedMileageDriver),
    )
    .filter((entry) => (mileageDateFilter ? entry.date === mileageDateFilter : true))
    .filter((entry) => {
      if (mileageStatusFilter === "open") {
        return !entry.closingMileage;
      }
      if (mileageStatusFilter === "closed") {
        return Boolean(entry.closingMileage);
      }
      return true;
    })
    .slice()
    .sort((left, right) => {
      const byDate = (right.date || "").localeCompare(left.date || "");
      if (byDate !== 0) {
        return byDate;
      }
      return (right.driverName || "").localeCompare(left.driverName || "");
    });
  const currentMileageEntry = mileageEntries.find(
    (entry) =>
      normalize(entry.driverUsername || "") === normalize(activeUser?.username || "") &&
      entry.date === selectedDate,
  );
  const totalDieselLitres = fuelEntries
    .filter((entry) => normalize(entry.type || "") === "diesel")
    .reduce((sum, entry) => sum + Number(entry.litres || 0), 0);
  const totalAdBlueLitres = fuelEntries
    .filter((entry) => normalize(entry.type || "") === "adblue")
    .reduce((sum, entry) => sum + Number(entry.litres || 0), 0);

  const seenSets = Object.fromEntries(
    Object.entries(seenIds).map(([k, v]) => [k, new Set(v)]),
  );
  const hubTabBadges: Partial<Record<typeof hubTab, number>> = {
    live: activeJobs.filter((j) => !seenSets.live?.has(j.id)).length,
    completed: [...completedJobs, ...semiCompletedJobs].filter((j) => !seenSets.completed?.has(j.id)).length,
    fuel: fuelEntries.filter((e) => !seenSets.fuel?.has(e.id)).length,
    mileage: mileageEntries.filter((e) => !seenSets.mileage?.has(e.id)).length,
    reports: issueReports.filter((r) => !seenSets.reports?.has(r.id)).length,
  };

  const formatDisplayDate = (value?: string) => {
    if (!value) return "-";
    const parts = value.split("-");
    if (parts.length === 3) {
      const [year, month, day] = parts;
      return `${day}/${month}/${year}`;
    }
    return value;
  };

  const formatLitres = (value: number) =>
    value.toLocaleString("en-GB", { minimumFractionDigits: 0, maximumFractionDigits: 2 });

  const isJJWardContract = (contract?: string) => normalize(contract || "") === normalize("J & J Ward");

  const CONTRACT_GREY_TINTS = [
    "border-slate-300 bg-slate-50",
    "border-zinc-300 bg-zinc-50",
    "border-neutral-300 bg-neutral-50",
    "border-gray-300 bg-gray-50",
    "border-stone-300 bg-stone-50",
  ];

  const getContractTintClass = (contract?: string) => {
    const key = normalize(contract || "unknown");
    const hash = key.split("").reduce((sum, ch) => sum + ch.charCodeAt(0), 0);
    return CONTRACT_GREY_TINTS[hash % CONTRACT_GREY_TINTS.length];
  };

  const getJJWardPriceLabel = (job: Job) => {
    if (job.costingType === "per_tonne") {
      return "Price per tonne";
    }
    return "Price per load";
  };

  const renderJJWardCompletedJobLines = (job: Job, textClassName = "text-slate-700") => (
    <div className={`space-y-1 ${textClassName}`}>
      <p>
        {formatDisplayDate(job.completedDate || job.date)} {job.collectionSite || "-"} to {job.destinationSite || "-"}
      </p>
      <p>
        Ticket numbers {job.jobRef || "-"} * {job.completeJobRef || "-"}
      </p>
      <p>
        Collection reference {job.collectionReference || "-"}
      </p>
      <p>
        {getJJWardPriceLabel(job)} {job.costingPrice || "-"}
      </p>
    </div>
  );

  const stripLeadingSiteNumber = (site?: string) => {
    if (!site) return "";
    return site.replace(/^\s*\d+\s*[).:-]?\s*/, "").trim();
  };

  const getPortalSiteLabel = (_contract: string, site?: string) => {
    if (!site) return "";
    return stripLeadingSiteNumber(site);
  };

  const parseJsonResponse = async <T,>(response: Response): Promise<T> => {
    const raw = await response.text();
    if (!raw.trim()) {
      throw new Error("Empty response from server.");
    }

    try {
      return JSON.parse(raw) as T;
    } catch {
      throw new Error("Server returned invalid response data.");
    }
  };

  useEffect(() => {
    async function loadPortal() {
      try {
        const response = await fetch("/api/portal", { cache: "no-store" });
        const data = await parseJsonResponse<PortalData | { error?: string }>(response);
        if (!response.ok) {
          throw new Error("error" in data ? data.error || "Failed to load portal data." : "Failed to load portal data.");
        }

        const portalData = data as PortalData;
        setUsers(portalData.users);
        setContracts(portalData.contracts);
        setVehicleRegs(portalData.vehicleRegs);
        setAllSitesByContract(portalData.allSitesByContract);
        setActiveJobs(portalData.activeJobs);
        setSemiCompletedJobs(portalData.semiCompletedJobs);
        setCompletedJobs(portalData.completedJobs);
        setFuelEntries(portalData.fuelEntries);
        setMileageEntries(portalData.mileageEntries);
        setIssueReports(portalData.issueReports);
        setActiveUser((current) =>
          current ? portalData.users.find((user) => user.id === current.id) || current : current,
        );
        setEditingContract((current) => (current && portalData.contracts.includes(current) ? current : portalData.contracts[0] || ""));
        setPortalError("");
      } catch (loadError) {
        const message = loadError instanceof Error ? loadError.message : "Failed to load portal data.";
        setPortalError(message);
      } finally {
        setPortalReady(true);
      }
    }

    loadPortal();
  }, []);

  useEffect(() => {
    if (!activeUser || view !== "hub") {
      return;
    }

    const intervalId = window.setInterval(async () => {
      try {
        const response = await fetch("/api/portal", { cache: "no-store" });
        if (!response.ok) {
          return;
        }

        const data = await parseJsonResponse<PortalData>(response);
        setUsers(data.users);
        setContracts(data.contracts);
        setVehicleRegs(data.vehicleRegs);
        setAllSitesByContract(data.allSitesByContract);
        setActiveJobs(data.activeJobs);
        setSemiCompletedJobs(data.semiCompletedJobs);
        setCompletedJobs(data.completedJobs);
        setFuelEntries(data.fuelEntries);
        setMileageEntries(data.mileageEntries);
        setIssueReports(data.issueReports);
        setActiveUser((current) =>
          current ? data.users.find((user) => user.id === current.id) || current : current,
        );
      } catch {
        // Ignore refresh errors and keep current UI state.
      }
    }, 5000);

    return () => window.clearInterval(intervalId);
  }, [activeUser, view]);

  const applyPortalData = (data: PortalData) => {
    setUsers(data.users);
    setContracts(data.contracts);
    setVehicleRegs(data.vehicleRegs);
    setAllSitesByContract(data.allSitesByContract);
    setActiveJobs(data.activeJobs);
    setSemiCompletedJobs(data.semiCompletedJobs);
    setCompletedJobs(data.completedJobs);
    setFuelEntries(data.fuelEntries);
    setMileageEntries(data.mileageEntries);
    setIssueReports(data.issueReports);
    setActiveUser((current) =>
      current ? data.users.find((user) => user.id === current.id) || current : current,
    );
    setEditingContract((current) => (current && data.contracts.includes(current) ? current : data.contracts[0] || ""));
  };

  // Mark items for a given tab as seen using current state (called from onClick handlers)
  const markTabSeen = (tab: typeof hubTab) => {
    let ids: string[];
    switch (tab) {
      case "live": ids = activeJobs.map((j) => j.id); break;
      case "completed": ids = [...completedJobs, ...semiCompletedJobs].map((j) => j.id); break;
      case "fuel": ids = fuelEntries.map((e) => e.id); break;
      case "mileage": ids = mileageEntries.map((e) => e.id); break;
      case "reports": ids = issueReports.map((r) => r.id); break;
      default: ids = [];
    }
    if (!ids.length) return;
    setSeenIds((prev) => {
      const prevSet = new Set(prev[tab] || []);
      let changed = false;
      for (const id of ids) {
        if (!prevSet.has(id)) { prevSet.add(id); changed = true; }
      }
      if (!changed) return prev;
      const updated = { ...prev, [tab]: [...prevSet] };
      try { localStorage.setItem("hub_seen_ids", JSON.stringify(updated)); } catch { /* ignore */ }
      return updated;
    });
  };

  const postPortalAction = async (action: string, payload: Record<string, unknown> = {}) => {
    const response = await fetch("/api/portal", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ action, ...payload }),
    });

    const result = await parseJsonResponse<PortalData | { error?: string }>(response);
    if (!response.ok) {
      throw new Error("error" in result ? result.error || "Request failed." : "Request failed.");
    }

    const data = result as PortalData;
    applyPortalData(data);
    return data;
  };

  const buildReportHtml = (targetDrivers: User[]): string => {
    const sections = targetDrivers.map((driver) => {
      const dJobs = completedJobs
        .filter((j) => normalize(j.driverUsername || "") === normalize(driver.username))
        .sort((a, b) => (a.completedDate || a.date || "").localeCompare(b.completedDate || b.date || ""));

      const dFuel = fuelEntries.filter(
        (e) => normalize(e.driverUsername || "") === normalize(driver.username),
      );

      const dMileage = mileageEntries
        .filter((entry) => normalize(entry.driverUsername || "") === normalize(driver.username))
        .slice()
        .sort((a, b) => (a.date || "").localeCompare(b.date || ""));

      if (dJobs.length === 0 && dFuel.length === 0 && dMileage.length === 0) return "";

      const vehicleRegsUsed = [
        ...new Set([...dJobs.map((j) => j.reg), ...dFuel.map((e) => e.reg), ...dMileage.map((e) => e.reg)]),
      ];

      const vehicleSections = vehicleRegsUsed
        .map((reg) => {
          const vJobs = dJobs.filter((j) => j.reg === reg);
          const vDiesel = dFuel.filter(
            (e) => e.reg === reg && normalize(e.type) === "diesel",
          );
          const vAdblue = dFuel.filter(
            (e) => e.reg === reg && normalize(e.type) === "adblue",
          );
          const vMileage = dMileage.filter((entry) => entry.reg === reg);

          const jobRows = vJobs
            .map(
              (j) =>
                `<tr><td>${formatDisplayDate(j.date)}</td><td>${formatDisplayDate(j.completedDate || j.date)}</td><td>${j.jobRef || "-"}</td><td>${j.collectionSite}</td><td>${j.notes || ""}</td><td>${j.destinationSite || "-"}</td><td>${j.completeJobRef || "-"}</td><td>${j.destinationNotes || ""}</td></tr>`,
            )
            .join("");

          const dieselRows = vDiesel
            .map(
              (e) =>
                `<tr><td>${formatDisplayDate(e.date)}</td><td colspan="5">${e.litres} L</td></tr>`,
            )
            .join("");

          const adblueRows = vAdblue
            .map(
              (e) =>
                `<tr><td>${formatDisplayDate(e.date)}</td><td colspan="5">${e.litres} L</td></tr>`,
            )
            .join("");

          const mileageRows = vMileage
            .map(
              (entry) =>
                `<tr><td>${formatDisplayDate(entry.date)}</td><td>${entry.openingMileage || "-"}</td><td>${entry.closingMileage || "-"}</td></tr>`,
            )
            .join("");

          return `
            <h3 style="margin:16px 0 4px;font-size:13pt;color:#334155;">Vehicle: ${reg}</h3>
            ${vJobs.length > 0 ? `
              <p style="margin:8px 0 4px;font-weight:bold;">Jobs</p>
              <table border="1" cellpadding="4" cellspacing="0" style="border-collapse:collapse;width:100%;font-size:10pt;">
                <thead style="background:#f1f5f9;"><tr><th>Pickup Date</th><th>Drop Date</th><th>WJR</th><th>Collection</th><th>Collection Notes</th><th>Destination</th><th>Drop WJR</th><th>Destination Notes</th></tr></thead>
                <tbody>${jobRows}</tbody>
              </table>` : ""}
            ${vDiesel.length > 0 ? `
              <p style="margin:8px 0 4px;font-weight:bold;">Diesel</p>
              <table border="1" cellpadding="4" cellspacing="0" style="border-collapse:collapse;width:100%;font-size:10pt;">
                <thead style="background:#fef9c3;"><tr><th>Date</th><th colspan="5">Litres</th></tr></thead>
                <tbody>${dieselRows}</tbody>
              </table>` : ""}
            ${vAdblue.length > 0 ? `
              <p style="margin:8px 0 4px;font-weight:bold;">AdBlue</p>
              <table border="1" cellpadding="4" cellspacing="0" style="border-collapse:collapse;width:100%;font-size:10pt;">
                <thead style="background:#dbeafe;"><tr><th>Date</th><th colspan="5">Litres</th></tr></thead>
                <tbody>${adblueRows}</tbody>
              </table>` : ""}
            ${vMileage.length > 0 ? `
              <p style="margin:8px 0 4px;font-weight:bold;">Mileage</p>
              <table border="1" cellpadding="4" cellspacing="0" style="border-collapse:collapse;width:100%;font-size:10pt;">
                <thead style="background:#ffedd5;"><tr><th>Date</th><th>Opening</th><th>Closing</th></tr></thead>
                <tbody>${mileageRows}</tbody>
              </table>` : ""}
          `;
        })
        .join("");

      return `
        <div style="page-break-inside:avoid;margin-bottom:32px;">
          <h2 style="margin:0 0 8px;font-size:16pt;color:#0f172a;border-bottom:2px solid #94a3b8;padding-bottom:4px;">${driver.name}</h2>
          ${vehicleSections}
        </div>
      `;
    });

    const generated = `<!DOCTYPE html>
<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
<head><meta charset="utf-8"><title>Weekly Report</title>
<style>
  body { font-family: Arial, sans-serif; font-size: 11pt; color: #0f172a; margin: 24px; }
  h1 { font-size: 20pt; margin-bottom: 4px; }
  table { border-collapse: collapse; width: 100%; margin-bottom: 8px; }
  th, td { border: 1px solid #cbd5e1; padding: 4px 8px; text-align: left; }
  th { background: #f8fafc; font-weight: bold; }
</style>
</head>
<body>
<h1>Towells Weekly Report</h1>
<p style="color:#64748b;">Generated: ${new Date().toLocaleDateString("en-GB")}</p>
<hr/>
${sections.join("")}
</body></html>`;

    return generated;
  };

  const downloadReport = (driverFilter: string) => {
    const targetDrivers =
      driverFilter === "all"
        ? users.filter((u) => u.role === "driver")
        : users.filter(
            (u) => u.role === "driver" && normalize(u.username) === normalize(driverFilter),
          );

    const html = buildReportHtml(targetDrivers);
    const blob = new Blob(["\ufeff", html], { type: "application/msword" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const driverName =
      driverFilter === "all"
        ? "all-drivers"
        : (targetDrivers[0]?.name || driverFilter).replace(/\s+/g, "-");
    a.download = `weekly-report-${driverName}-${new Date().toISOString().slice(0, 10)}.doc`;
    a.click();
    URL.revokeObjectURL(url);
  };

    const buildReportExcelHtml = (targetDrivers: User[]): string => {
      const sheets = targetDrivers.flatMap((driver) => {
        const dJobs = completedJobs
          .filter((j) => normalize(j.driverUsername || "") === normalize(driver.username))
          .sort((a, b) => (a.completedDate || a.date || "").localeCompare(b.completedDate || b.date || ""));
        const dFuel = fuelEntries.filter((e) => normalize(e.driverUsername || "") === normalize(driver.username));
        const dMileage = mileageEntries
          .filter((e) => normalize(e.driverUsername || "") === normalize(driver.username))
          .sort((a, b) => (a.date || "").localeCompare(b.date || ""));
        if (dJobs.length === 0 && dFuel.length === 0 && dMileage.length === 0) return [];

        const jobRows = dJobs.map((j) =>
          `<tr><td>${driver.name}</td><td>${j.reg || ""}</td><td>${formatDisplayDate(j.date)}</td><td>${formatDisplayDate(j.completedDate || j.date)}</td><td>${j.jobRef || ""}</td><td>${j.collectionSite || ""}</td><td>${j.notes || ""}</td><td>${j.destinationSite || ""}</td><td>${j.completeJobRef || ""}</td><td>${j.destinationNotes || ""}</td></tr>`
        ).join("");
        const fuelRows = dFuel.map((e) =>
          `<tr><td>${driver.name}</td><td>${e.reg || ""}</td><td>${formatDisplayDate(e.date)}</td><td>${e.type}</td><td>${e.litres}</td></tr>`
        ).join("");
        const mileageRows = dMileage.map((e) =>
          `<tr><td>${driver.name}</td><td>${e.reg || ""}</td><td>${formatDisplayDate(e.date)}</td><td>${e.openingMileage || ""}</td><td>${e.closingMileage || ""}</td></tr>`
        ).join("");

        return [{ driver, jobRows, fuelRows, mileageRows }];
      });

      const jobTable = `
        <h2>Jobs</h2>
        <table border="1"><thead><tr><th>Driver</th><th>Reg</th><th>Pickup Date</th><th>Drop Date</th><th>WJR</th><th>Collection</th><th>Collection Notes</th><th>Destination</th><th>Drop WJR</th><th>Destination Notes</th></tr></thead>
        <tbody>${sheets.map((s) => s.jobRows).join("")}</tbody></table>`;
      const fuelTable = `
        <h2>Fuel</h2>
        <table border="1"><thead><tr><th>Driver</th><th>Reg</th><th>Date</th><th>Type</th><th>Litres</th></tr></thead>
        <tbody>${sheets.map((s) => s.fuelRows).join("")}</tbody></table>`;
      const mileageTable = `
        <h2>Mileage</h2>
        <table border="1"><thead><tr><th>Driver</th><th>Reg</th><th>Date</th><th>Opening</th><th>Closing</th></tr></thead>
        <tbody>${sheets.map((s) => s.mileageRows).join("")}</tbody></table>`;

      return `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
  <head><meta charset="utf-8"><title>Weekly Report</title></head>
  <body>
  <h1>Towells Weekly Report \u2014 ${new Date().toLocaleDateString("en-GB")}</h1>
  ${jobTable}${fuelTable}${mileageTable}
  </body></html>`;
    };

    const downloadReportExcel = (driverFilter: string) => {
      const targetDrivers =
        driverFilter === "all"
          ? users.filter((u) => u.role === "driver")
          : users.filter((u) => u.role === "driver" && normalize(u.username) === normalize(driverFilter));

      const html = buildReportExcelHtml(targetDrivers);
      const blob = new Blob(["\ufeff", html], { type: "application/vnd.ms-excel" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const driverName =
        driverFilter === "all"
          ? "all-drivers"
          : (targetDrivers[0]?.name || driverFilter).replace(/\s+/g, "-");
      a.download = `weekly-report-${driverName}-${new Date().toISOString().slice(0, 10)}.xls`;
      a.click();
      URL.revokeObjectURL(url);
    };

  const resetWeek = async () => {
    const confirmed = window.confirm(
      "Reset the weekly report? This will permanently delete all completed jobs, fuel entries, and issue reports. This cannot be undone.",
    );
    if (!confirmed) return;

    try {
      await postPortalAction("resetWeek");
      setWeekReset(true);
      setPortalError("");
    } catch (resetError) {
      setPortalError(resetError instanceof Error ? resetError.message : "Reset failed.");
    }
  };

  const deleteJobFromHub = async (jobId: string) => {
    const confirmed = window.confirm("Delete this job from the hub?");
    if (!confirmed) {
      return;
    }

    try {
      await postPortalAction("deleteJob", { jobId });
      setPortalError("");
    } catch (deleteError) {
      setPortalError(deleteError instanceof Error ? deleteError.message : "Failed to delete job.");
    }
  };

  const startEditingJob = (jobId: string, jobType: "live" | "completed", job: Job) => {
    setEditingJobId(jobId);
    setEditingJobType(jobType);
    setEditingJobContract(job.contract || "");
    setEditFields({
      jobRef: job.jobRef || "",
      arrivalTime: job.arrivalTime || "",
      exitTime: job.exitTime || "",
      collectionSite: job.collectionSite || "",
      notes: job.notes || "",
      destinationSite: job.destinationSite || "",
      completeArrivalTime: job.completeArrivalTime || "",
      completeDepartureTime: job.completeDepartureTime || "",
      completedDate: job.completedDate || "",
      completeJobRef: job.completeJobRef || "",
      collectionReference: job.collectionReference || "",
      costingType: job.costingType || "per_load",
      costingPrice: job.costingPrice || "",
      costingWeight: job.costingWeight || "",
      destinationNotes: job.destinationNotes || "",
    });
  };

  const saveEditJob = async () => {
    if (!editingJobId) return;
    const payload: Record<string, unknown> = {
      jobId: editingJobId,
      ...editFields,
    };

    const pricingType = String(editFields.costingType || "");
    const pricingValue = Number(editFields.costingPrice || "");
    const weightValue = Number(editFields.costingWeight || "");
    if (pricingType === "per_load" && Number.isFinite(pricingValue) && pricingValue > 0) {
      payload.costingTotal = String(pricingValue);
    }
    if (
      pricingType === "per_tonne" &&
      Number.isFinite(pricingValue) &&
      pricingValue > 0 &&
      Number.isFinite(weightValue) &&
      weightValue > 0
    ) {
      payload.costingTotal = String(pricingValue * weightValue);
    }

    try {
      await postPortalAction("updateJob", payload);
      setPortalError("");
      setEditingJobId(null);
      setEditingJobType(null);
      setEditingJobContract("");
      setEditFields({});
    } catch (error) {
      setPortalError(error instanceof Error ? error.message : "Failed to update job.");
    }
  };

  const deleteFuelEntryFromHub = async (fuelEntryId: string) => {
    const confirmed = window.confirm("Delete this fuel entry from the hub?");
    if (!confirmed) {
      return;
    }

    try {
      await postPortalAction("deleteFuelEntry", { fuelEntryId });
      setPortalError("");
    } catch (deleteError) {
      setPortalError(deleteError instanceof Error ? deleteError.message : "Failed to delete fuel entry.");
    }
  };

  const deleteReportFromHub = async (reportId: string) => {
    const confirmed = window.confirm("Delete this report from the hub?");
    if (!confirmed) {
      return;
    }

    try {
      await postPortalAction("deleteReport", { reportId });
      setPortalError("");
    } catch (deleteError) {
      setPortalError(deleteError instanceof Error ? deleteError.message : "Failed to delete report.");
    }
  };

  const deleteMileageEntryFromHub = async (mileageEntryId: string) => {
    const confirmed = window.confirm("Delete this mileage entry from the hub?");
    if (!confirmed) {
      return;
    }

    try {
      await postPortalAction("deleteMileageEntry", { mileageEntryId });
      setPortalError("");
    } catch (deleteError) {
      setPortalError(deleteError instanceof Error ? deleteError.message : "Failed to delete mileage entry.");
    }
  };

  const scrollToSection = (ref: React.RefObject<HTMLDivElement | null>) => {
    ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      const result = (await response.json()) as { user?: User; error?: string };
      if (!response.ok || !result.user) {
        setError(result.error || "Login failed");
        return;
      }

      setError("");
      setActiveUser(result.user);
      setView(result.user.role === "admin" ? "hub" : "setup");
    } catch {
      setError("Login failed");
    }
  };

  const handleLogout = () => {
    setView("login");
    setUsername("");
    setPassword("");
    setError("");
    setActiveUser(null);
    setMileageRequired(false);
  };

  const continueToDriverPortal = () => {
    const hasOpeningMileage = Boolean(currentMileageEntry?.openingMileage);
    setOpeningMileage(currentMileageEntry?.openingMileage || "");
    setClosingMileage(currentMileageEntry?.closingMileage || "");
    setMileageRequired(!hasOpeningMileage);
    setView("driver");
    setActiveDriverAction(hasOpeningMileage ? "home" : "mileage");
  };

  const createJob = async () => {
    const chosenCollectionSite = isJJWardSelectedContract
      ? manualCollectionSite.trim()
      : manualCollectionSite.trim() || collectionSite;
    if (!selectedContract || !selectedReg || !selectedDate || !chosenCollectionSite || !jobRef || !arrivalTime || !exitTime) {
      setPortalError("Please complete pickup site, job number, arrival time, and exit time.");
      return;
    }
    if (!activeUser) return;

    try {
      await postPortalAction("createJob", {
        driverId: activeUser.id,
        contract: selectedContract,
        reg: selectedReg,
        date: selectedDate,
        collectionSite: chosenCollectionSite,
        jobRef,
        arrivalTime,
        exitTime,
        notes,
      });
      setPortalError("");
    } catch (createError) {
      setPortalError(createError instanceof Error ? createError.message : "Failed to save job.");
      return;
    }

    setCollectionSite("");
  setManualCollectionSite("");
    setJobRef("");
    setArrivalTime("");
    setExitTime("");
    setNotes("");
    setJobSavedNotice(true);
    setActiveDriverAction("home");
    scrollToSection(homeRef);
    setJobCompleteNotice(false);
  };

  const completeJob = async () => {
    const found = liveJobsForUser.find((j) => j.id === selectedLiveJobId);
    const isJJWardJob = normalize(found?.contract || "") === normalize("J & J Ward");
    const chosenDestinationSite = isJJWardJob
      ? manualDestinationSite.trim()
      : manualDestinationSite.trim() || destinationSite;
    
    if (!found) {
      setPortalError("Please select a live job.");
      return;
    }
    if (!chosenDestinationSite) {
      setPortalError("Please select a destination site.");
      return;
    }
    if (!completeArrivalTime) {
      setPortalError("Please enter arrival time.");
      return;
    }
    if (!completeDepartureTime) {
      setPortalError("Please enter departure time.");
      return;
    }
    if (!completionDate) {
      setPortalError("Please enter completion date.");
      return;
    }
    if (!completeJobRef.trim()) {
      setPortalError("Please enter a job number.");
      return;
    }

    try {
      await postPortalAction("completeJob", {
        jobId: selectedLiveJobId,
        completedDate: completionDate,
        destinationSite: chosenDestinationSite,
        completeArrivalTime,
        completeDepartureTime,
        completeJobRef: completeJobRef.trim(),
        destinationNotes: destinationNotes.trim(),
      });
      setPortalError("");
    } catch (completeError) {
      setPortalError(completeError instanceof Error ? completeError.message : "Failed to complete job.");
      return;
    }

    setSelectedLiveJobId("");
    setDestinationSite("");
    setManualDestinationSite("");
    setDestinationNotes("");
    setCompleteArrivalTime("");
    setCompleteDepartureTime("");
    setCompleteJobRef("");
    setCompletionDate("");
    setActiveDriverAction("home");
    scrollToSection(homeRef);
    setJobCompleteNotice(true);
  };

  const finalizeSemiCompletedJob = async () => {
    if (!selectedSemiJob) {
      setPortalError("Please select a semi-completed job.");
      return;
    }
    const selectedJobId = selectedSemiJob.id;
    if (!costingPrice.trim()) {
      setPortalError("Costing is required.");
      return;
    }
    if (costingType === "per_tonne" && !costingWeight.trim()) {
      setPortalError("Weight is required for Per Tonne costing.");
      return;
    }

    try {
      const updatedData = await postPortalAction("finalizeSemiCompletedJob", {
        jobId: selectedJobId,
        collectionReference: collectionReference.trim(),
        costingType,
        costingPrice: costingPrice.trim(),
        costingWeight: costingType === "per_tonne" ? costingWeight.trim() : "",
      });

      const movedToCompleted = updatedData.completedJobs.some((job) => job.id === selectedJobId);
      if (!movedToCompleted) {
        setPortalError("Job was saved but did not move to completed. Please refresh and try again.");
        return;
      }

      setPortalError("");
      setSelectedSemiJobId("");
      setCollectionReference("");
      setCostingType("per_load");
      setCostingPrice("");
      setCostingWeight("");
    } catch (finalizeError) {
      setPortalError(finalizeError instanceof Error ? finalizeError.message : "Failed to finalize semi-completed job.");
    }
  };

  const saveFuel = async () => {
    if (!fuelType || !fuelLitres) return;
    if (!activeUser) return;

    try {
      await postPortalAction("saveFuel", {
        driverId: activeUser.id,
        type: fuelType,
        litres: fuelLitres,
        reg: selectedReg,
        date: selectedDate,
      });
      setPortalError("");
    } catch (fuelError) {
      setPortalError(fuelError instanceof Error ? fuelError.message : "Failed to save fuel entry.");
      return;
    }

    setFuelType("");
    setFuelLitres("");
    setActiveDriverAction("home");
    scrollToSection(homeRef);
  };

  const saveMileage = async () => {
    if (!activeUser) return;
    const opening = openingMileage.trim();
    const closing = closingMileage.trim();
    if (!selectedDate || (!opening && !closing)) {
      setPortalError("Enter opening mileage, closing mileage, or both.");
      return;
    }
    if (mileageRequired && !opening && !currentMileageEntry?.openingMileage) {
      setPortalError("Opening mileage is required at the start of the day.");
      return;
    }

    try {
      await postPortalAction("saveMileage", {
        driverId: activeUser.id,
        date: selectedDate,
        reg: selectedReg,
        openingMileage: opening,
        closingMileage: closing,
      });
      setPortalError("");
      setMileageRequired(false);
      setActiveDriverAction("home");
      scrollToSection(homeRef);
    } catch (mileageError) {
      setPortalError(mileageError instanceof Error ? mileageError.message : "Failed to save mileage.");
    }
  };

  const sendReport = async () => {
    if (!reportText.trim()) return;
    if (!activeUser) return;

    try {
      await postPortalAction("sendReport", {
        driverId: activeUser.id,
        text: reportText.trim(),
        reg: selectedReg,
        contract: selectedContract,
        date: selectedDate,
      });
      setPortalError("");
    } catch (reportError) {
      setPortalError(reportError instanceof Error ? reportError.message : "Failed to submit report.");
      return;
    }

    setReportText("");
    setActiveDriverAction("home");
    scrollToSection(homeRef);
  };

  const addContract = async () => {
    const name = newContractName.trim();
    if (!name || contracts.some((c) => normalize(c) === normalize(name))) return;
    try {
      await postPortalAction("addContract", { name });
      setEditingContract(name);
      setNewContractName("");
      setSiteMgmtError("");
    } catch (contractError) {
      setSiteMgmtError(contractError instanceof Error ? contractError.message : "Failed to add contract.");
    }
  };

  const removeContract = async (contract: string) => {
    if (contracts.length <= 1) return;
    try {
      await postPortalAction("removeContract", { name: contract });
      if (selectedContract === contract) setSelectedContract("");
      if (editingContract === contract) {
        const next = contracts.find((c) => c !== contract) || "";
        setEditingContract(next);
      }
      setSiteMgmtError("");
    } catch (contractError) {
      setSiteMgmtError(contractError instanceof Error ? contractError.message : "Failed to remove contract.");
    }
  };

  const addSiteToContract = async () => {
    const site = newSiteName.trim();
    if (!editingContract || !site) return;
    try {
      await postPortalAction("addSite", { contract: editingContract, site, siteType: newSiteType });
      setNewSiteName("");
      setNewSiteType("both");
      setSiteMgmtError("");
    } catch (siteError) {
      setSiteMgmtError(siteError instanceof Error ? siteError.message : "Failed to add site.");
    }
  };

  const renameSite = (contract: string, index: number, value: string) => {
    setAllSitesByContract((prev) => ({
      ...prev,
      [contract]: (prev[contract] || []).map((site, i) => (i === index ? { ...site, name: value } : site)),
    }));
  };

  const removeSite = async (contract: string, index: number) => {
    try {
      await postPortalAction("removeSite", { contract, index });
      setSiteMgmtError("");
    } catch (siteError) {
      setSiteMgmtError(siteError instanceof Error ? siteError.message : "Failed to remove site.");
    }
  };

  const updateSiteType = async (contract: string, index: number, siteType: string) => {
    try {
      await postPortalAction("updateSiteType", { contract, index, siteType });
      setSiteMgmtError("");
    } catch (siteError) {
      setSiteMgmtError(siteError instanceof Error ? siteError.message : "Failed to update site type.");
    }
  };

  const updateDriver = (id: string, field: "name" | "username" | "password", value: string) => {
    if (field === "username") {
      const duplicate = users.some(
        (u) => u.id !== id && normalize(u.username) === normalize(value),
      );
      if (duplicate) {
        setDriverMgmtError("Username already exists.");
        return;
      }
    }
    setDriverMgmtError("");
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, [field]: value } : u)));
  };

  const persistDriverUpdate = async (id: string, field: "name" | "username" | "password", value: string) => {
    try {
      await postPortalAction("updateDriver", { id, field, value });
      setDriverMgmtError("");
    } catch (driverError) {
      setDriverMgmtError(driverError instanceof Error ? driverError.message : "Failed to update driver.");
    }
  };

  const persistSiteRename = async (contract: string, index: number, value: string) => {
    try {
      await postPortalAction("renameSite", { contract, index, value });
      setSiteMgmtError("");
    } catch (siteError) {
      setSiteMgmtError(siteError instanceof Error ? siteError.message : "Failed to rename site.");
    }
  };

  const removeDriver = async (id: string) => {
    try {
      await postPortalAction("removeDriver", { id });
      setDriverMgmtError("");
    } catch (driverError) {
      setDriverMgmtError(driverError instanceof Error ? driverError.message : "Failed to remove driver.");
    }
  };

  const addDriver = async () => {
    const name = newDriverName.trim();
    const driverUsername = newDriverUsername.trim();
    const driverPassword = newDriverPassword.trim();

    if (!name || !driverUsername || !driverPassword) {
      setDriverMgmtError("Name, username, and password are required.");
      return;
    }

    const usernameExists = users.some((u) => normalize(u.username) === normalize(driverUsername));
    if (usernameExists) {
      setDriverMgmtError("Username already exists.");
      return;
    }

    try {
      await postPortalAction("addDriver", {
        name,
        username: driverUsername,
        password: driverPassword,
        role: newAccountRole,
      });
      setDriverMgmtError("");
      setNewDriverName("");
      setNewDriverUsername("");
      setNewDriverPassword("");
      setNewAccountRole("driver");
    } catch (driverError) {
      setDriverMgmtError(driverError instanceof Error ? driverError.message : "Failed to add driver.");
    }
  };

  const openChangeSetupModal = () => {
    setDraftContract(selectedContract);
    setDraftReg(selectedReg);
    setShowChangeSetup(true);
  };

  const saveChangeSetup = () => {
    if (!draftContract || !draftReg) return;
    setSelectedContract(draftContract);
    setSelectedReg(draftReg);
    setActiveDriverAction("home");
    setShowChangeSetup(false);
    scrollToSection(homeRef);
  };

  if (!portalReady) {
    return (
      <div className="min-h-screen bg-slate-100 p-6 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Towells Job Portal</CardTitle>
            <CardDescription>Loading live portal data...</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (view === "login") {
    return (
      <div className="min-h-screen bg-slate-100 p-6 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Portal Login</CardTitle>
            <CardDescription>Sign in to access the portal.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <Input placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              {error ? <p className="text-sm text-red-500">{error}</p> : null}
              {portalError ? <p className="text-sm text-red-500">{portalError}</p> : null}
              <Button className="w-full">Login</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (view === "setup") {
    return (
      <div className="min-h-screen bg-slate-100 p-6">
        <div className="mx-auto max-w-2xl">
          <Card>
            <CardHeader>
              <CardTitle>Driver Setup</CardTitle>
              <CardDescription>Select contract, vehicle and work date before logging jobs.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Contract</Label>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {contracts.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setSelectedContract(c)}
                      className={`h-16 rounded-xl border-2 px-3 text-sm font-semibold transition-all active:scale-95 ${
                        selectedContract === c
                          ? "border-slate-800 bg-slate-800 text-white shadow-md"
                          : "border-slate-300 bg-white text-slate-700 hover:border-slate-400 hover:bg-slate-50"
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <Label>Vehicle Registration</Label>
                <div className="mt-2 grid grid-cols-3 gap-2">
                  {vehicleRegs.map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setSelectedReg(r)}
                      className={`h-12 rounded-xl border-2 px-2 text-sm font-semibold transition-all active:scale-95 ${
                        selectedReg === r
                          ? "border-slate-800 bg-slate-800 text-white shadow-md"
                          : "border-slate-300 bg-white text-slate-700 hover:border-slate-400 hover:bg-slate-50"
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <Label>Date</Label>
                <DatePicker value={selectedDate} onChange={setSelectedDate} />
              </div>
              <Button
                className="w-full"
                onClick={continueToDriverPortal}
                disabled={!selectedContract || !selectedReg || !selectedDate}
              >
                Continue to Driver Portal
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (view === "hub") {
    return (
      <div className="min-h-screen bg-slate-100 p-6">
        <div className="mx-auto max-w-7xl space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold flex items-center gap-2">
                <Shield className="h-6 w-6" /> Admin Hub
              </h1>
              <p className="text-sm text-slate-500">Control panel for jobs, fuel entries and reports.</p>
            </div>
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" /> Logout
            </Button>
          </div>

          <div className="flex flex-wrap gap-2">
            {["overview", "drivers", "sites", "folders", "fuel", "mileage", "live", "completed", "reports", "weekly"].map((tab) => {
              const typedTab = tab as typeof hubTab;
              const badgeCount = hubTab !== typedTab ? (hubTabBadges[typedTab] || 0) : 0;
              const shouldHighlight = badgeCount > 0 && hubTab !== typedTab;

              return (
                <Button
                  key={tab}
                  variant={hubTab === typedTab ? "default" : "outline"}
                  onClick={() => { setHubTab(typedTab); markTabSeen(typedTab); }}
                  className={
                    shouldHighlight
                      ? "border-amber-400 bg-amber-50 text-amber-900 hover:bg-amber-100"
                      : ""
                  }
                >
                  <span className="inline-flex items-center gap-2">
                    <span>{tab}</span>
                    {badgeCount > 0 ? (
                      <span className="inline-flex min-w-[1.25rem] items-center justify-center rounded-full bg-rose-600 px-1.5 py-0.5 text-xs font-bold text-white">
                        {badgeCount}
                      </span>
                    ) : null}
                  </span>
                </Button>
              );
            })}
          </div>

          {portalError ? (
            <Alert className="border-red-300 bg-red-50">
              <AlertTitle>Hub Sync Issue</AlertTitle>
              <AlertDescription>{portalError}</AlertDescription>
            </Alert>
          ) : null}

          {hubTab === "overview" ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
              <Card>
                <CardHeader>
                  <CardTitle>Live Jobs</CardTitle>
                </CardHeader>
                <CardContent className="text-3xl font-semibold">{activeJobs.length}</CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Completed Jobs</CardTitle>
                </CardHeader>
                <CardContent className="text-3xl font-semibold">{completedJobs.length}</CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Fuel Entries</CardTitle>
                </CardHeader>
                <CardContent className="text-3xl font-semibold">{fuelEntries.length}</CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Issue Reports</CardTitle>
                </CardHeader>
                <CardContent className="text-3xl font-semibold">{issueReports.length}</CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Diesel Total</CardTitle>
                </CardHeader>
                <CardContent className="text-3xl font-semibold">{formatLitres(totalDieselLitres)} L</CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>AdBlue Total</CardTitle>
                </CardHeader>
                <CardContent className="text-3xl font-semibold">{formatLitres(totalAdBlueLitres)} L</CardContent>
              </Card>
            </div>
          ) : null}

          {hubTab === "live" ? (
            <Card>
              <CardHeader>
                <CardTitle>All Live Jobs</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {activeJobs.length === 0 ? (
                  <p className="text-sm text-slate-500">No live jobs yet.</p>
                ) : (
                  activeJobs.map((job) => (
                    <div key={job.id} className="rounded-md border border-slate-200 p-3 text-sm bg-white">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p>
                            {job.driverName} | {job.contract} | {job.reg} | {job.collectionSite} | {job.jobRef} | {formatDisplayDate(job.date)}
                          </p>
                          {job.notes ? (
                            <p className="mt-1 text-xs text-slate-500 italic">Collection notes: {job.notes}</p>
                          ) : null}
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" onClick={() => startEditingJob(job.id, "live", job)}>
                            Edit
                          </Button>
                          <Button variant="outline" onClick={() => deleteJobFromHub(job.id)}>
                            Delete
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          ) : null}

          {hubTab === "completed" ? (
            <Card>
              <CardHeader>
                <CardTitle>All Completed Jobs</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="max-w-sm">
                  <Label>Driver</Label>
                  <select
                    className="mt-1 h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm"
                    value={selectedCompletedDriver}
                    onChange={(e) => setSelectedCompletedDriver(e.target.value)}
                  >
                    <option value="all">All drivers</option>
                    {users
                      .filter((user) => user.role === "driver")
                      .map((user) => (
                        <option key={user.id} value={user.username}>
                          {user.name}
                        </option>
                      ))}
                  </select>
                </div>

                <div className="rounded-md border border-amber-200 bg-amber-50 p-3">
                  <p className="font-semibold text-amber-900">Semi-Completed Jobs (Awaiting Costing)</p>
                  <p className="text-xs text-amber-800">J &amp; J Ward jobs appear here until costing is saved.</p>
                  {semiCompletedJobsForHub.length === 0 ? (
                    <p className="mt-2 text-sm text-amber-900">No semi-completed jobs.</p>
                  ) : (
                    <div className="mt-3 space-y-3">
                      <div>
                        <Label>Semi-completed job</Label>
                        <select
                          className="mt-1 h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm"
                          value={selectedSemiJobId}
                          onChange={(e) => setSelectedSemiJobId(e.target.value)}
                        >
                          <option value="">Select job</option>
                          {semiCompletedJobsForHub.map((job) => (
                            <option key={job.id} value={job.id}>
                              {job.contract} | {job.driverName} | {formatDisplayDate(job.completedDate || job.date)} | {job.reg} | {job.collectionSite} -&gt; {job.destinationSite || "-"}
                            </option>
                          ))}
                        </select>
                      </div>
                      {selectedSemiJob ? (
                        <div className="grid gap-3 md:grid-cols-2">
                          <div>
                            <Label>Collection Reference (optional)</Label>
                            <Input
                              value={collectionReference}
                              onChange={(e) => setCollectionReference(e.target.value)}
                              placeholder="Enter collection reference"
                            />
                          </div>
                          <div>
                            <Label>Costing Type</Label>
                            <select
                              className="mt-1 h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm"
                              value={costingType}
                              onChange={(e) => setCostingType(e.target.value as "per_load" | "per_tonne")}
                            >
                              <option value="per_load">Per Load</option>
                              <option value="per_tonne">Per tonne</option>
                            </select>
                          </div>
                          <div>
                            <Label>{costingType === "per_tonne" ? "Price Per Tonne" : "Price Per Load"}</Label>
                            <NumericKeypad
                              value={costingPrice}
                              onChange={setCostingPrice}
                              label="Costing Price"
                              allowDecimal
                              placeholder="Enter price"
                            />
                          </div>
                          {costingType === "per_tonne" ? (
                            <div>
                              <Label>Weight (tonnes)</Label>
                              <NumericKeypad
                                value={costingWeight}
                                onChange={setCostingWeight}
                                label="Weight"
                                allowDecimal
                                placeholder="Enter weight"
                              />
                            </div>
                          ) : null}
                          <div className="md:col-span-2">
                            <Button onClick={finalizeSemiCompletedJob}>Save Costing and Move to Completed</Button>
                          </div>
                        </div>
                      ) : null}
                    </div>
                  )}
                </div>

                {completedJobsForHub.length === 0 ? (
                  <p className="text-sm text-slate-500">No completed jobs yet.</p>
                ) : (
                  Object.entries(completedJobsByContract).map(([contractName, jobs]) => (
                    <div key={contractName} className={`space-y-2 rounded-md border p-3 ${getContractTintClass(contractName)}`}>
                      <p className="text-sm font-semibold text-slate-900">{contractName}</p>
                      {jobs.map((job) => (
                        <div key={job.id} className={`rounded-md border p-3 text-sm bg-white/80 ${getContractTintClass(contractName)}`}>
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="font-medium text-slate-900 mb-1">{job.driverName}</p>
                              {isJJWardContract(job.contract) ? (
                                renderJJWardCompletedJobLines(job)
                              ) : (
                                <>
                                  <p className="text-slate-700">
                                    {formatDisplayDate(job.date)} → {formatDisplayDate(job.completedDate || job.date)} - {job.reg} - {job.jobRef} - {job.collectionSite} → {job.destinationSite || "-"} - {job.completeJobRef || "-"}
                                  </p>
                                  {job.costingType ? (
                                    <p className="mt-1 text-xs text-slate-600">
                                      Costing: {job.costingType === "per_tonne" ? "Per tonne" : "Per Load"} | Price: {job.costingPrice || "-"}
                                      {job.costingType === "per_tonne" ? ` | Weight: ${job.costingWeight || "-"}` : ""}
                                      {` | Total: ${job.costingTotal || "-"}`}
                                    </p>
                                  ) : null}
                                  {job.collectionReference ? (
                                    <p className="mt-1 text-xs text-slate-600">Collection Ref: {job.collectionReference}</p>
                                  ) : null}
                                </>
                              )}
                              {job.destinationNotes ? (
                                <p className="mt-1 text-xs text-slate-500 italic">Destination notes: {job.destinationNotes}</p>
                              ) : null}
                              {job.notes ? (
                                <p className="mt-1 text-xs text-slate-500 italic">Collection notes: {job.notes}</p>
                              ) : null}
                            </div>
                            <div className="flex gap-2">
                              <Button variant="outline" onClick={() => startEditingJob(job.id, "completed", job)}>
                                Edit
                              </Button>
                              <Button variant="outline" onClick={() => deleteJobFromHub(job.id)}>
                                Delete
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          ) : null}

          {hubTab === "reports" ? (
            <Card>
              <CardHeader>
                <CardTitle>Issue Reports</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {issueReports.length === 0 ? (
                  <p className="text-sm text-slate-500">No reports submitted yet.</p>
                ) : (
                  issueReports.map((r) => (
                    <div key={r.id} className="rounded-md border border-slate-200 p-3 text-sm bg-white">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-medium">{r.driverName}</p>
                          <p className="text-slate-600">{r.text}</p>
                          <p className="text-xs text-slate-500 mt-1">Date: {formatDisplayDate(r.date)}</p>
                        </div>
                        <Button variant="outline" onClick={() => deleteReportFromHub(r.id)}>
                          Delete
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          ) : null}

          {hubTab === "weekly" ? (
            <Card>
              <CardHeader>
                <CardTitle>Weekly Report</CardTitle>
                <CardDescription>
                  Export the week&apos;s jobs, diesel, AdBlue and mileage — choose Word or Excel. After exporting you can reset the week to start fresh.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {weekReset ? (
                  <div className="rounded-xl border border-green-300 bg-green-50 p-6 text-center">
                    <p className="text-lg font-semibold text-green-700">Week has been reset.</p>
                    <p className="mt-1 text-sm text-slate-600">All completed jobs, fuel entries, and reports have been cleared.</p>
                    <Button className="mt-4" variant="outline" onClick={() => setWeekReset(false)}>
                      Close
                    </Button>
                  </div>
                ) : (
                  <>
                    {/* Full export */}
                    <div className="rounded-xl border border-slate-200 bg-white p-4">
                      <p className="mb-3 font-semibold text-slate-800">Full Weekly Report — All Drivers</p>
                      <div className="flex flex-wrap gap-2">
                        <Button onClick={() => downloadReport("all")} className="bg-blue-700 hover:bg-blue-800 text-white">
                          Export All — Word (.doc)
                        </Button>
                        <Button onClick={() => downloadReportExcel("all")} className="bg-emerald-700 hover:bg-emerald-800 text-white">
                          Export All — Excel (.xls)
                        </Button>
                      </div>
                    </div>

                    {/* Per-driver export */}
                    <div className="rounded-xl border border-slate-200 bg-white p-4">
                      <p className="mb-3 font-semibold text-slate-800">Individual Driver Report</p>
                      <div className="flex flex-wrap gap-3 items-end">
                        <div>
                          <Label className="mb-1 block text-sm">Select Driver</Label>
                          <select
                            className="rounded border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800"
                            value={weeklyReportDriver}
                            onChange={(e) => setWeeklyReportDriver(e.target.value)}
                          >
                            <option value="all">— choose a driver —</option>
                            {users
                              .filter((u) => u.role === "driver")
                              .map((u) => (
                                <option key={u.id} value={u.username}>
                                  {u.name}
                                </option>
                              ))}
                          </select>
                        </div>
                        <Button
                          disabled={weeklyReportDriver === "all"}
                          onClick={() => downloadReport(weeklyReportDriver)}
                          className="bg-blue-700 hover:bg-blue-800 text-white disabled:opacity-40"
                        >
                            Word (.doc)
                        </Button>
                          <Button
                            disabled={weeklyReportDriver === "all"}
                            onClick={() => downloadReportExcel(weeklyReportDriver)}
                            className="bg-emerald-700 hover:bg-emerald-800 text-white disabled:opacity-40"
                          >
                            Excel (.xls)
                          </Button>
                      </div>
                    </div>

                    {/* Preview */}
                    <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-4">
                      <p className="font-semibold text-slate-800">On-screen report (same data as export)</p>
                      <p className="text-sm text-slate-600">
                        Total Diesel: <span className="font-semibold text-slate-800">{formatLitres(totalDieselLitres)} L</span>
                        {" "}
                        | Total AdBlue: <span className="font-semibold text-slate-800">{formatLitres(totalAdBlueLitres)} L</span>
                      </p>
                      {users
                        .filter((u) => u.role === "driver")
                        .map((driver) => {
                          const dJobs = completedJobs.filter(
                            (j) => normalize(j.driverUsername || "") === normalize(driver.username),
                          );
                          const dFuel = fuelEntries.filter(
                            (e) => normalize(e.driverUsername || "") === normalize(driver.username),
                          );
                          const dMileage = mileageEntries.filter(
                            (entry) => normalize(entry.driverUsername || "") === normalize(driver.username),
                          );
                          const dieselTotal = dFuel
                            .filter((e) => normalize(e.type) === "diesel")
                            .reduce((sum, e) => sum + Number(e.litres || 0), 0);
                          const adblueTotal = dFuel
                            .filter((e) => normalize(e.type) === "adblue")
                            .reduce((sum, e) => sum + Number(e.litres || 0), 0);
                          const closingMissing = dMileage.filter((entry) => !entry.closingMileage).length;
                          const dJobsSorted = dJobs
                            .slice()
                            .sort((a, b) => (a.completedDate || a.date || "").localeCompare(b.completedDate || b.date || ""));
                          const dFuelSorted = dFuel
                            .slice()
                            .sort((a, b) => (a.date || "").localeCompare(b.date || ""));
                          const dMileageSorted = dMileage
                            .slice()
                            .sort((a, b) => (a.date || "").localeCompare(b.date || ""));
                          return (
                            <div key={driver.id} className="rounded border border-slate-100 bg-slate-50 p-3 text-sm">
                              <div className="flex items-center justify-between">
                                <span className="font-semibold text-slate-800">{driver.name}</span>
                                <div className="flex gap-2">
                                  <Button variant="outline" onClick={() => downloadReport(driver.username)}>
                                    Word
                                  </Button>
                                  <Button variant="outline" className="text-emerald-700 border-emerald-400 hover:bg-emerald-50" onClick={() => downloadReportExcel(driver.username)}>
                                    Excel
                                  </Button>
                                </div>
                              </div>
                              <p className="mt-1 text-slate-500">
                                {dJobs.length} completed job{dJobs.length !== 1 ? "s" : ""} &bull; Diesel: {formatLitres(dieselTotal)} L &bull; AdBlue: {formatLitres(adblueTotal)} L &bull; Mileage logs: {dMileage.length}{closingMissing > 0 ? ` (${closingMissing} open)` : ""}
                              </p>

                              {dJobsSorted.length > 0 ? (
                                <div className="mt-3 overflow-x-auto rounded border border-slate-200 bg-white">
                                  <p className="border-b border-slate-200 px-3 py-2 font-medium text-slate-700">Jobs</p>
                                  <table className="min-w-full text-xs">
                                    <thead className="bg-slate-100 text-slate-700">
                                      <tr>
                                        <th className="px-2 py-1 text-left">Pickup Date</th>
                                        <th className="px-2 py-1 text-left">Drop Date</th>
                                        <th className="px-2 py-1 text-left">Reg</th>
                                        <th className="px-2 py-1 text-left">WJR</th>
                                        <th className="px-2 py-1 text-left">Collection</th>
                                        <th className="px-2 py-1 text-left">Destination</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {dJobsSorted.map((job) => (
                                        <tr key={job.id} className="border-t border-slate-100">
                                          <td className="px-2 py-1">{formatDisplayDate(job.date)}</td>
                                          <td className="px-2 py-1">{formatDisplayDate(job.completedDate || job.date)}</td>
                                          <td className="px-2 py-1">{job.reg || "-"}</td>
                                          <td className="px-2 py-1">{job.jobRef || "-"}</td>
                                          <td className="px-2 py-1">{job.collectionSite || "-"}</td>
                                          <td className="px-2 py-1">{job.destinationSite || "-"}</td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              ) : null}

                              {dFuelSorted.length > 0 ? (
                                <div className="mt-3 overflow-x-auto rounded border border-slate-200 bg-white">
                                  <p className="border-b border-slate-200 px-3 py-2 font-medium text-slate-700">Fuel</p>
                                  <table className="min-w-full text-xs">
                                    <thead className="bg-slate-100 text-slate-700">
                                      <tr>
                                        <th className="px-2 py-1 text-left">Date</th>
                                        <th className="px-2 py-1 text-left">Reg</th>
                                        <th className="px-2 py-1 text-left">Type</th>
                                        <th className="px-2 py-1 text-left">Litres</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {dFuelSorted.map((entry) => (
                                        <tr key={entry.id} className="border-t border-slate-100">
                                          <td className="px-2 py-1">{formatDisplayDate(entry.date)}</td>
                                          <td className="px-2 py-1">{entry.reg || "-"}</td>
                                          <td className="px-2 py-1">{entry.type || "-"}</td>
                                          <td className="px-2 py-1">{formatLitres(Number(entry.litres || 0))}</td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              ) : null}

                              {dMileageSorted.length > 0 ? (
                                <div className="mt-3 overflow-x-auto rounded border border-slate-200 bg-white">
                                  <p className="border-b border-slate-200 px-3 py-2 font-medium text-slate-700">Mileage</p>
                                  <table className="min-w-full text-xs">
                                    <thead className="bg-slate-100 text-slate-700">
                                      <tr>
                                        <th className="px-2 py-1 text-left">Date</th>
                                        <th className="px-2 py-1 text-left">Reg</th>
                                        <th className="px-2 py-1 text-left">Opening</th>
                                        <th className="px-2 py-1 text-left">Closing</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {dMileageSorted.map((entry) => (
                                        <tr key={entry.id} className="border-t border-slate-100">
                                          <td className="px-2 py-1">{formatDisplayDate(entry.date)}</td>
                                          <td className="px-2 py-1">{entry.reg || "-"}</td>
                                          <td className="px-2 py-1">{entry.openingMileage || "-"}</td>
                                          <td className="px-2 py-1">{entry.closingMileage || "-"}</td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              ) : null}
                            </div>
                          );
                        })}
                    </div>

                    {/* Reset week */}
                    <div className="rounded-xl border border-red-200 bg-red-50 p-4">
                      <p className="mb-1 font-semibold text-red-700">Reset Week</p>
                      <p className="mb-3 text-sm text-slate-600">
                        Permanently deletes all completed jobs, fuel entries, and issue reports. Export first — this
                        cannot be undone.
                      </p>
                      <Button variant="outline" className="border-red-500 text-red-600 hover:bg-red-100" onClick={resetWeek}>
                        Reset Weekly Report
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          ) : null}

          {hubTab === "fuel" ? (
            <Card>
              <CardHeader>
                <CardTitle>Fuel Entries by Driver</CardTitle>
                <CardDescription>Filter by fuel type and review every dated entry by driver.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-xl border border-slate-200 bg-white p-4">
                  <p className="mb-3 text-sm font-medium text-slate-700">Fuel Type Filters</p>
                  <div className="flex flex-wrap gap-4">
                    <label className="inline-flex items-center gap-2 text-sm text-slate-700">
                      <input
                        type="checkbox"
                        checked={showDieselFuel}
                        onChange={(e) => setShowDieselFuel(e.target.checked)}
                      />
                      Diesel
                    </label>
                    <label className="inline-flex items-center gap-2 text-sm text-slate-700">
                      <input
                        type="checkbox"
                        checked={showAdBlueFuel}
                        onChange={(e) => setShowAdBlueFuel(e.target.checked)}
                      />
                      AdBlue
                    </label>
                  </div>
                </div>

                {users
                  .filter((u) => u.role === "driver")
                  .map((driver) => {
                    const driverFuelEntries = fuelEntries
                      .filter((entry) => normalize(entry.driverUsername || "") === normalize(driver.username))
                      .filter((entry) => {
                        const type = normalize(entry.type || "");
                        return (showDieselFuel && type === "diesel") || (showAdBlueFuel && type === "adblue");
                      })
                      .slice()
                      .sort((a, b) => (a.date || "").localeCompare(b.date || ""));

                    return (
                      <div key={driver.id} className="rounded-xl border border-slate-200 bg-white p-4">
                        <div>
                          <h3 className="text-lg font-semibold text-slate-900">{driver.name}</h3>
                          <p className="text-xs text-slate-500">{driver.username}</p>
                        </div>

                        {driverFuelEntries.length === 0 ? (
                          <p className="mt-3 text-sm text-slate-500">No matching fuel entries.</p>
                        ) : (
                          <div className="mt-3 space-y-2">
                            {driverFuelEntries.map((entry) => (
                              <div key={entry.id} className="rounded border border-slate-100 bg-slate-50 p-2 text-xs">
                                <div className="flex items-start justify-between gap-3">
                                  <div>
                                    <p>Type: {entry.type} | Litres: {entry.litres} | Vehicle: {entry.reg}</p>
                                    <p>Date: {formatDisplayDate(entry.date)}</p>
                                  </div>
                                  <Button variant="outline" onClick={() => deleteFuelEntryFromHub(entry.id)}>
                                    Delete
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
              </CardContent>
            </Card>
          ) : null}

          {hubTab === "mileage" ? (
            <Card>
              <CardHeader>
                <CardTitle>Mileage Entries by Driver</CardTitle>
                <CardDescription>Review and filter daily opening/closing mileage logs.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-xl border border-slate-200 bg-white p-4">
                  <p className="mb-3 text-sm font-medium text-slate-700">Mileage Filters</p>
                  <div className="grid gap-3 md:grid-cols-3">
                    <div>
                      <Label>Driver</Label>
                      <select
                        className="mt-1 h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm"
                        value={selectedMileageDriver}
                        onChange={(e) => setSelectedMileageDriver(e.target.value)}
                      >
                        <option value="all">All drivers</option>
                        {users
                          .filter((user) => user.role === "driver")
                          .map((user) => (
                            <option key={user.id} value={user.username}>
                              {user.name}
                            </option>
                          ))}
                      </select>
                    </div>
                    <div>
                      <Label>Date</Label>
                      <Input
                        type="date"
                        className="mt-1"
                        value={mileageDateFilter}
                        onChange={(e) => setMileageDateFilter(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Status</Label>
                      <select
                        className="mt-1 h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm"
                        value={mileageStatusFilter}
                        onChange={(e) => setMileageStatusFilter(e.target.value as "all" | "open" | "closed")}
                      >
                        <option value="all">All</option>
                        <option value="open">Opening only</option>
                        <option value="closed">Opening and closing</option>
                      </select>
                    </div>
                  </div>
                </div>

                {mileageEntriesForHub.length === 0 ? (
                  <p className="text-sm text-slate-500">No mileage entries match the selected filters.</p>
                ) : (
                  mileageEntriesForHub.map((entry) => (
                    <div key={entry.id} className="rounded-md border border-slate-200 p-3 text-sm bg-white">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-medium text-slate-900">{entry.driverName}</p>
                          <p className="text-slate-700">
                            Date: {formatDisplayDate(entry.date)} | Vehicle: {entry.reg} | Opening: {entry.openingMileage || "-"} | Closing: {entry.closingMileage || "-"}
                          </p>
                        </div>
                        <Button variant="outline" onClick={() => deleteMileageEntryFromHub(entry.id)}>
                          Delete
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          ) : null}

          {hubTab === "drivers" ? (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Add Account</CardTitle>
                  <CardDescription>Create new driver or admin login credentials.</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-3 md:grid-cols-5">
                  <div>
                    <Label>Name</Label>
                    <Input value={newDriverName} onChange={(e) => setNewDriverName(e.target.value)} />
                  </div>
                  <div>
                    <Label>Username</Label>
                    <Input value={newDriverUsername} onChange={(e) => setNewDriverUsername(e.target.value)} />
                  </div>
                  <div>
                    <Label>Password</Label>
                    <Input value={newDriverPassword} onChange={(e) => setNewDriverPassword(e.target.value)} />
                  </div>
                  <div>
                    <Label>Role</Label>
                    <select
                      className="mt-1 h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm"
                      value={newAccountRole}
                      onChange={(e) => setNewAccountRole(e.target.value as "driver" | "admin")}
                    >
                      <option value="driver">Driver</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                  <div className="flex items-end">
                    <Button onClick={addDriver}>Add Account</Button>
                  </div>
                  {driverMgmtError ? <p className="md:col-span-5 text-sm text-red-600">{driverMgmtError}</p> : null}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Driver Accounts</CardTitle>
                  <CardDescription>Edit names, usernames, and passwords.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {users.map((user) => (
                    <div key={user.id} className="grid gap-2 rounded-md border border-slate-200 p-3 md:grid-cols-4">
                      <div>
                        <Label>Name</Label>
                        <Input
                          value={user.name}
                          onChange={(e) => updateDriver(user.id, "name", e.target.value)}
                          onBlur={(e) => persistDriverUpdate(user.id, "name", e.target.value)}
                          disabled={user.role === "admin"}
                        />
                      </div>
                      <div>
                        <Label>Username</Label>
                        <Input
                          value={user.username}
                          onChange={(e) => updateDriver(user.id, "username", e.target.value)}
                          onBlur={(e) => persistDriverUpdate(user.id, "username", e.target.value)}
                          disabled={user.role === "admin"}
                        />
                      </div>
                      <div>
                        <Label>Password</Label>
                        <Input
                          value={user.password}
                          onChange={(e) => updateDriver(user.id, "password", e.target.value)}
                          onBlur={(e) => persistDriverUpdate(user.id, "password", e.target.value)}
                          disabled={user.role === "admin"}
                        />
                      </div>
                      <div className="flex items-end justify-between gap-2">
                        <p className="text-xs uppercase tracking-wide text-slate-500">{user.role}</p>
                        {user.role === "admin" ? null : (
                          <Button variant="outline" onClick={() => removeDriver(user.id)}>
                            Remove
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          ) : null}

          {hubTab === "sites" ? (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Contracts</CardTitle>
                  <CardDescription>Create and remove contracts, then manage their sites.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {contracts.map((contract) => (
                      <Button
                        key={contract}
                        variant={editingContract === contract ? "default" : "outline"}
                        onClick={() => setEditingContract(contract)}
                      >
                        {contract}
                      </Button>
                    ))}
                  </div>
                  <div className="grid gap-2 md:grid-cols-[1fr_auto_auto]">
                    <Input
                      placeholder="New contract name"
                      value={newContractName}
                      onChange={(e) => setNewContractName(e.target.value)}
                    />
                    <Button onClick={addContract}>Add Contract</Button>
                    <Button
                      variant="outline"
                      onClick={() => removeContract(editingContract)}
                      disabled={!editingContract || contracts.length <= 1}
                    >
                      Remove Selected
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Sites for {editingContract || "-"}</CardTitle>
                  <CardDescription>
                    Use the top manual input for none-listed sites, then choose collection, destination, or both.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {siteMgmtError ? <p className="text-sm text-red-600">{siteMgmtError}</p> : null}
                  <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">Manual Site Input (Top of List)</p>
                    <p className="mt-1 text-xs text-slate-500">Use this when a site is not already listed for the selected contract.</p>
                  </div>
                  <div className="flex flex-wrap gap-2 items-end">
                    <div className="flex-1 min-w-[180px]">
                      <label className="mb-1 block text-xs font-medium text-slate-600">Manual Site Name</label>
                      <Input
                        placeholder="Enter none-listed site"
                        value={newSiteName}
                        onChange={(e) => setNewSiteName(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-medium text-slate-600">Type</label>
                      <select
                        className="h-10 rounded border border-slate-300 bg-white px-3 text-sm text-slate-800"
                        value={newSiteType}
                        onChange={(e) => setNewSiteType(e.target.value as "collection" | "destination" | "both")}
                      >
                        <option value="collection">Collection only</option>
                        <option value="destination">Destination only</option>
                        <option value="both">Both</option>
                      </select>
                    </div>
                    <Button onClick={addSiteToContract} disabled={!editingContract}>
                      Add Manual Site
                    </Button>
                  </div>

                  {(allSitesByContract[editingContract] || []).length === 0 ? (
                    <p className="text-sm text-slate-500">No sites for this contract yet.</p>
                  ) : (
                    (allSitesByContract[editingContract] || []).map((site, index) => (
                      <div key={`${editingContract}-${index}`} className="flex items-center gap-2">
                        <span className={`inline-flex h-9 min-w-[70px] items-center justify-center rounded-md border px-2 text-xs font-semibold ${
                          site.siteType === "collection" ? "border-green-300 bg-green-50 text-green-700" :
                          site.siteType === "destination" ? "border-blue-300 bg-blue-50 text-blue-700" :
                          "border-purple-300 bg-purple-50 text-purple-700"
                        }`}>
                          {site.siteType === "collection" ? "Collection" : site.siteType === "destination" ? "Destination" : "Both"}
                        </span>
                        <Input
                          className="flex-1"
                          value={site.name}
                          onChange={(e) => renameSite(editingContract, index, e.target.value)}
                          onBlur={(e) => persistSiteRename(editingContract, index, e.target.value)}
                        />
                        <select
                          className="h-9 rounded border border-slate-300 bg-white px-2 text-xs text-slate-700"
                          value={site.siteType}
                          onChange={(e) => updateSiteType(editingContract, index, e.target.value)}
                        >
                          <option value="collection">Collection only</option>
                          <option value="destination">Destination only</option>
                          <option value="both">Both</option>
                        </select>
                        <Button variant="outline" onClick={() => removeSite(editingContract, index)}>
                          Remove
                        </Button>
                      </div>
                    ))
                  )}

                </CardContent>
              </Card>
            </div>
          ) : null}

          {hubTab === "folders" ? (
            <Card>
              <CardHeader>
                <CardTitle>Driver Folders</CardTitle>
                <CardDescription>
                  Each driver has a folder with started and completed jobs, including times and references.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {users
                  .filter((u) => u.role === "driver")
                  .map((driver) => {
                    const driverStarted = activeJobs.filter(
                      (job) => normalize(job.driverUsername || "") === normalize(driver.username),
                    );
                    const driverCompleted = completedJobs.filter(
                      (job) => normalize(job.driverUsername || "") === normalize(driver.username),
                    );

                    return (
                      <div key={driver.id} className="rounded-xl border border-slate-200 bg-white p-4">
                        <h3 className="text-lg font-semibold text-slate-900">{driver.name}</h3>
                        <p className="text-xs text-slate-500">{driver.username}</p>

                        <div className="mt-3 grid gap-3 md:grid-cols-2">
                          <div className="rounded-md border border-slate-200 p-3">
                            <p className="font-semibold text-slate-900">Jobs Started ({driverStarted.length})</p>
                            {driverStarted.length === 0 ? (
                              <p className="mt-2 text-sm text-slate-500">No started jobs.</p>
                            ) : (
                              driverStarted.map((job) => (
                                <div key={job.id} className={`mt-2 rounded border p-2 text-xs ${getContractTintClass(job.contract)}`}>
                                  <p>Contract: {job.contract}</p>
                                  <p>Vehicle: {job.reg}</p>
                                  <p>Collection: {job.collectionSite}</p>
                                  <p>WJR: {job.jobRef}</p>
                                  <p>Arrival: {job.arrivalTime || "-"} | Exit: {job.exitTime || "-"}</p>
                                  <p>Date: {formatDisplayDate(job.date)}</p>
                                </div>
                              ))
                            )}
                          </div>

                          <div className="rounded-md border border-slate-200 p-3">
                            <p className="font-semibold text-slate-900">Jobs Completed ({driverCompleted.length})</p>
                            {driverCompleted.length === 0 ? (
                              <p className="mt-2 text-sm text-slate-500">No completed jobs.</p>
                            ) : (
                              driverCompleted.map((job) => (
                                <div key={job.id} className={`mt-2 rounded border p-2 text-xs ${getContractTintClass(job.contract)}`}>
                                  <p>Contract: {job.contract}</p>
                                  {isJJWardContract(job.contract) ? (
                                    renderJJWardCompletedJobLines(job, "text-slate-800")
                                  ) : (
                                    <p>
                                      {formatDisplayDate(job.date)} → {formatDisplayDate(job.completedDate || job.date)} - {job.reg} - {job.jobRef} - {job.collectionSite} → {job.destinationSite || "-"} - {job.completeJobRef || "-"}
                                    </p>
                                  )}
                                  {job.destinationNotes ? <p>Destination Notes: {job.destinationNotes}</p> : null}
                                  {job.notes ? <p>Collection Notes: {job.notes}</p> : null}
                                  <p>Start Time: {job.arrivalTime || "-"}</p>
                                  <p>Complete Arrival: {job.completeArrivalTime || "-"}</p>
                                  <p>Complete Departure: {job.completeDepartureTime || "-"}</p>
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </CardContent>
            </Card>
          ) : null}

          {/* Edit Job Modal */}
          {editingJobId && editingJobType && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
              <div className="w-full max-w-2xl max-h-[90vh] rounded-2xl bg-white p-6 shadow-2xl overflow-y-auto">
                <h2 className="text-xl font-bold mb-4">Edit {editingJobType === "live" ? "Live" : "Completed"} Job</h2>
                
                <div className="grid gap-3 md:grid-cols-2">
                  {editingJobType === "live" && (
                    <>
                      <div>
                        <Label>Job Ref (WJR)</Label>
                        <NumericKeypad value={editFields.jobRef || ""} onChange={(v) => setEditFields({...editFields, jobRef: v})} label="Job Ref" placeholder="Job reference" />
                      </div>
                      <div>
                        <Label>Collection Site</Label>
                        <Input
                          value={editFields.collectionSite || ""}
                          onChange={(e) => setEditFields({...editFields, collectionSite: e.target.value})}
                          placeholder="Collection site"
                        />
                      </div>
                      <div>
                        <Label>Arrival Time</Label>
                        <TimePicker value={editFields.arrivalTime || ""} onChange={(v) => setEditFields({...editFields, arrivalTime: v})} />
                      </div>
                      <div>
                        <Label>Exit Time</Label>
                        <TimePicker value={editFields.exitTime || ""} onChange={(v) => setEditFields({...editFields, exitTime: v})} />
                      </div>
                      <div className="md:col-span-2">
                        <Label>Collection Notes</Label>
                        <Input
                          value={editFields.notes || ""}
                          onChange={(e) => setEditFields({...editFields, notes: e.target.value})}
                          placeholder="Notes (optional)"
                        />
                      </div>
                    </>
                  )}

                  {editingJobType === "completed" && (
                    <>
                      <div className="md:col-span-2">
                        <h3 className="font-semibold text-slate-700 mb-3">Starting Information</h3>
                      </div>
                      <div>
                        <Label>Job Ref (WJR)</Label>
                        <NumericKeypad value={editFields.jobRef || ""} onChange={(v) => setEditFields({...editFields, jobRef: v})} label="Job Ref" placeholder="Job reference" />
                      </div>
                      <div>
                        <Label>Collection Site</Label>
                        <Input
                          value={editFields.collectionSite || ""}
                          onChange={(e) => setEditFields({...editFields, collectionSite: e.target.value})}
                          placeholder="Collection site"
                        />
                      </div>
                      <div>
                        <Label>Arrival Time</Label>
                        <TimePicker value={editFields.arrivalTime || ""} onChange={(v) => setEditFields({...editFields, arrivalTime: v})} />
                      </div>
                      <div>
                        <Label>Exit Time</Label>
                        <TimePicker value={editFields.exitTime || ""} onChange={(v) => setEditFields({...editFields, exitTime: v})} />
                      </div>
                      <div className="md:col-span-2">
                        <Label>Collection Notes</Label>
                        <Input
                          value={editFields.notes || ""}
                          onChange={(e) => setEditFields({...editFields, notes: e.target.value})}
                          placeholder="Notes (optional)"
                        />
                      </div>

                      <div className="md:col-span-2 mt-4 pt-4 border-t">
                        <h3 className="font-semibold text-slate-700 mb-3">Completion Information</h3>
                      </div>
                      <div>
                        <Label>Destination Site</Label>
                        <Input
                          value={editFields.destinationSite || ""}
                          onChange={(e) => setEditFields({...editFields, destinationSite: e.target.value})}
                          placeholder="Destination site"
                        />
                      </div>
                      <div>
                        <Label>Arrival Time (at destination)</Label>
                        <TimePicker value={editFields.completeArrivalTime || ""} onChange={(v) => setEditFields({...editFields, completeArrivalTime: v})} />
                      </div>
                      <div>
                        <Label>Departure Time (from destination)</Label>
                        <TimePicker value={editFields.completeDepartureTime || ""} onChange={(v) => setEditFields({...editFields, completeDepartureTime: v})} />
                      </div>
                      <div>
                        <Label>Completion Date</Label>
                        <p className="text-xs text-slate-500 mb-2">Click to open date picker, then click OK to confirm</p>
                        <DatePicker value={editFields.completedDate || ""} onChange={(v) => setEditFields({...editFields, completedDate: v})} />
                      </div>
                      <div>
                        <Label>Drop Job Number</Label>
                        <NumericKeypad value={editFields.completeJobRef || ""} onChange={(v) => setEditFields({...editFields, completeJobRef: v})} label="Job Number" placeholder="Job number" />
                      </div>
                      <div className="md:col-span-2">
                        <Label>Destination Notes</Label>
                        <Input
                          value={editFields.destinationNotes || ""}
                          onChange={(e) => setEditFields({...editFields, destinationNotes: e.target.value})}
                          placeholder="Notes (optional)"
                        />
                      </div>

                      {isJJWardContract(editingJobContract) ? (
                        <>
                          <div className="md:col-span-2 mt-4 pt-4 border-t">
                            <h3 className="font-semibold text-slate-700 mb-3">Hub Billing Information</h3>
                          </div>
                          <div>
                            <Label>Collection Reference (optional)</Label>
                            <Input
                              value={editFields.collectionReference || ""}
                              onChange={(e) => setEditFields({...editFields, collectionReference: e.target.value})}
                              placeholder="Collection reference"
                            />
                          </div>
                          <div>
                            <Label>Costing Type</Label>
                            <select
                              className="mt-1 h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm"
                              value={editFields.costingType || "per_load"}
                              onChange={(e) => setEditFields({...editFields, costingType: e.target.value})}
                            >
                              <option value="per_load">Per Load</option>
                              <option value="per_tonne">Per tonne</option>
                            </select>
                          </div>
                          <div>
                            <Label>{editFields.costingType === "per_tonne" ? "Price Per Tonne" : "Price Per Load"}</Label>
                            <NumericKeypad
                              value={editFields.costingPrice || ""}
                              onChange={(v) => setEditFields({...editFields, costingPrice: v})}
                              label="Costing Price"
                              allowDecimal
                              placeholder="Enter price"
                            />
                          </div>
                          {editFields.costingType === "per_tonne" ? (
                            <div>
                              <Label>Weight (tonnes)</Label>
                              <NumericKeypad
                                value={editFields.costingWeight || ""}
                                onChange={(v) => setEditFields({...editFields, costingWeight: v})}
                                label="Weight"
                                allowDecimal
                                placeholder="Enter weight"
                              />
                            </div>
                          ) : null}
                        </>
                      ) : null}
                    </>
                  )}
                </div>

                <div className="mt-6 flex gap-3">
                  <Button variant="outline" onClick={() => { setEditingJobId(null); setEditingJobType(null); setEditingJobContract(""); }}>
                    Cancel
                  </Button>
                  <Button onClick={saveEditJob} className="bg-slate-900 hover:bg-slate-800">
                    Save Changes
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_10%_10%,#dbeafe_0%,#eff6ff_35%,#f8fafc_100%)] p-6">
      <div className="mx-auto max-w-5xl space-y-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900">Towells Job Portal</h1>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <p className="text-sm font-medium text-slate-600">Signed in as {activeUser?.name}</p>
              <Button variant="outline" className="h-8 bg-white text-xs" onClick={openChangeSetupModal}>
                Change Contract or Truck
              </Button>
            </div>
          </div>
          <Button variant="outline" className="bg-white/90" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" /> Logout
          </Button>
        </div>

        {showChangeSetup ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
            <Card className="w-full max-w-md border-0 shadow-2xl">
              <CardHeader>
                <CardTitle>Change Contract or Truck</CardTitle>
                <CardDescription>Update your contract and registration.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Contract</Label>
                  <select
                    className="mt-1 h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm"
                    value={draftContract}
                    onChange={(e) => setDraftContract(e.target.value)}
                  >
                    <option value="">Select contract</option>
                    {contracts.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label>Truck Registration</Label>
                  <select
                    className="mt-1 h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm"
                    value={draftReg}
                    onChange={(e) => setDraftReg(e.target.value)}
                  >
                    <option value="">Select truck</option>
                    {vehicleRegs.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex gap-2">
                  <Button onClick={saveChangeSetup}>Save</Button>
                  <Button variant="outline" onClick={() => setShowChangeSetup(false)}>
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : null}

        {jobCompleteNotice ? (
          <Alert className="border-teal-300 bg-teal-50">
            <CheckCircle2 className="mr-2 inline h-4 w-4" />
            <AlertTitle>Job Complete</AlertTitle>
            <AlertDescription>
              <span className="block font-semibold">#TeamTowells</span>
              <span className="block">thank you.</span>
            </AlertDescription>
          </Alert>
        ) : null}

        {jobSavedNotice ? (
          <Alert className="border-emerald-300 bg-emerald-50">
            <CheckCircle2 className="mr-2 inline h-4 w-4" />
            <AlertTitle>Job Submitted</AlertTitle>
            <AlertDescription>Live job saved successfully. Pick your next action below.</AlertDescription>
          </Alert>
        ) : null}

        {portalError ? (
          <Alert className="border-red-300 bg-red-50">
            <AlertTitle>Sync Issue</AlertTitle>
            <AlertDescription>{portalError}</AlertDescription>
          </Alert>
        ) : null}

        {mileageRequired ? (
          <Alert className="border-2 border-orange-500 bg-orange-100 text-orange-950 shadow-sm">
            <AlertTriangle className="mr-2 inline h-4 w-4" />
            <AlertTitle>Opening Mileage Required</AlertTitle>
            <AlertDescription>
              Enter today&apos;s opening mileage to continue. You can add closing mileage later at the end of the day.
            </AlertDescription>
          </Alert>
        ) : null}

        <div ref={homeRef} className="space-y-6">
          <Card className="overflow-hidden border-0 bg-gradient-to-r from-slate-900 via-slate-800 to-sky-900 text-white shadow-xl">
            <CardContent className="p-6">
              <p className="text-xs uppercase tracking-[0.2em] text-sky-200">Shift Dashboard</p>
              <h2 className="mt-2 text-2xl font-black">What do you need to do now?</h2>
              <p className="mt-1 text-sm text-sky-100/90">
                Contract: {selectedContract || "-"} | Vehicle: {selectedReg || "-"} | Date: {formatDisplayDate(selectedDate)}
              </p>
            </CardContent>
          </Card>

          {currentMileageEntry?.openingMileage && !currentMileageEntry?.closingMileage ? (
            <div className="rounded-xl border border-orange-300 bg-orange-50 p-4 shadow-sm">
              <p className="text-sm font-semibold text-orange-900">End of day: add closing mileage</p>
              <p className="mt-1 text-sm text-orange-800">
                Opening mileage saved ({currentMileageEntry.openingMileage}). Add your closing mileage when your shift ends.
              </p>
              <Button
                type="button"
                className="mt-3 bg-orange-600 text-white hover:bg-orange-700"
                onClick={() => {
                  setOpeningMileage(currentMileageEntry.openingMileage || "");
                  setClosingMileage(currentMileageEntry.closingMileage || "");
                  setActiveDriverAction("mileage");
                  scrollToSection(mileageRef);
                }}
              >
                Add Closing Mileage
              </Button>
            </div>
          ) : null}

          <div className="grid gap-4 md:grid-cols-4">
            <button
              type="button"
              onClick={() => {
                if (mileageRequired) {
                  return;
                }
                setJobSavedNotice(false);
                setJobCompleteNotice(false);
                setActiveDriverAction("new");
                scrollToSection(newJobRef);
              }}
              className="group rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-sm"
              disabled={mileageRequired}
            >
              <PlusCircle className="h-7 w-7 text-sky-700" />
              <h3 className="mt-3 text-lg font-bold text-slate-900">New Job</h3>
              <p className="mt-1 text-sm text-slate-600">Create and submit a live job.</p>
            </button>

            <button
              type="button"
              onClick={() => {
                if (mileageRequired || liveJobsForUser.length === 0) {
                  return;
                }
                setJobSavedNotice(false);
                setJobCompleteNotice(false);
                setActiveDriverAction("complete");
                scrollToSection(completeRef);
              }}
              className="group rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-sm"
              disabled={mileageRequired || liveJobsForUser.length === 0}
            >
              <ClipboardCheck className="h-7 w-7 text-emerald-700" />
              <h3 className="mt-3 text-lg font-bold text-slate-900">Complete Live Job</h3>
              <p className="mt-1 text-sm text-slate-600">
                {liveJobsForUser.length === 0
                  ? "No live jobs open yet. Start a new job first."
                  : "Move a live job into completed status."}
              </p>
            </button>

            <button
              type="button"
              onClick={() => {
                if (mileageRequired) {
                  return;
                }
                setJobSavedNotice(false);
                setJobCompleteNotice(false);
                setActiveDriverAction("fuel");
                scrollToSection(fuelRef);
              }}
              className="group rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-sm"
              disabled={mileageRequired}
            >
              <Fuel className="h-7 w-7 text-amber-700" />
              <h3 className="mt-3 text-lg font-bold text-slate-900">Fuel</h3>
              <p className="mt-1 text-sm text-slate-600">Record fuel and AdBlue quickly.</p>
            </button>

            <button
              type="button"
              onClick={() => {
                setJobSavedNotice(false);
                setJobCompleteNotice(false);
                setOpeningMileage(currentMileageEntry?.openingMileage || "");
                setClosingMileage(currentMileageEntry?.closingMileage || "");
                setActiveDriverAction("mileage");
                scrollToSection(mileageRef);
              }}
              className="group rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
            >
              <CheckCircle2 className="h-7 w-7 text-indigo-700" />
              <h3 className="mt-3 text-lg font-bold text-slate-900">
                {currentMileageEntry?.openingMileage && !currentMileageEntry?.closingMileage
                  ? "Add Closing Mileage"
                  : currentMileageEntry?.openingMileage && currentMileageEntry?.closingMileage
                    ? "Update Mileage"
                    : "Add Opening Mileage"}
              </h3>
              <p className="mt-1 text-sm text-slate-600">
                {currentMileageEntry?.openingMileage && !currentMileageEntry?.closingMileage
                  ? "Opening saved. Add closing mileage at end of day."
                  : "Record opening now and closing later for the same day."}
              </p>
            </button>
          </div>

          <div className="pt-4">
            <button
              type="button"
              onClick={() => {
                if (mileageRequired) {
                  return;
                }
                setJobSavedNotice(false);
                setJobCompleteNotice(false);
                setActiveDriverAction("report");
                scrollToSection(reportRef);
              }}
              className="w-full rounded-2xl border border-rose-300 bg-gradient-to-r from-rose-100 via-orange-100 to-amber-100 p-5 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-sm"
              disabled={mileageRequired}
            >
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-7 w-7 text-rose-700" />
                <div>
                  <h3 className="text-lg font-black text-rose-900">Report</h3>
                  <p className="text-sm font-medium text-rose-800/90">
                    Safety or site issue? This stands out on purpose for fast escalation.
                  </p>
                </div>
              </div>
            </button>
          </div>
        </div>

        {activeDriverAction === "new" ? (
          <div ref={newJobRef}>
            <Card className="border-0 shadow-xl">
            <CardHeader>
              <CardTitle>Start New Job</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 md:grid-cols-2">
              <div>
                <Label>{isJJWardSelectedContract ? "Collection Point" : "Collection Site"}</Label>
                <Input
                  className="mt-1"
                  placeholder={isJJWardSelectedContract ? "Enter collection point" : "Manual site (if not listed)"}
                  value={manualCollectionSite}
                  onChange={(e) => {
                    setManualCollectionSite(e.target.value);
                    if (e.target.value.trim()) {
                      setCollectionSite("");
                    }
                  }}
                />
                {isJJWardSelectedContract ? null : (
                  <select
                    className="mt-1 h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm"
                    value={collectionSite}
                    onChange={(e) => {
                      setCollectionSite(e.target.value);
                      setManualCollectionSite("");
                    }}
                  >
                    <option value="">Select site</option>
                    {collectionSites.map((s) => (
                      <option key={s} value={s}>
                        {getPortalSiteLabel(selectedContract, s)}
                      </option>
                    ))}
                  </select>
                )}
              </div>
              <div>
                <Label>WJR / Job Number</Label>
                <NumericKeypad value={jobRef} onChange={setJobRef} label="WJR / Job Number" placeholder="Enter job number" />
              </div>
              <div>
                <Label>Arrival Time</Label>
                <TimePicker value={arrivalTime} onChange={setArrivalTime} />
              </div>
              <div>
                <Label>Exit Time</Label>
                <TimePicker value={exitTime} onChange={setExitTime} />
              </div>
              <div className="md:col-span-2">
                <Label>Notes</Label>
                <Input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Optional" />
              </div>
              <div className="md:col-span-2">
                <div className="flex gap-2">
                  <Button onClick={createJob}>Submit Job</Button>
                  <Button variant="outline" onClick={() => setActiveDriverAction("home")}>Cancel</Button>
                </div>
              </div>
            </CardContent>
            </Card>
          </div>
        ) : null}

        {activeDriverAction === "complete" ? (
          <div ref={completeRef}>
            <Card className="border-0 shadow-xl">
            <CardHeader>
              <CardTitle>Complete Live Job</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 md:grid-cols-2">
              <div className="md:col-span-2">
                <Label>Live Job</Label>
                <select
                  className="mt-1 h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm"
                  value={selectedLiveJobId}
                  onChange={(e) => {
                    setSelectedLiveJobId(e.target.value);
                    setCompleteJobRef("");
                  }}
                >
                  <option value="">Select live job</option>
                  {liveJobsForUser.map((j) => (
                    <option key={j.id} value={j.id}>
                      {getPortalSiteLabel(j.contract, j.collectionSite)} | {j.jobRef} | {j.reg}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label>{normalize(selectedLiveJob?.contract || "") === normalize("J & J Ward") ? "Destination Point" : "Destination Site"}</Label>
                <Input
                  className="mt-1"
                  placeholder={normalize(selectedLiveJob?.contract || "") === normalize("J & J Ward") ? "Enter destination point" : "Manual site (if not listed)"}
                  value={manualDestinationSite}
                  onChange={(e) => {
                    setManualDestinationSite(e.target.value);
                    if (e.target.value.trim()) {
                      setDestinationSite("");
                    }
                  }}
                />
                {normalize(selectedLiveJob?.contract || "") === normalize("J & J Ward") ? null : (
                  <select
                    className="mt-1 h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm"
                    value={destinationSite}
                    onChange={(e) => {
                      setDestinationSite(e.target.value);
                      setManualDestinationSite("");
                    }}
                  >
                    <option value="">Select destination</option>
                    {destinationSites.map((s) => (
                      <option key={s} value={s}>
                        {getPortalSiteLabel(selectedContract, s)}
                      </option>
                    ))}
                  </select>
                )}
              </div>
              <div>
                <Label>Arrival Time</Label>
                <TimePicker value={completeArrivalTime} onChange={setCompleteArrivalTime} />
              </div>
              <div>
                <Label>Departure Time</Label>
                <TimePicker value={completeDepartureTime} onChange={setCompleteDepartureTime} />
              </div>
              <div className="md:col-span-2">
                <Label>Completion Date</Label>
                <div className="mt-1 flex gap-2">
                  <Input
                    type="date"
                    value={completionDate}
                    onChange={(e) => setCompletionDate(e.target.value)}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setCompletionDate(selectedDate)}
                    disabled={!selectedDate}
                  >
                    Same as Collection
                  </Button>
                </div>
              </div>
              <div className="md:col-span-2">
                <Label>Job Number</Label>
                <NumericKeypad
                  value={completeJobRef}
                  onChange={setCompleteJobRef}
                  label="Job Number"
                  placeholder="Enter completed job number"
                  extraAction={selectedLiveJob ? { label: "Same WJR", onClick: () => setCompleteJobRef(selectedLiveJob.jobRef || "") } : undefined}
                />
              </div>
              <div className="md:col-span-2">
                <Label>Destination Notes <span className="text-slate-400 font-normal">(optional)</span></Label>
                <textarea
                  className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400"
                  rows={3}
                  placeholder="Any notes about the destination site..."
                  value={destinationNotes}
                  onChange={(e) => setDestinationNotes(e.target.value)}
                />
              </div>
              <div className="md:col-span-2">
                <div className="flex gap-2">
                  <Button onClick={completeJob}>Complete Job</Button>
                  <Button variant="outline" onClick={() => setActiveDriverAction("home")}>Cancel</Button>
                </div>
              </div>
            </CardContent>
            </Card>
          </div>
        ) : null}

        {activeDriverAction === "fuel" ? (
          <div ref={fuelRef}>
            <Card className="border-0 shadow-xl">
            <CardHeader>
              <CardTitle>Fuel / AdBlue Entry</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 md:grid-cols-2">
              <div>
                <Label>Type</Label>
                <div className="mt-1 grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setFuelType("Diesel")}
                    className={`h-10 rounded-md border px-3 text-sm font-semibold transition ${
                      fuelType === "Diesel"
                        ? "border-amber-600 bg-amber-100 text-amber-900"
                        : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    Diesel
                  </button>
                  <button
                    type="button"
                    onClick={() => setFuelType("AdBlue")}
                    className={`h-10 rounded-md border px-3 text-sm font-semibold transition ${
                      fuelType === "AdBlue"
                        ? "border-sky-600 bg-sky-100 text-sky-900"
                        : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    AdBlue
                  </button>
                </div>
              </div>
              <div>
                <Label>Litres</Label>
                <NumericKeypad value={fuelLitres} onChange={setFuelLitres} label="Litres" allowDecimal placeholder="Enter litres" />
              </div>
              <div className="md:col-span-2">
                <div className="flex gap-2">
                  <Button onClick={saveFuel}>Save Fuel Entry</Button>
                  <Button variant="outline" onClick={() => setActiveDriverAction("home")}>Cancel</Button>
                </div>
              </div>
            </CardContent>
            </Card>
          </div>
        ) : null}

        {activeDriverAction === "mileage" ? (
          <div ref={mileageRef}>
            <Card className="border-0 shadow-xl">
            <CardHeader>
              <CardTitle>Daily Mileage</CardTitle>
              <CardDescription>
                Record mileage once per day. Opening is required at start of day. Closing can be added later.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 md:grid-cols-2">
              <div>
                <Label>Opening Mileage</Label>
                <NumericKeypad value={openingMileage} onChange={setOpeningMileage} label="Opening Mileage" placeholder="Insert opening mileage" />
              </div>
              <div>
                <Label>Closing Mileage</Label>
                <NumericKeypad value={closingMileage} onChange={setClosingMileage} label="Closing Mileage" placeholder="Insert closing mileage" />
              </div>
              <div className="md:col-span-2">
                <div className="flex gap-2">
                  <Button onClick={saveMileage}>Save Mileage</Button>
                  <Button
                    variant="outline"
                    onClick={() => setActiveDriverAction("home")}
                    disabled={mileageRequired}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </CardContent>
            </Card>
          </div>
        ) : null}

        {activeDriverAction === "report" ? (
          <div ref={reportRef}>
            <Card className="border-0 shadow-xl">
            <CardHeader>
              <CardTitle>Issue Report</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Input
                value={reportText}
                onChange={(e) => setReportText(e.target.value)}
                placeholder="Write issue details"
              />
              <div className="flex gap-2">
                <Button onClick={sendReport}>Submit Report</Button>
                <Button variant="outline" onClick={() => setActiveDriverAction("home")}>Cancel</Button>
              </div>
            </CardContent>
            </Card>
          </div>
        ) : null}

        {(liveJobsForUser.length > 0 || completedJobsForUser.length > 0) && (
          <Alert>
            <CheckCircle2 className="h-4 w-4 inline mr-2" />
            <AlertTitle>Portal Live</AlertTitle>
            <AlertDescription>
              You currently have {liveJobsForUser.length} live job(s) and {completedJobsForUser.length} completed job(s).
            </AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  );
}
