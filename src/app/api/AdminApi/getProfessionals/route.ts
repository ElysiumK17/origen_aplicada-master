import { db } from "@/libs/db";
import { error } from "console";
import { NextRequest, NextResponse } from "next/server";


export async function GET() {
    //const body = req.nextUrl.searchParams.get()
    try {
        const professionals = await db.professional.findMany({
            include: {
                User: {
                    select: {
                        id:true,
                        name: true,
                        lastName: true,
                        state: true,
                        email: true,
                        phone_number: true,
                    },
                },
            },
        });
    
        console.log("Professionals:", professionals); // <-- Aquí inspeccionas qué está devolviendo
        if (!professionals || professionals.length === 0) {
            return NextResponse.json({ error: "Professionals not found" }, { status: 400 });
        }
    
        return NextResponse.json(professionals);
    } catch (error) {
        console.error("Error en la API de appointments:", error);
        return NextResponse.json({ error: "Error Interno del Servidor" }, { status: 500 });
    }    
    
}