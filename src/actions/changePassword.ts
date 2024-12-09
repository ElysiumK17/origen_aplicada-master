import { db } from "@/libs/db";
import { hash, compare } from "bcryptjs";

export async function ChangePassword(
    oldPassword: string,
    newPassword: string,
    email: string
) {
    try {
        console.log('Recibiendo parámetros:', oldPassword, newPassword, email);

        // Buscar al usuario por email
        const user = await db.user.findUnique({
            where: { email },
        });

        console.log('Usuario encontrado:', user);

        if (!user) {
            return { error: "Usuario no encontrado" };
        }

        // Verificar si la contraseña actual es correcta
        const isPasswordCorrect = await compare(oldPassword, user.password);
        console.log('Contraseña actual correcta:', isPasswordCorrect);

        if (!isPasswordCorrect) {
            return { error: "La contraseña actual es incorrecta" };
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

        return { message: "Cambio de contraseña exitoso" };
    } catch (error) {
        console.error("Error al cambiar la contraseña:", error);
        return ({error:error});
    }
}
