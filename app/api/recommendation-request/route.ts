import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { name, idNumber, email } = await req.json();

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (user.idNumber !== idNumber || user.email !== email) {
      return NextResponse.json({ error: "Invalid user details" }, { status: 400 });
    }

    const existingRequest = await prisma.recommendationRequest.findFirst({
      where: {
        userId: user.id,
        status: "PENDING",
      },
    });

    if (existingRequest) {
      return NextResponse.json({ error: "A pending request already exists" }, { status: 400 });
    }

    const newRequest = await prisma.recommendationRequest.create({
      data: {
        userId: user.id,
      },
    });

    return NextResponse.json(newRequest, { status: 201 });
  } catch (error) {
    console.error("Error creating recommendation request:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}