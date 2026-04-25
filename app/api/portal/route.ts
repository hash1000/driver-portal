import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getPortalData } from "@/lib/portal-server";
import { normalize, normalizeSiteType } from "@/lib/portal-config";

async function findContractByName(name: string) {
  const contracts = await prisma.contract.findMany();
  return contracts.find((contract) => normalize(contract.name) === normalize(name));
}

function getSiteTypeFromBody(value: unknown) {
  return normalizeSiteType(String(value || "both"));
}

export async function GET() {
  try {
    const data = await getPortalData();
    return NextResponse.json(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load portal data.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const action = body.action;

    switch (action) {
      case "createJob": {
        const contract = await findContractByName(String(body.contract || ""));
        const driver = await prisma.user.findUnique({ where: { id: String(body.driverId || "") } });
        if (!contract || !driver) {
          return NextResponse.json({ error: "Contract or driver not found." }, { status: 400 });
        }

        await prisma.job.create({
          data: {
            status: "active",
            contractId: contract.id,
            reg: String(body.reg || ""),
            date: String(body.date || ""),
            collectionSite: String(body.collectionSite || ""),
            jobRef: String(body.jobRef || ""),
            arrivalTime: String(body.arrivalTime || ""),
            exitTime: body.exitTime ? String(body.exitTime) : null,
            notes: body.notes ? String(body.notes) : null,
            driverId: driver.id,
          },
        });
        break;
      }
      case "completeJob": {
        const jobId = String(body.jobId || "");
        const foundJob = await prisma.job.findUnique({ where: { id: jobId }, include: { contract: true } });
        if (!foundJob) {
          return NextResponse.json({ error: "Live job not found." }, { status: 404 });
        }

        const isJJWard = normalize(foundJob.contract.name) === normalize("J & J Ward");
        await prisma.job.update({
          where: { id: jobId },
          data: {
            status: isJJWard ? "semi_completed" : "completed",
            completedDate: String(body.completedDate || ""),
            destinationSite: String(body.destinationSite || ""),
            completeArrivalTime: String(body.completeArrivalTime || ""),
            completeDepartureTime: String(body.completeDepartureTime || ""),
            completeJobRef: String(body.completeJobRef || ""),
            destinationNotes: String(body.destinationNotes || ""),
          },
        });
        break;
      }
      case "finalizeSemiCompletedJob": {
        const jobId = String(body.jobId || "");
        const costingType = String(body.costingType || "");
        const costingPrice = String(body.costingPrice || "").trim();
        const costingWeight = String(body.costingWeight || "").trim();
        const collectionReference = String(body.collectionReference || "").trim();

        if (!jobId) {
          return NextResponse.json({ error: "Job ID is required." }, { status: 400 });
        }
        if (costingType !== "per_load" && costingType !== "per_tonne") {
          return NextResponse.json({ error: "Costing type must be Per Load or Per Tonne." }, { status: 400 });
        }

        const priceNumber = Number(costingPrice);
        if (!Number.isFinite(priceNumber) || priceNumber <= 0) {
          return NextResponse.json({ error: "Costing price is required." }, { status: 400 });
        }

        let weightNumber: number | null = null;
        if (costingType === "per_tonne") {
          weightNumber = Number(costingWeight);
          if (!Number.isFinite(weightNumber) || weightNumber <= 0) {
            return NextResponse.json({ error: "Weight is required for Per Tonne costing." }, { status: 400 });
          }
        }

        const total = costingType === "per_tonne" ? priceNumber * (weightNumber || 0) : priceNumber;
        await prisma.job.update({
          where: { id: jobId },
          data: {
            status: "completed",
            collectionReference: collectionReference || null,
            costingType,
            costingPrice: String(priceNumber),
            costingWeight: weightNumber === null ? null : String(weightNumber),
            costingTotal: String(total),
          },
        });
        break;
      }
      case "deleteJob": {
        await prisma.job.delete({ where: { id: String(body.jobId || "") } });
        break;
      }
      case "updateJob": {
        const jobId = String(body.jobId || "");
        const updateData: Record<string, unknown> = {};
        if (body.jobRef !== undefined) updateData.jobRef = String(body.jobRef || "");
        if (body.arrivalTime !== undefined) updateData.arrivalTime = String(body.arrivalTime || "");
        if (body.exitTime !== undefined) updateData.exitTime = String(body.exitTime || "");
        if (body.collectionSite !== undefined) updateData.collectionSite = String(body.collectionSite || "");
        if (body.notes !== undefined) updateData.notes = String(body.notes || "");
        if (body.destinationSite !== undefined) updateData.destinationSite = String(body.destinationSite || "");
        if (body.completeArrivalTime !== undefined) updateData.completeArrivalTime = String(body.completeArrivalTime || "");
        if (body.completeDepartureTime !== undefined) updateData.completeDepartureTime = String(body.completeDepartureTime || "");
        if (body.completedDate !== undefined) updateData.completedDate = String(body.completedDate || "");
        if (body.completeJobRef !== undefined) updateData.completeJobRef = String(body.completeJobRef || "");
        if (body.collectionReference !== undefined) updateData.collectionReference = String(body.collectionReference || "");
        if (body.costingType !== undefined) updateData.costingType = String(body.costingType || "");
        if (body.costingPrice !== undefined) updateData.costingPrice = String(body.costingPrice || "");
        if (body.costingWeight !== undefined) updateData.costingWeight = String(body.costingWeight || "");
        if (body.costingTotal !== undefined) updateData.costingTotal = String(body.costingTotal || "");
        if (body.destinationNotes !== undefined) updateData.destinationNotes = String(body.destinationNotes || "");
        await prisma.job.update({ where: { id: jobId }, data: updateData });
        break;
      }
      case "saveFuel": {
        const driver = await prisma.user.findUnique({ where: { id: String(body.driverId || "") } });
        if (!driver) {
          return NextResponse.json({ error: "Driver not found." }, { status: 400 });
        }
        await prisma.fuelEntry.create({
          data: {
            type: String(body.type || ""),
            litres: String(body.litres || ""),
            reg: String(body.reg || ""),
            date: String(body.date || ""),
            driverId: driver.id,
          },
        });
        break;
      }
      case "saveMileage": {
        const driver = await prisma.user.findUnique({ where: { id: String(body.driverId || "") } });
        if (!driver) {
          return NextResponse.json({ error: "Driver not found." }, { status: 400 });
        }

        const date = String(body.date || "").trim();
        if (!date) {
          return NextResponse.json({ error: "Date is required." }, { status: 400 });
        }

        const openingMileage = String(body.openingMileage || "").trim();
        const closingMileage = String(body.closingMileage || "").trim();
        if (!openingMileage && !closingMileage) {
          return NextResponse.json({ error: "Opening or closing mileage is required." }, { status: 400 });
        }

        await prisma.mileageEntry.upsert({
          where: { driverId_date: { driverId: driver.id, date } },
          create: {
            date,
            reg: String(body.reg || ""),
            openingMileage: openingMileage || null,
            closingMileage: closingMileage || null,
            driverId: driver.id,
          },
          update: {
            reg: String(body.reg || ""),
            openingMileage: openingMileage || null,
            closingMileage: closingMileage || null,
          },
        });
        break;
      }
      case "deleteFuelEntry": {
        await prisma.fuelEntry.delete({ where: { id: String(body.fuelEntryId || "") } });
        break;
      }
      case "deleteMileageEntry": {
        await prisma.mileageEntry.delete({ where: { id: String(body.mileageEntryId || "") } });
        break;
      }
      case "sendReport": {
        const driver = await prisma.user.findUnique({ where: { id: String(body.driverId || "") } });
        const contract = await findContractByName(String(body.contract || ""));
        if (!driver || !contract) {
          return NextResponse.json({ error: "Driver or contract not found." }, { status: 400 });
        }
        await prisma.issueReport.create({
          data: {
            text: String(body.text || ""),
            reg: String(body.reg || ""),
            date: String(body.date || ""),
            driverId: driver.id,
            contractId: contract.id,
          },
        });
        break;
      }
      case "deleteReport": {
        await prisma.issueReport.delete({ where: { id: String(body.reportId || "") } });
        break;
      }
      case "resetWeek": {
        await prisma.job.deleteMany({ where: { OR: [{ status: "completed" }, { status: "semi_completed" }] } });
        await prisma.fuelEntry.deleteMany({});
        await prisma.mileageEntry.deleteMany({});
        await prisma.issueReport.deleteMany({});
        break;
      }
      case "addDriver": {
        const users = await prisma.user.findMany();
        const duplicate = users.some((user) => normalize(user.username) === normalize(String(body.username || "")));
        if (duplicate) {
          return NextResponse.json({ error: "Username already exists." }, { status: 400 });
        }
        const requestedRole = normalize(String(body.role || "driver"));
        const role = requestedRole === "admin" ? "admin" : "driver";
        await prisma.user.create({
          data: {
            username: String(body.username || ""),
            password: String(body.password || ""),
            name: String(body.name || ""),
            role,
          },
        });
        break;
      }
      case "updateDriver": {
        const users = await prisma.user.findMany();
        const field = String(body.field || "");
        const value = String(body.value || "");
        if (field === "username") {
          const duplicate = users.some(
            (user) => user.id !== String(body.id || "") && normalize(user.username) === normalize(value),
          );
          if (duplicate) {
            return NextResponse.json({ error: "Username already exists." }, { status: 400 });
          }
        }
        await prisma.user.update({
          where: { id: String(body.id || "") },
          data: { [field]: value },
        });
        break;
      }
      case "removeDriver": {
        const driverId = String(body.id || "");
        if (!driverId) {
          return NextResponse.json({ error: "Driver ID is required." }, { status: 400 });
        }

        const driver = await prisma.user.findUnique({ where: { id: driverId } });
        if (!driver) {
          return NextResponse.json({ error: "Driver not found." }, { status: 404 });
        }
        if (driver.role === "admin") {
          return NextResponse.json({ error: "Admin users cannot be removed." }, { status: 400 });
        }

        await prisma.$transaction(async (tx) => {
          await tx.issueReport.deleteMany({ where: { driverId } });
          await tx.fuelEntry.deleteMany({ where: { driverId } });
          await tx.job.deleteMany({ where: { OR: [{ driverId }, { completedDriverId: driverId }] } });
          await tx.mileageEntry.deleteMany({ where: { driverId } });
          await tx.user.delete({ where: { id: driverId } });
        });
        break;
      }
      case "addContract": {
        await prisma.contract.create({ data: { name: String(body.name || "") } });
        break;
      }
      case "removeContract": {
        const contract = await findContractByName(String(body.name || ""));
        if (!contract) {
          return NextResponse.json({ error: "Contract not found." }, { status: 404 });
        }
        await prisma.contract.delete({ where: { id: contract.id } });
        break;
      }
      case "addSite": {
        const contract = await findContractByName(String(body.contract || ""));
        if (!contract) {
          return NextResponse.json({ error: "Contract not found." }, { status: 404 });
        }
        await prisma.site.create({
          data: {
            name: String(body.site || ""),
            siteType: getSiteTypeFromBody(body.siteType),
            contractId: contract.id,
          },
        });
        break;
      }
      case "updateSiteType": {
        const contract = await findContractByName(String(body.contract || ""));
        if (!contract) {
          return NextResponse.json({ error: "Contract not found." }, { status: 404 });
        }
        const allSites = await prisma.site.findMany({ where: { contractId: contract.id }, orderBy: { name: "asc" } });
        const site = allSites[Number(body.index ?? 0)];
        if (!site) {
          return NextResponse.json({ error: "Site not found." }, { status: 404 });
        }
        await prisma.site.update({ where: { id: site.id }, data: { siteType: getSiteTypeFromBody(body.siteType) } });
        break;
      }
      case "renameSite": {
        const contract = await findContractByName(String(body.contract || ""));
        if (!contract) {
          return NextResponse.json({ error: "Contract not found." }, { status: 404 });
        }
        const sites = await prisma.site.findMany({ where: { contractId: contract.id }, orderBy: { name: "asc" } });
        const site = sites[Number(body.index || 0)];
        if (!site) {
          return NextResponse.json({ error: "Site not found." }, { status: 404 });
        }
        await prisma.site.update({ where: { id: site.id }, data: { name: String(body.value || "") } });
        break;
      }
      case "removeSite": {
        const contract = await findContractByName(String(body.contract || ""));
        if (!contract) {
          return NextResponse.json({ error: "Contract not found." }, { status: 404 });
        }
        const sites = await prisma.site.findMany({ where: { contractId: contract.id }, orderBy: { name: "asc" } });
        const site = sites[Number(body.index || 0)];
        if (!site) {
          return NextResponse.json({ error: "Site not found." }, { status: 404 });
        }
        await prisma.site.delete({ where: { id: site.id } });
        break;
      }
      default:
        return NextResponse.json({ error: "Unsupported action." }, { status: 400 });
    }

    const data = await getPortalData();
    return NextResponse.json(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Request failed.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
