import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;

  // fetch report from DB
  const report = { id, title: "Sample Report", data: [1, 2, 3] };

  return NextResponse.json(report);
}
