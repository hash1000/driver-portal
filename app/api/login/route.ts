import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ensurePortalSeeded } from "@/lib/portal-server";
import { normalize } from "@/lib/portal-config";

export async function POST(request: Request) {
  await ensurePortalSeeded();

  const { username, password } = (await request.json()) as {
    username?: string;
    password?: string;
  };

  if (!username || !password) {
    return NextResponse.json({ error: "Username and password are required." }, { status: 400 });
  }

  const users = await prisma.user.findMany();
  const found = users.find(
    (user) => normalize(user.username) === normalize(username) && normalize(user.password) === normalize(password),
  );

  if (!found) {
    return NextResponse.json({ error: "Login failed" }, { status: 401 });
  }

  return NextResponse.json({
    user: {
      id: found.id,
      username: found.username,
      password: found.password,
      name: found.name,
      role: found.role,
    },
  });
}
