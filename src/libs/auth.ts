import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
// auth.config imporrt object
import authConfig from "@/libs/auth.config"
import{db} from "@/libs/db"
 
export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(db),
  session: {strategy: "jwt",},
  ...authConfig,
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.role = user.role;  // Asigna el rol al token
      }

      if (trigger === "update") {
        token.role = session.user.role;  // Cambiar el rol en la sesión.
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role; // Asigna el rol desde el token a la sesión
      }
      return session;
    },
  }
})