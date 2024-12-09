import { NextResponse } from "next/server";
import { db } from "@/libs/db";

export async function PUT(req: Request) {
  try {
    const body = await req.json();

    console.log(body);
    // Extraer `patient_id` y `appointment_id` desde `body.id`
    const { patient_id, appointment_id } = body.id;
    console.log(appointment_id);
    console.log(patient_id);

    if (!appointment_id || !patient_id) {
      return NextResponse.json(
        { error: "Los IDs de la reserva y del paciente son requeridos" },
        { status: 400 }
      );
    }

    // Actualizar el estado de la reserva a "cancelado"
    const reservation = await db.reservation.update({
      where: { 
        appointment_id_patient_id: {
          patient_id,
          appointment_id,
        },
      },
      data: { state: "cancelado" },
    });

    if (!reservation) {
      return NextResponse.json(
        { error: "No se encontró la reserva" },
        { status: 404 }
      );
    }

    // Marcar el turno asociado como "Disponible"
    await db.appointment.update({
      where: { id: reservation.appointment_id },
      data: { state: "disponible" },
    });

    return NextResponse.json(
      { message: "Turno cancelado exitosamente" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error al cancelar el turno:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
