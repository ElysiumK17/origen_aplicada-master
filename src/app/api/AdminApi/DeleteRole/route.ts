import { db } from "@/libs/db";
import { NextResponse, NextRequest } from "next/server";

export async function PUT(req: NextRequest) {
    try {
        const body = await req.json();

        if (!body.id || !body.deleteRole) {
            return NextResponse.json(
                { error: "Request body must contain 'email' and 'deleteRole'" },
                { status: 400 }
            );
        }

        const { id, deleteRole } = body;

        const user = await db.user.findUnique({
            where: { id },
            select: {
                id: true,
                patient: true,
                professional: true,
                state: true,
            },
        });

        if (!user) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            );
        }

        if (deleteRole === "patient" && user.patient) {
            // Desactivar el rol de paciente
            await db.patients.update({
                where: { userId: user.id },
                data: { state: false },
            });

            // Si no tiene otro rol activo, desactivar el usuario
            if (!user.professional) {
                await db.user.update({
                    where: { id: user.id },
                    data: { state: false },
                });
            }
        } else if (deleteRole === "professional" && user.professional) {
            // Desactivar el rol de profesional
            await db.professional.update({
                where: { userId: user.id },
                data: { state: false },
            });

            // Si no tiene otro rol activo, desactivar el usuario
            if (!user.patient) {
                await db.user.update({
                    where: { id: user.id },
                    data: { state: false },
                });
            }
        } else {
            return NextResponse.json(
                { error: `Role '${deleteRole}' not found for user` },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { message: "Role state updated successfully" },
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
