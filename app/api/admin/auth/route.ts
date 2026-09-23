import { NextRequest, NextResponse } from "next/server";
import {
  verifyAdminPassword,
  createSessionToken,
  verifySessionToken,
  ADMIN_COOKIE_NAME,
} from "@/lib/admin-auth";

/**
 * Check current auth status
 */
export async function GET(req: NextRequest) {
  const token = req.cookies.get(ADMIN_COOKIE_NAME)?.value;
  const isAuthenticated = verifySessionToken(token);

  return NextResponse.json({
    authenticated: isAuthenticated,
  });
}

/**
 * Handle admin login
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { password } = body;

    if (!verifyAdminPassword(password)) {
      return NextResponse.json(
        {
          success: false,
          message: "Mot de passe incorrect.",
        },
        { status: 401 }
      );
    }

    const token = createSessionToken();

    const response = NextResponse.json({
      success: true,
      message: "Connexion réussie.",
    });

    // Set 30-day secure HTTP-only cookie
    response.cookies.set({
      name: ADMIN_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 30 * 24 * 60 * 60, // 30 days
    });

    return response;
  } catch (error) {
    console.error("[Admin Auth] Login error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Erreur serveur lors de la connexion.",
      },
      { status: 500 }
    );
  }
}

/**
 * Handle admin logout
 */
export async function DELETE() {
  const response = NextResponse.json({
    success: true,
    message: "Déconnexion réussie.",
  });

  response.cookies.set({
    name: ADMIN_COOKIE_NAME,
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });

  return response;
}
