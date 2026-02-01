import { NextResponse } from "next/server";
import { checkSetupConsistency } from "@/lib/settings";

export async function GET() {
  try {
    const status = await checkSetupConsistency();

    return NextResponse.json(status);
  } catch (error) {
    return NextResponse.json(
      { error: "Erreur lors de la vérification du setup" },
      { status: 500 }
    );
  }
}
