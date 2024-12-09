import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { db } from "@/libs/db";
import bcrypt from "bcryptjs";
import { LoginPacienteSchema, LoginAdminSchema } from "@/libs/zod";

const authOptions = {
  providers: [
    CredentialsProvider({
      id: "user-login", // Identificador del proveedor
      name: "User Login",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        const parsed = LoginPacienteSchema.safeParse(credentials);
        if (!parsed.success) {
          throw new Error("Invalid credentials");
        }

        const { email, password } = parsed.data;

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

        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
          throw new Error("Invalid password");
        }

        const isPaciente = !!user.patient;
        const isProfesional = !!user.professional;
        if (!isPaciente && !isProfesional) {
          throw new Error("User has no roles assigned");
        }

        const role =
          isPaciente && isProfesional
            ? "Patient and Professional"
            : isPaciente
            ? "Patient"
            : "Professional";

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role,
        };
      },
    }),
    CredentialsProvider({
      id: "admin-login", // Identificador del proveedor
      name: "Admin Login",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        const parsed = LoginAdminSchema.safeParse(credentials);
        if (!parsed.success) {
          throw new Error("Invalid credentials");
        }

        const { email, password } = parsed.data;

        const admin = await db.adminUser.findUnique({
          where: { email },
        });

        if (!admin) {
          throw new Error("No admin found");
        }

        const passwordMatch = await bcrypt.compare(password, admin.password);
        if (!passwordMatch) {
          throw new Error("Invalid password");
        }

        return {
          id: admin.id,
          name: admin.name,
          email: admin.email,
          role: "Admin",
        };
      },
    }),
  ],

  secret: process.env.AUTH_SECRET,

  session: {
    jwt: true,
    maxAge: 30 * 24 * 60 * 60, // Sesión válida por 30 días
  },

  jwt: {
    secret: process.env.JWT_SECRET,
    maxAge: 30 * 24 * 60 * 60, // Optional: add other properties if needed
  },

  callbacks: {
    async jwt({ token, user }: { token: any; user?: any }) {
      if (user) {
        token.role = user.role; // Agrega el rol al token
      }
      return token;
    },
    async session({ session, token }: { session: any; token: any }) {
      session.user = {
        ...session.user,
        role: token.role, // Agrega el rol a la sesión
      };
      return session;
    },
  },

  pages: {
    signIn: "/pages/protected/auth/login",
  },

  debug: process.env.NODE_ENV !== "production",
};

export default NextAuth(authOptions);
