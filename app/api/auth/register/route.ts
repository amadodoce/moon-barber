import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { registerSchema } from "@/lib/validations/auth";
import { checkRateLimit } from "@/lib/rate-limit";

export async function POST(request: Request) {
  try {
    // Rate limit: 5 attempts per 15 minutes per IP
    const ip = request.headers.get("x-forwarded-for") ?? "unknown";
    if (!checkRateLimit(`register:${ip}`, 5, 15 * 60 * 1000)) {
      return NextResponse.json(
        { error: "تعداد درخواست‌ها بیش از حد مجاز است. لطفاً بعداً تلاش کنید." },
        { status: 429 }
      );
    }

    const body = await request.json();

    // Validate input with Zod
    const result = registerSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0].message },
        { status: 400 }
      );
    }

    const { name, phone, password } = result.data;

    // Check if phone is already registered
    const existingUser = await prisma.user.findUnique({
      where: { phone },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "این شماره موبایل قبلاً ثبت شده است" },
        { status: 409 }
      );
    }

    // Hash password with bcrypt (12 salt rounds)
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user with CUSTOMER role by default
    await prisma.user.create({
      data: {
        name,
        phone,
        password: hashedPassword,
        role: "CUSTOMER",
      },
    });

    return NextResponse.json(
      { message: "ثبت‌نام با موفقیت انجام شد" },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      { error: "خطای داخلی سرور" },
      { status: 500 }
    );
  }
}
