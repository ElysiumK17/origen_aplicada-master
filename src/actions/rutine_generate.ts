'use server';
import { db } from "@/libs/db";
import { rule } from "postcss";
// Definimos los tipos
type Intervalo = {
  inicio: Date;
  fin: Date;
};

 export type DiaLaborable = {
  fecha: Date;
  intervalos: Intervalo[];
  emmailPrefessional: string
};

export async function RutineGenerate(
    inicio: Date,
    fin: Date,
    intervaloMinutos: number,
    horaInicio: number,
    horaFin: number,
    diasPermitidos: number[], // Agregar días permitidos como argumento
    email:string
  ): Promise<DiaLaborable[]> {
    const diasLaborables: DiaLaborable[] = [];
    const fechaActual = new Date(inicio);
  
    while (fechaActual <= fin) {
      const diaSemana = fechaActual.getDay(); // 0 = domingo, 1 = lunes, ..., 6 = sábado
  
      // Filtrar solo los días que están en el array `diasPermitidos`
      if (diasPermitidos.includes(diaSemana)) {
        const intervalos: Intervalo[] = [];
        const inicioDia = new Date(fechaActual);
        inicioDia.setHours(horaInicio, 0, 0, 0);
  
        const finDia = new Date(fechaActual);
        finDia.setHours(horaFin, 0, 0, 0);
  
        let horaActual = new Date(inicioDia);
        while (horaActual < finDia) {
          const siguienteHora = new Date(horaActual);
          siguienteHora.setMinutes(horaActual.getMinutes() + intervaloMinutos);
  
          if (siguienteHora <= finDia) {
            intervalos.push({
              inicio: new Date(horaActual),
              fin: new Date(siguienteHora),
            });
          }
  
          horaActual = siguienteHora;
        }
  
        diasLaborables.push({
          fecha: new Date(fechaActual),
          intervalos,
          emmailPrefessional: email
        });
      }
  
      fechaActual.setDate(fechaActual.getDate() + 1);
    }

    const rest = insertAppointment(diasLaborables)

    return diasLaborables
}

export async function insertAppointment(diaLaborables: DiaLaborable[]) {
    try {
      const data = diaLaborables[0];
      const emailProfessional = data.emmailPrefessional; 
  
      // Buscar al usuario por el email
      const user = await db.user.findUnique({
        where: { email: emailProfessional },
        include: {
          professional: true,  
        },
      });
  
      if (!user) {
        throw new Error(`No se encontró el usuario con el email ${emailProfessional}`);
      }
  
      const professionalId = user.professional?.id; 
  
      if (!professionalId) {
        throw new Error('El profesional no tiene un id asociado');
      }
  
      const turnos = diaLaborables.flatMap((dia) => {
        return dia.intervalos.map((intervalo) => ({
          date: dia.fecha,
          hour: `${intervalo.inicio.getHours()}:${intervalo.inicio.getMinutes()}`,
          state: 'disponible', // queda asi por defecto
          professional_id: professionalId,  
        }));
      });
  
      // Insertar los turnos en la base de datos
      const result = await db.appointment.createMany({
        data: turnos,
        // skipDuplicates: true, // Opcional, omite duplicados si es necesario
      });

      console.log(result)
      console.log(`Se insertaron ${result.count} turnos`);
  
      return result;
    } catch (error) {
      console.error("Error al insertar los turnos:", error);
      throw new Error("No se pudieron insertar los turnos");
    }
  }