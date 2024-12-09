import { NextRequest, NextResponse } from "next/server";
import { db } from "@/libs/db";
import { number } from "zod";

export async function GET(req: NextRequest) {
  try {
    // Obtiene el email de los parámetros de la query
    const email = req.nextUrl.searchParams.get("email");

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { error: "Email no proporcionado o inválido" },
        { status: 400 }
      );
    }

    // Busca al usuario por email y verifica que sea un profesional
    const user = await db.user.findUnique({
      where: { email },
      include: { professional: true }, // Incluye la relación con 'Professional'
    });

    if (!user || !user.professional) {
      return NextResponse.json(
        { error: "Usuario no encontrado o no es un profesional" },
        { status: 404 }
      );
    }

    // Obtiene los turnos asociados al profesional
    const appointments = await db.appointment.findMany({
      where: { professional_id: user.professional.id},
      select: {
        id:true,
        date: true,
        hour: true,
        state: true,
        Reservations: {
          select: {
            Patient: {
              select: {
                id:true,
                User: {
                  select: {
                    name: true,
                    phone_number: true,
                    lastName: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (appointments.length === 0) {
      return NextResponse.json(
        { message: "No hay turnos asignados para este profesional" },
        { status: 404 }
      );
    }

    // Formatea los datos para la respuesta
    const formattedAppointments = appointments.map((appointment) => ({
      id:appointment.id,
      date: appointment.date,
      hour: appointment.hour,
      state: appointment.state,
    
      patient_id: appointment.Reservations.length > 0
      ? `${appointment.Reservations[0].Patient.id}`
      : "No patient assigned",

      patientName: appointment.Reservations.length > 0
        ? `${appointment.Reservations[0].Patient.User.name} ${appointment.Reservations[0].Patient.User.lastName}`
        : "No patient assigned",
      
        patientPhone: appointment.Reservations.length > 0
        ? appointment.Reservations[0].Patient.User.phone_number
        : "No phone assigned",
    
    }));

    // Devuelve los turnos formateados
    return NextResponse.json(formattedAppointments);
  } catch (error) {
    console.error("Error en la API de appointments:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
