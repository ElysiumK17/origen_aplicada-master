import { NextResponse, NextRequest } from "next/server";
import { db } from "@/libs/db";

// - Datos requeridos por parte del data
// - mail del paciente
// - Id del turno 
// - Date, osea la fecha, si bien en teoria esto ya esta en le turno con el que esta relacionado, sirve mas por tema de 
//   practicidad para mostrar en el dashboard del paciente
// - El estado se pone automaticamente como pendiente, hasta que la reservacion sea cancelada o el profesional la marque 
//   como realizada.


export  async function POST(req: NextRequest) {
    try {
        const data = await req.json();

        // Validar que los datos requeridos estén presentes
        const { email, date , appointment_id} = data;
        if (!email || !date || appointment_id) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Buscar usuario por correo y despues con eso buscamos el usuario en la tabla paciente
        const user = await db.user.findFirst({
            where: { email },
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const patient = await db.patients.findUnique({
            where: { userId: user.id },
        });

        if (!patient) {
            return NextResponse.json({ error: 'Patient not found' }, { status: 404 });
        }

        // Crear reservación
        const createdReservation = await db.reservation.create({
            data: {
                date,
                state: 'pendiente',
                patient_id: patient.id,
                appointment_id: data.appointment_id
            },
        });

        return NextResponse.json({ reservation: createdReservation }, { status: 201 });

    } catch (error) {
        console.error('Error creating reservation:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}