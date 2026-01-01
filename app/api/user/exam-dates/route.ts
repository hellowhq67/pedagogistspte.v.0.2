import { NextRequest, NextResponse } from "next/server";
import { getUserExamDates, createUserExamDate } from "@/lib/db/queries";
import { requireAuth } from "@/lib/api";

/**
 * Retrieve scheduled exam dates for the authenticated user.
 */
export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth();
    const examDates = await getUserExamDates(session.userId);
    return NextResponse.json({ examDates });
  } catch (error) {
    console.error("Error fetching exam dates:", error);
    return NextResponse.json(
      { error: "Failed to fetch exam dates" },
      { status: 500 }
    );
  }
}

/**
 * Create a new scheduled exam date for the authenticated user.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const session = await requireAuth();

    if (!body?.date) {
      return NextResponse.json({ error: 'Missing exam date' }, { status: 400 });
    }

    const newExamDate = await createUserExamDate(session.userId, {
      examDate: body.date,
      examName: body.examName,
      isPrimary: body.isPrimary,
    });
    return NextResponse.json({ success: true, examDate: newExamDate });
  } catch (error) {
    console.error("Error creating exam date:", error);
    const status = error instanceof Error && (error as any).status
      ? (error as any).status
      : error instanceof Error && error.message && error.message.includes('past')
      ? 400
      : 500;

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create exam date" },
      { status }
    );
  }
}
