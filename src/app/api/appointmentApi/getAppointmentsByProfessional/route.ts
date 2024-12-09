import { NextRequest, NextResponse } from "next/server";
import { db } from "@/libs/db";

export async function GET(req:NextRequest) {
    try{
        const data = req.nextUrl.searchParams.get('id')

        if(!data || typeof data !== "string"){
            return NextResponse.json({error:"Professional ID is required"}, {status:400})
        }

        const appointments = await db.appointment.findMany({
            where:{
                professional_id:data,
            }
        })

        if (appointments.length === 0) {
            return NextResponse.json({ error: "There are no appointments available for this professional" });
        }

        return NextResponse.json(appointments)

    }catch(error){
        console.error("Error appointmen api", error)
        return NextResponse.json({error:"Internal Server Error"}, {status:500})
    }
}