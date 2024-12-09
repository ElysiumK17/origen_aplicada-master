import { NextResponse, NextRequest } from "next/server";
import { db } from "@/libs/db";

export async function POST(req:NextRequest, res:NextResponse) {
    try{
        const data = await req.json()

        // Check data
        if(!data){
            return NextResponse.json({error: "Missing required fields"},{status:400})
        }

        const createAppointment = db.appointment.create({
            data:{
                date:data.date,
                hour:data.date, 
                state: data.state,
                professional_id: data.professional_id
            }
        })

        return NextResponse.json({message:"Creacion exitosa"})

    }catch(error){
        console.error('Error appointment api', error)
        return new NextResponse("Internal Server Error",{status:500}) 
    }
    
}