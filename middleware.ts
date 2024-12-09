import { NextRequest, NextResponse } from "next/server";
import { NextURL } from "next/dist/server/web/next-url";
import { getToken } from "next-auth/jwt";

// Define las rutas públicas y las específicas por roles
const publicRoutes = [
  "/",
  "/pages/protected/auth/login",
  "/pages/protected/auth/register",
  "/pages/protected/auth/register-professional",
  "/pages/protected/auth/login-admin",
  "/pages/protected/auth/register-admin",
];

const routesByRole: {
  [key in
    | "Patient"
    | "Professional"
    | "Admin"
    | "Patient and Professional"]: string[];
} = {
  Patient: ["/pages/protected/Dashboard/patient", "/pages/protected/calendar"],
  Professional: ["/pages/protected/Dashboard/professional"],
  Admin: ["/pages/protected/Dashboard/admin"],
  "Patient and Professional": [
    "/pages/protected/auth/select-professional-or-patient",
  ],
};

// Redirección predeterminada para cada rol
const defaultRedirects = {
  Patient: "/pages/protected/Dashboard/patient",
  Professional: "/pages/protected/Dashboard/professional",
  Admin: "/pages/protected/Dashboard/admin",
  "Patient and Professional":
    "/pages/protected/auth/select-professional-or-patient",
};

interface Token {
  role?: string;
}

interface MiddlewareRequest extends NextRequest {
  nextUrl: NextURL;
}

export async function middleware(
  req: MiddlewareRequest
): Promise<NextResponse> {
  const { nextUrl } = req;

  // Obtener el token de sesión
  const token: Token | null = await getToken({
    req,
    secret: process.env.AUTH_SECRET,
  });

  console.log("Token:", token);
  console.log("Request headers:", req.headers);

  const isLoggedIn: boolean = !!token;
  const userRole: string | null = token?.role || null;

  // Configuración de encabezados para evitar almacenamiento en caché
  const response: NextResponse = NextResponse.next();
  response.headers.set(
    "Cache-Control",
    "no-store, no-cache, must-revalidate, proxy-revalidate"
  );
  response.headers.set("Pragma", "no-cache");
  response.headers.set("Expires", "0");

  // Rutas públicas: solo permiten acceso a usuarios no logueados
  if (publicRoutes.includes(nextUrl.pathname)) {
    if (isLoggedIn) {
      // Redirige al dashboard según el rol del usuario
      const redirectUrl = userRole
        ? defaultRedirects[userRole as keyof typeof defaultRedirects]
        : "/";
      return NextResponse.redirect(new URL(redirectUrl, nextUrl));
    }
    return response;
  }

  // Rutas protegidas por roles
  if (isLoggedIn) {
    const allowedRoutes: string[] = userRole
      ? routesByRole[userRole as keyof typeof routesByRole] || []
      : [];
    if (!allowedRoutes.includes(nextUrl.pathname)) {
      // Redirige al dashboard predeterminado si no tiene acceso a la ruta
      const redirectUrl = userRole
        ? defaultRedirects[userRole as keyof typeof defaultRedirects]
        : "/";
      return NextResponse.redirect(new URL(redirectUrl, nextUrl));
    }
    return response;
  }

  // Si no está logueado y no es una ruta pública, redirige al login
  if (!isLoggedIn) {
    return NextResponse.redirect(
      new URL("/pages/protected/auth/login", nextUrl)
    );
  }

  // Permitir el acceso si pasa todas las verificaciones
  return response;
}

// Configuración de las rutas protegidas por el middleware
export const config = {
  matcher: ["/", "/pages/protected/:path*"],
};
