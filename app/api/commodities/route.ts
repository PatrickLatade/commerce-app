import { PrismaClient } from "@/src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { NextResponse } from "next/server";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient ({adapter});

export async function GET() {
    const commodities = await prisma.commodity.findMany()
    return NextResponse.json (commodities);
}