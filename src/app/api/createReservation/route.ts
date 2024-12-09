import { NextResponse } from "next/server";
import { db } from "@/libs/db";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { appointment_id, email, date, state } = body;

    // Validar que todos los datos estén presentes
    if (!appointment_id || !email || !date || !state) {
      console.error("Datos faltantes:", { appointment_id, email, date, state });
      return NextResponse.json(
        { error: "Faltan datos requeridos para crear la reserva." },
        { status: 400 }
      );
    }

    // Validar formato de correo
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "El formato del correo electrónico no es válido." },
        { status: 400 }
      );
    }

    // Validar que la fecha sea válida
    const appointmentDate = new Date(date);
    if (isNaN(appointmentDate.getTime())) {
      return NextResponse.json(
        { error: "El formato de la fecha no es válido." },
        { status: 400 }
      );
    }

    // Verificar que el turno (appointment_id) exista
    const appointment = await db.appointment.findUnique({
      where: { id: appointment_id },
    });

    if (!appointment) {
      return NextResponse.json(
        { error: "El turno especificado no existe." },
        { status: 404 }
      );
    }

    const updateState = db.appointment.update(
      {
        where:{id:appointment.id},
        data:{
          state:"pendiente"
        }
      }
    )

    console.log("turno cambiado a pendiente: "+(await updateState).state)

    // Verificar que el usuario exista
    const user = await db.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        { error: "El usuario especificado no existe." },
        { status: 404 }
      );
    }

    // Verificar que el paciente exista
    const patient = await db.patients.findUnique({
      where: { userId: user.id },
    });

    if (!patient) {
      return NextResponse.json(
        { error: "El paciente especificado no existe." },
        { status: 404 }
      );
    }

    // Crear la reserva
    const newReservation = await db.reservation.create({
      data: {
        appointment_id,
        patient_id: patient.id,
        date: appointmentDate,
        state,
      },
    });

    console.log("Reserva creada:", newReservation);
    return NextResponse.json({ success: true, reservation: newReservation });
  } catch (error) {
    console.error("Error al crear la reserva:", error);
    return NextResponse.json(
      { error: "Error interno al crear la reserva." },
      { status: 500 }
    );
  }
}
