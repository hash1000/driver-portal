import { prisma } from "@/lib/prisma";
import {
  DEFAULT_DRIVERS,
  INITIAL_CONTRACTS,
  INITIAL_REGS,
  INITIAL_SITES_BY_CONTRACT,
  normalizeSiteType,
  type PortalData,
} from "@/lib/portal-config";

export async function ensurePortalSeeded() {
  const userCount = await prisma.user.count();
  if (userCount > 0) {
    return;
  }

  await prisma.$transaction(async (transaction) => {
    await transaction.user.createMany({
      data: DEFAULT_DRIVERS.map((user) => ({
        id: user.id,
        username: user.username,
        password: user.password,
        name: user.name,
        role: user.role,
      })),
    });

    for (const contractName of INITIAL_CONTRACTS) {
      const contract = await transaction.contract.create({
        data: { name: contractName },
      });

      const sites = INITIAL_SITES_BY_CONTRACT[contractName] || [];
      if (sites.length > 0) {
        await transaction.site.createMany({
          data: sites.map((site) => ({
            name: site,
            contractId: contract.id,
          })),
        });
      }
    }
  });
}

export async function getPortalData(): Promise<PortalData> {
  await ensurePortalSeeded();

  const [users, contracts, activeJobs, semiCompletedJobs, completedJobs, fuelEntries, mileageEntries, issueReports] = await Promise.all([
    prisma.user.findMany({ orderBy: [{ role: "asc" }, { name: "asc" }] }),
    prisma.contract.findMany({ include: { sites: { orderBy: { name: "asc" } } }, orderBy: { name: "asc" } }),
    prisma.job.findMany({
      where: { status: "active" },
      include: { driver: true, contract: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.job.findMany({
      where: { status: "semi_completed" },
      include: { driver: true, contract: true },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.job.findMany({
      where: { status: "completed" },
      include: { driver: true, contract: true },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.fuelEntry.findMany({ include: { driver: true }, orderBy: { createdAt: "desc" } }),
    prisma.mileageEntry.findMany({ include: { driver: true }, orderBy: { date: "desc" } }),
    prisma.issueReport.findMany({ include: { driver: true, contract: true }, orderBy: { createdAt: "desc" } }),
  ]);

  return {
    users: users.map((user) => ({
      id: user.id,
      username: user.username,
      password: user.password,
      name: user.name,
      role: user.role,
    })),
    contracts: contracts.map((contract) => contract.name),
    vehicleRegs: INITIAL_REGS,
    sitesByContract: Object.fromEntries(
      contracts.map((contract) => [
        contract.name,
        contract.sites
          .filter((s) => normalizeSiteType((s as { siteType?: string }).siteType) !== "destination")
          .map((s) => s.name),
      ])
    ),
    destinationSitesByContract: Object.fromEntries(
      contracts.map((contract) => [
        contract.name,
        contract.sites
          .filter((s) => normalizeSiteType((s as { siteType?: string }).siteType) !== "collection")
          .map((s) => s.name),
      ])
    ),
    allSitesByContract: Object.fromEntries(
      contracts.map((contract) => [
        contract.name,
        contract.sites.map((s) => ({
          name: s.name,
          siteType: normalizeSiteType((s as { siteType?: string }).siteType),
        })),
      ])
    ),
    activeJobs: activeJobs.map((job) => ({
      id: job.id,
      contract: job.contract.name,
      reg: job.reg,
      date: job.date,
      collectionSite: job.collectionSite,
      destinationSite: job.destinationSite ?? undefined,
      jobRef: job.jobRef,
      arrivalTime: job.arrivalTime,
      exitTime: job.exitTime ?? undefined,
      completeArrivalTime: job.completeArrivalTime ?? undefined,
      completeDepartureTime: job.completeDepartureTime ?? undefined,
      completeJobRef: job.completeJobRef ?? undefined,
      notes: job.notes ?? undefined,
      collectionReference: (job as { collectionReference?: string | null }).collectionReference ?? undefined,
      costingType: ((job as { costingType?: "per_load" | "per_tonne" | null }).costingType ?? undefined),
      costingPrice: (job as { costingPrice?: string | null }).costingPrice ?? undefined,
      costingWeight: (job as { costingWeight?: string | null }).costingWeight ?? undefined,
      costingTotal: (job as { costingTotal?: string | null }).costingTotal ?? undefined,
      driverUsername: job.driver.username,
      driverName: job.driver.name,
    })),
    semiCompletedJobs: semiCompletedJobs.map((job) => ({
      id: job.id,
      contract: job.contract.name,
      reg: job.reg,
      date: job.date,
      completedDate: job.completedDate ?? undefined,
      collectionSite: job.collectionSite,
      destinationSite: job.destinationSite ?? undefined,
      jobRef: job.jobRef,
      arrivalTime: job.arrivalTime,
      exitTime: job.exitTime ?? undefined,
      completeArrivalTime: job.completeArrivalTime ?? undefined,
      completeDepartureTime: job.completeDepartureTime ?? undefined,
      completeJobRef: job.completeJobRef ?? undefined,
      collectionReference: (job as { collectionReference?: string | null }).collectionReference ?? undefined,
      costingType: ((job as { costingType?: "per_load" | "per_tonne" | null }).costingType ?? undefined),
      costingPrice: (job as { costingPrice?: string | null }).costingPrice ?? undefined,
      costingWeight: (job as { costingWeight?: string | null }).costingWeight ?? undefined,
      costingTotal: (job as { costingTotal?: string | null }).costingTotal ?? undefined,
      notes: job.notes ?? undefined,
      destinationNotes: (job as { destinationNotes?: string | null }).destinationNotes ?? undefined,
      driverUsername: job.driver.username,
      driverName: job.driver.name,
    })),
    completedJobs: completedJobs.map((job) => ({
      id: job.id,
      contract: job.contract.name,
      reg: job.reg,
      date: job.date,
      completedDate: job.completedDate ?? undefined,
      collectionSite: job.collectionSite,
      destinationSite: job.destinationSite ?? undefined,
      jobRef: job.jobRef,
      arrivalTime: job.arrivalTime,
      exitTime: job.exitTime ?? undefined,
      completeArrivalTime: job.completeArrivalTime ?? undefined,
      completeDepartureTime: job.completeDepartureTime ?? undefined,
      completeJobRef: job.completeJobRef ?? undefined,
      collectionReference: (job as { collectionReference?: string | null }).collectionReference ?? undefined,
      costingType: ((job as { costingType?: "per_load" | "per_tonne" | null }).costingType ?? undefined),
      costingPrice: (job as { costingPrice?: string | null }).costingPrice ?? undefined,
      costingWeight: (job as { costingWeight?: string | null }).costingWeight ?? undefined,
      costingTotal: (job as { costingTotal?: string | null }).costingTotal ?? undefined,
      notes: job.notes ?? undefined,
      destinationNotes: (job as { destinationNotes?: string | null }).destinationNotes ?? undefined,
      driverUsername: job.driver.username,
      driverName: job.driver.name,
    })),
    fuelEntries: fuelEntries.map((entry) => ({
      id: entry.id,
      type: entry.type,
      litres: entry.litres,
      reg: entry.reg,
      date: entry.date,
      driverUsername: entry.driver.username,
      driverName: entry.driver.name,
    })),
    mileageEntries: mileageEntries.map((entry) => ({
      id: entry.id,
      date: entry.date,
      reg: entry.reg,
      openingMileage: entry.openingMileage ?? undefined,
      closingMileage: entry.closingMileage ?? undefined,
      driverUsername: entry.driver.username,
      driverName: entry.driver.name,
    })),
    issueReports: issueReports.map((report) => ({
      id: report.id,
      text: report.text,
      driverUsername: report.driver.username,
      driverName: report.driver.name,
      reg: report.reg,
      contract: report.contract.name,
      date: report.date,
    })),
  };
}
