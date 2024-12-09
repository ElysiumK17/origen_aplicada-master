import { NextRequest,NextResponse } from "next/server";
import { db } from "@/libs/db";

export async function GET(req:NextRequest) {
    try{
        const data = req.nextUrl.searchParams.get('specialty')

        if (!data || typeof data !== "string"){
            return NextResponse.json({error:"Error when selecting specialty  "})
        }

        const professinals = await db.professional.findMany({
            where:{specialty: data}
        })

        if(professinals.length === 0){
            return NextResponse.json({message:"Actualmente no hay profesionales con esta especialidad"})
        }

        return NextResponse.json(professinals)
    }catch(error){
        console.error("Error en la API de appointments:", error)
        return NextResponse.json({error: "Internal Server Error"}, {status:500})
    }
}