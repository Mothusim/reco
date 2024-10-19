import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import { PrismaClient } from "@prisma/client";
import { jsPDF } from "jspdf";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "OWNER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { userId, requestId, recipientName, recipientTitle, content } = await req.json();

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const request = await prisma.recommendationRequest.findUnique({
      where: { id: requestId },
    });

    if (!request || request.status !== "APPROVED") {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    // Generate PDF
    const doc = new jsPDF();
    doc.setFontSize(12);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 20);
    doc.text(`To: ${recipientName}`, 20, 30);
    doc.text(`${recipientTitle}`, 20, 40);
    doc.text("Subject: Letter of Recommendation", 20, 60);
    doc.text(content, 20, 80, { maxWidth: 170 });
    doc.text("Sincerely,", 20, 250);
    doc.text(session.user.name, 20, 260);

    const pdfContent = doc.output("datauristring");

    const letter = await prisma.recommendationLetter.create({
      data: {
        userId,
        content: pdfContent,
      },
    });

    await prisma.recommendationRequest.update({
      where: { id: requestId },
      data: { status: "APPROVED" },
    });

    return NextResponse.json(letter, { status: 201 });
  } catch (error) {
    console.error("Error generating recommendation letter:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}