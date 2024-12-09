import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { LoginPacienteSchema, LoginAdminSchema } from "@/libs/zod";
import { db } from "@/libs/db";
import bcrypt from "bcryptjs";

// This is the object configuration, not the full Auth.js instance
export default {
    providers: [
        Credentials({
            id: "user-login", // Identificador del proveedor
            name: "User Login",
            authorize: async (credentials) => {
                // Validate the credentials with Zod schema
                const parsed = LoginPacienteSchema.safeParse(credentials);
                if (!parsed.success) {
                    throw new Error("Invalid credentials");
                }
                
                const { email, password } = parsed.data;

                // Fetch user from the database
                const user = await db.user.findUnique({
                    where: { email },
                    include: {
                        patient: true,
                        professional: true,
                    },
                });

                if (!user) {
                    throw new Error("No user found");
                }

                // Check if the provided password matches the hashed password in the database
                const passwordMatch = await bcrypt.compare(password, user.password);
                if (!passwordMatch) {
                    throw new Error("Invalid password");
                }

                // Determine user role based on their assigned roles
                const isPaciente = !!user.patient;
                const isProfesional = !!user.professional;
                if (!isPaciente && !isProfesional) {
                    throw new Error("User has no roles assigned");
                }

                // Set the role based on the user's roles
                const role = isPaciente && isProfesional ? "Patient and Professional" 
                            : isPaciente ? "Patient" 
                            : "Professional";

                // Create the user and role object to return
                const userWithRole = {
                    ...user,
                    role,
                  };
                return userWithRole;
            },
        }),
        Credentials({
            id: "admin-login", // Identificador del proveedor
            name: "Admin Login",
            authorize: async (credentials) => {
                const parsed = LoginPacienteSchema.safeParse(credentials);
                if (!parsed.success) {
                    throw new Error("Invalid credentials");
                }

                const { email, password } = parsed.data;


                // Buscar administrador en la tabla `admin`
                const admin = await db.adminUser.findUnique({
                    where: { email },
                });

                if (!admin) {
                    throw new Error("No admin found");
                }

                // Verificar contraseña
                const passwordMatch = await bcrypt.compare(password, admin.password);
                if (!passwordMatch) {
                    throw new Error("Invalid password");
                }

                // Retornar administrador con rol
                return { ...admin, role: "Admin" };
            },
        }),
    ],
} satisfies NextAuthConfig;
