import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "OWNER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const requests = await prisma.recommendationRequest.findMany({
      where: {
        status: "PENDING",
        user: {
          companyId: session.user.companyId,
        },
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            idNumber: true,
          },
        },
      },
    });

    return NextResponse.json(requests);
  } catch (error) {
    console.error("Error fetching recommendation requests:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}