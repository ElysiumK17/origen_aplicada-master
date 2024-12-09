import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

const publicRoutes = [
  "/",
  "/pages/protected/auth/login",
  "/pages/protected/auth/register",
  "/pages/protected/auth/register-professional",
  "/pages/protected/auth/login-admin",
  "/pages/protected/auth/register-admin",
];

const patientRoutes = [
  "/pages/protected/Dashboard/patient",
  "/pages/protected/calendar",
];

const professionalRoutes = ["/pages/protected/Dashboard/professional"];

const adminRoutes = ["/pages/protected/Dashboard/admin"];

const selectProfessionalOrPatientRoutes = [
  "/pages/protected/auth/select-professional-or-patient",
];

export async function middleware(req: NextRequest) {
  const { nextUrl } = req;

  // Obtén el token de sesión
  const token = await getToken({ req, secret: process.env.AUTH_SECRET });
  console.log("Token:", token);
  console.log("Request headers:", req.headers);
  const isLoggedIn = !!token;

  console.log("Token role:", token?.role || "No token");

  const response = NextResponse.next();

  // Configura encabezados para evitar almacenamiento en cache
  response.headers.set(
    "Cache-Control",
    "no-store, no-cache, must-revalidate, proxy-revalidate"
  );
  response.headers.set("Pragma", "no-cache");
  response.headers.set("Expires", "0");

  // Manejo de rutas públicas: solo para usuarios no logueados
  if (publicRoutes.includes(nextUrl.pathname)) {
    if (isLoggedIn) {
      switch (token.role) {
        case "Patient":
          return NextResponse.redirect(
            new URL("/pages/protected/Dashboard/patient", nextUrl)
          );
        case "Professional":
          return NextResponse.redirect(
            new URL("/pages/protected/Dashboard/professional", nextUrl)
          );
        case "Admin":
          return NextResponse.redirect(
            new URL("/pages/protected/Dashboard/admin", nextUrl)
          );
        case "Patient and Professional":
          return NextResponse.redirect(
            new URL(
              "/pages/protected/auth/select-professional-or-patient",
              nextUrl
            )
          );
        default:
          break;
      }
    }
    return response;
  }

  // Manejo de rutas según roles específicos
  if (isLoggedIn) {
    if (token.role === "Patient" && !patientRoutes.includes(nextUrl.pathname)) {
      return NextResponse.redirect(
        new URL("/pages/protected/Dashboard/patient", nextUrl)
      );
    }
    if (
      token.role === "Professional" &&
      !professionalRoutes.includes(nextUrl.pathname)
    ) {
      return NextResponse.redirect(
        new URL("/pages/protected/Dashboard/professional", nextUrl)
      );
    }
    if (token.role === "Admin" && !adminRoutes.includes(nextUrl.pathname)) {
      return NextResponse.redirect(
        new URL("/pages/protected/Dashboard/admin", nextUrl)
      );
    }
    if (
      token.role === "Patient and Professional" &&
      !selectProfessionalOrPatientRoutes.includes(nextUrl.pathname)
    ) {
      return NextResponse.redirect(
        new URL("/pages/protected/auth/select-professional-or-patient", nextUrl)
      );
    }
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

export const config = {
  matcher: ["/", "/pages/protected/:path*"],
};
