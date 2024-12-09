import { LoginPacienteSchema, LoginProfesionalSchema } from "@/libs/zod";
import { signIn } from "next-auth/react";
import { z } from "zod";

export const loginAdminAction = async (
    values: z.infer<typeof LoginPacienteSchema> | z.infer<typeof LoginProfesionalSchema>
) => {
    try {
        const result = await signIn("admin-login", {
            email: values.email,
            password: values.password,
            redirect: false,
        });

        // Maneja el caso de error en las credenciales
        if (!result || result.error) {
            return { success: false, error: "Error en el inicio de sesión: credenciales incorrectas" };
        }

        return { success: true, result };
    } catch (error) {
        console.error(error);

        const errorMessage =
            error instanceof Error ? error.message : "Error inesperado en el inicio de sesión";
        return { success: false, error: errorMessage };
    }
};


