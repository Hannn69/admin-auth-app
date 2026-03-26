import { NextResponse } from "next/server";
import { cookies } from "next/headers";
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
  verifyToken,
} from "@/lib/auth";

export async function POST() {
  const refreshToken = cookies().get(REFRESH_TOKEN_COOKIE)?.value;

  if (!refreshToken) {
    return NextResponse.json({ error: "Missing refresh token." }, { status: 401 });
  }

  const payload = verifyToken(refreshToken);
  if (!payload) {
    return NextResponse.json({ error: "Invalid refresh token." }, { status: 401 });
  }

  const existing = await prisma.refreshToken.findUnique({
    where: { tokenHash: hashToken(refreshToken) },
  });

  if (!existing || existing.revokedAt || existing.expiresAt < new Date()) {
    return NextResponse.json({ error: "Refresh token expired." }, { status: 401 });
  }

  const newRefreshToken = signRefreshToken(payload);
  const newRefreshRecord = await prisma.refreshToken.create({
    data: {
      tokenHash: hashToken(newRefreshToken),
      userId: existing.userId,
      expiresAt: refreshTokenExpiresAt(),
    },
  });

  await prisma.refreshToken.update({
    where: { id: existing.id },
    data: {
      revokedAt: new Date(),
      replacedByTokenId: newRefreshRecord.id,
    },
  });

  const accessToken = signAccessToken(payload);
  const response = NextResponse.json({ ok: true });

  response.cookies.set(
    ACCESS_TOKEN_COOKIE,
    accessToken,
    baseCookieOptions(accessTokenMaxAgeSeconds())
  );
  response.cookies.set(
    REFRESH_TOKEN_COOKIE,
    newRefreshToken,
    baseCookieOptions(refreshTokenMaxAgeSeconds())
  );

  return response;
}