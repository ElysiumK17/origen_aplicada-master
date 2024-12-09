import { db } from "@/libs/db";
import { NextResponse, NextRequest } from "next/server";

export async function PUT(req: NextRequest) {
    try {
        const body = await req.json();

        if (!body || !body.email) {
            return NextResponse.json(
                { error: "Request body must contain 'email'" },
                { status: 400 }
            );
        }

        const { email } = body;

        const updateState = await db.user.update({
            where: { email },
            data: { state: false },
            select:{
                id:true
            }
        });

        const id = updateState.id
        const updateStatePatient = await db.patients.update({
            where: { userId: id },
            data: { state: false },
        });

        const updateStateProfessional = await db.professional.update({
            where: { userId:id },
            data: { state: false },
        }); 

        return NextResponse.json(
            { message: "User state updated successfully", user: updateState },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error updating user state:", error);

        return NextResponse.json(
            { error: "Failed to update user state" },
            { status: 500 }
        );
    }
}
