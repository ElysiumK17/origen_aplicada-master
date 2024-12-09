import { NextResponse } from "next/server";
import { db } from "@/libs/db";

// Define el tipo para los turnos
type Turno = {
  date: string;
  hours: { hour: string, id: string }[]; // Cada hora ahora incluye el id
};

// Define el tipo para las especialidades, profesionales y turnos
type Profesional = {
  id: string;
  name: string | null;
  email: string | null;
  availableTurns: Turno[];
  photo: string | null;
};

type Especialidad = {
  specialty: string;
  professionals: Profesional[];
};

export async function GET() {
  try {
    // Consulta para obtener profesionales, especialidades y turnos disponibles
    const profesionales = await db.professional.findMany({
      include: {
        User: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        Appointments: {
          where: {
            state: "disponible", // Filtrar solo turnos disponibles
          },
          select: {
            id: true,
            date: true,
            hour: true,
          },
        },
      },
    });

    // Utilizamos un Map para mejorar la eficiencia en la búsqueda de especialidades
    const especialidadesMap = new Map<string, Especialidad>();

    profesionales.forEach((prof) => {
      const { specialty, User, Appointments, photo } = prof;
      
      // Validar que el usuario asociado al profesional existe
      if (!User) {
        console.warn(`Profesional sin usuario asociado: ${prof.id}`);
        return; // Saltar si no hay usuario
      }

      // Agrupar los turnos disponibles por fecha
      const availableTurns = Appointments.reduce((turnAcc: Turno[], appointment) => {
        const dateStr = new Date(appointment.date).toISOString().split("T")[0]; // Formato yyyy-MM-dd
        const existingTurn = turnAcc.find((turn) => turn.date === dateStr);

        if (existingTurn) {
          // Evitar duplicados en la lista de horarios, agregamos el id junto con la hora
          if (!existingTurn.hours.some(hour => hour.hour === appointment.hour)) {
            existingTurn.hours.push({ hour: appointment.hour, id: appointment.id });
          }
        } else {
          turnAcc.push({
            date: dateStr,
            hours: [{ hour: appointment.hour, id: appointment.id }],
          });
        }

        return turnAcc;
      }, []);

      // Si la especialidad ya existe, agregamos el profesional
      if (especialidadesMap.has(specialty)) {
        especialidadesMap.get(specialty)?.professionals.push({
          id: User.id,
          name: User.name,
          email: User.email,
          photo,
          availableTurns,
        });
      } else {
        // Si no existe, creamos una nueva entrada
        especialidadesMap.set(specialty, {
          specialty,
          professionals: [
            {
              id: User.id,
              name: User.name,
              email: User.email,
              photo, 
              availableTurns,
            },
          ],
        });
      }
    });

    // Convertir el Map a un array
    const especialidades = Array.from(especialidadesMap.values());

    // Responder con las especialidades agrupadas y turnos
    return NextResponse.json(especialidades);
  } catch (error) {
    console.error("Error al obtener profesionales:", error);
    return NextResponse.json(
      { error: `Error al obtener profesionales y turnos: ${error}` },
      { status: 500 }
    );
  }
}
