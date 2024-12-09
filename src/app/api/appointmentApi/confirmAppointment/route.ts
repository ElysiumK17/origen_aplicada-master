import { db } from "@/libs/db";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    
    if (!body) {
      return NextResponse.json(
        { error: "Request no válida" },
        { status: 400 }
      );
    }

    const {appointment_id, patient_id} = body.id

    const updateState = await db.appointment.update({
      where: {
        id: appointment_id,
      },
      data: {
        state: "realizado",
      },
    });

    console.log((await updateState).state)

    const reservationControl = db.reservation.update({
      where: { 
        appointment_id_patient_id: {
          patient_id,
          appointment_id,
        },
      },
      data:{
        state:"realizado"
      }
    })

    console.log(body.id)

    console.log((await reservationControl).state)

    return NextResponse.json(updateState, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Internal Error" },
      { status: 500 }
    );
  }
}

