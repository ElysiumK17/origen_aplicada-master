import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

const secret = process.env.AUTH_SECRET;

// Esta función actualiza el rol en la info session del usuario, se utiliza para cambiar el rol cuando
// el usuario tenga que seleccionar el rol en caso de tener dos roles en proceso de login.
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { role } = body;

        if (!["Patient", "Professional"].includes(role)) {
            return new NextResponse("Invalid role", { status: 400 });
        }

        const token = await getToken({ req, secret });

        if (!token) {
            return new NextResponse("Not authenticated", { status: 401 });
        }

        token.role = role;

        return new NextResponse(
            JSON.stringify({ success: true, role }),
            {
                headers: { "Content-Type": "application/json" }
            }
        );
    } catch (error) {
        console.error("Error auth api:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
