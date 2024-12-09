import { db } from "@/libs/db";
import { hash, compare } from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        if (!body) {
            return NextResponse.json({ error: 'El cuerpo de la solicitud está vacío' }, { status: 400 });
        }

        if (!body.oldPassword || !body.newPassword || !body.email) {
            return NextResponse.json({ error: 'Faltan parámetros en el cuerpo de la solicitud' }, { status: 400 });
        }

        console.log('Recibiendo parámetros:', body.oldPassword, body.newPassword, body.email);

        const { oldPassword, newPassword, email } = body;

        // Buscar al usuario por email
        const user = await db.user.findUnique({
            where: { email },  // Corregido el acceso a 'email'
        });

        console.log('Usuario encontrado:', user);

        if (!user) {
            return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
        }

        // Verificar si la contraseña actual es correcta
        const isPasswordCorrect = await compare(oldPassword, user.password);
        console.log('Contraseña actual correcta:', isPasswordCorrect);

        if (!isPasswordCorrect) {
            return NextResponse.json({ error: "La contraseña actual es incorrecta" }, { status: 400 });
        }

        // Crear el hash de la nueva contraseña
        const hashedNewPassword = await hash(newPassword, 10);
        console.log('Nueva contraseña hasheada:', hashedNewPassword);

        // Actualizar la contraseña en la base de datos
        await db.user.update({
            where: {
                id: user.id,
            },
            data: {
                password: hashedNewPassword,
            },
        });

        return NextResponse.json({ message: "Cambio de contraseña exitoso" }, { status: 200 });
    } catch (error) {
        console.error("Error al cambiar la contraseña:", error);
        return NextResponse.json({ error: 'Error al cambiar la contraseña', details: error }, { status: 500 });
    }
}
