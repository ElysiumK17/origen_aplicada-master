import { NextRequest, NextResponse } from "next/server";
import { db } from '@/libs/db';

export async function GET(req: NextRequest) {
    try {
        const email = req.nextUrl.searchParams.get('email');

        if (!email || typeof email !== "string") {
            return NextResponse.json({ error: "Email no proporcionado o inválido" }, { status: 404 });
        }
        
        const user = await db.user.findUnique({
            where: { email:email },
            include:{
                patient:true
            }
        });


        if (!user) {
            return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
        }

        const reservation = await db.reservation.findMany({
            where: {
                patient_id: user.patient?.id,
            },
            include: {
                Appointment: {
                    include: {
                        Professional: {
                            include: {
                                User: true, // Cambiado para incluir todos los campos del usuario
                            },
                        },
                    },
                },
            },
        
            orderBy: {
                Appointment: {
                    date: "desc",
                },
            },
        });

        if (reservation.length === 0) {
            return NextResponse.json(
                { message: "No hay reservaciones de este paciente en la base de datos" },
                { status: 404 }
            );
        }

        return NextResponse.json(reservation);
    } catch (error) {
        console.error("Error en la API de appointments:", error);
        return NextResponse.json({ error: "Error Interno del Servidor" }, { status: 500 });
    }
}