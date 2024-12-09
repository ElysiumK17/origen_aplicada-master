import { db } from "@/libs/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    try {
        const professional_id = req.nextUrl.searchParams.get("id");

        if (!professional_id) {
            return NextResponse.json(
                { error: "Professional ID not found" },
                { status: 400 }
            );
        }

        const professional = await db.professional.findUnique({
            where: {
                id: professional_id,
            },
        });

        if (!professional) {
            return NextResponse.json(
                { error: "Professional not found" },
                { status: 404 }
            );
        }

        const appointments = await db.appointment.findMany({
            where: {
                professional_id: professional.id,
            },
            orderBy: {
                date: "desc",
            },
        });

        return NextResponse.json(appointments, { status: 200 });
    } catch (error) {
        console.error("Error en la API de appointments:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
