import { db } from "@/libs/db";
import { NextResponse, NextRequest } from "next/server";

export async function PUT(req: NextRequest) {
    try {
        const body = await req.json();

        if (!body.id || !body.action || !body.role) {
            return NextResponse.json(
                { error: "Request body must contain 'id', 'action', and 'role'" },
                { status: 400 }
            );
        }

        const { id, action, role } = body;
        const validActions = ["activate", "deactivate"];
        const validRoles = ["patient", "professional"];

        if (!validActions.includes(action) || !validRoles.includes(role)) {
            return NextResponse.json(
                { error: "Invalid action or role specified" },
                { status: 400 }
            );
        }

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

        const updateState = action === "activate";

        if (role === "patient" && user.patient !== null) {
            // Actualizar el rol de paciente
            await db.patients.update({
                where: { userId: user.id },
                data: { state: updateState },
            });

            // Si no tiene otro rol activo y está activando, activar el usuario
            if (updateState && !user.professional) {
                await db.user.update({
                    where: { id: user.id },
                    data: { state: true },
                });
            }

            // Si está desactivando y no tiene otro rol activo, desactivar el usuario
            if (!updateState && !user.professional) {
                await db.user.update({
                    where: { id: user.id },
                    data: { state: false },
                });
            }
        } else if (role === "professional" && user.professional !== null) {
            // Actualizar el rol de profesional
            await db.professional.update({
                where: { userId: user.id },
                data: { state: updateState },
            });

            // Si no tiene otro rol activo y está activando, activar el usuario
            if (updateState && !user.patient) {
                await db.user.update({
                    where: { id: user.id },
                    data: { state: true },
                });
            }

            // Si está desactivando y no tiene otro rol activo, desactivar el usuario
            if (!updateState && !user.patient) {
                await db.user.update({
                    where: { id: user.id },
                    data: { state: false },
                });
            }
        } else {
            return NextResponse.json(
                { error: `Role '${role}' not found for user` },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { message: `Role state updated successfully (${action})` },
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
