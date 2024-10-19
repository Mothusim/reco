import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../auth/[...nextauth]/route";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "OWNER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = params;

  try {
    const updatedRequest = await prisma.recommendationRequest.update({
      where: { id },
      data: { status: "APPROVED" },
    });

    return NextResponse.json(updatedRequest);
  } catch (error) {
    console.error("Error approving recommendation request:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}