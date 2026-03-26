import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
  ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
  accessTokenMaxAgeSeconds,
  baseCookieOptions,
  hashToken,
  refreshTokenExpiresAt,
  refreshTokenMaxAgeSeconds,
  signAccessToken,
  signRefreshToken,
  verifyPassword,
} from "@/lib/auth";
import { loginSchema } from "@/lib/validators";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = loginSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input." }, { status: 400 });
  }

  const { email, password } = parsed.data;
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    return NextResponse.json(
      { error: "Invalid email or password." },
      { status: 401 }
    );
  }

  const validPassword = await verifyPassword(password, user.passwordHash);
  if (!validPassword) {
    return NextResponse.json(
      { error: "Invalid email or password." },
      { status: 401 }
    );
  }

  const payload = { sub: user.id, email: user.email };
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);

  await prisma.refreshToken.create({
    data: {
      tokenHash: hashToken(refreshToken),
      userId: user.id,
      expiresAt: refreshTokenExpiresAt(),
    },
  });

  const response = NextResponse.json({
    user: { id: user.id, email: user.email },
  });

  response.cookies.set(
    ACCESS_TOKEN_COOKIE,
    accessToken,
    baseCookieOptions(accessTokenMaxAgeSeconds())
  );
  response.cookies.set(
    REFRESH_TOKEN_COOKIE,
    refreshToken,
    baseCookieOptions(refreshTokenMaxAgeSeconds())
  );

  return response;
}