import "dotenv/config";
import { PrismaClient } from "./app/generated/prisma/client";
import { neonConfig } from "@neondatabase/serverless";
import { PrismaNeon } from "@prisma/adapter-neon";
import bcrypt from "bcryptjs";
import ws from "ws";

async function main() {
  neonConfig.webSocketConstructor = ws;
  const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! });
  const prisma = new PrismaClient({ adapter });

  const password = await bcrypt.hash("123456", 12);

  console.log("🌱 Seeding database...\n");

  // ─── 1. Users ──────────────────────────────────────────────────────────────

  const admin = await prisma.user.upsert({
    where: { phone: "09000000000" },
    update: {},
    create: { phone: "09000000000", name: "مدیر سیستم", password, role: "ADMIN" },
  });

  const customer = await prisma.user.upsert({
    where: { phone: "09111111111" },
    update: {},
    create: { phone: "09111111111", name: "مشتری نمونه", password, role: "CUSTOMER" },
  });

  const customer2 = await prisma.user.upsert({
    where: { phone: "09176543210" },
    update: {},
    create: { phone: "09176543210", name: "رضا کریمی", password, role: "CUSTOMER" },
  });

  const barberUser1 = await prisma.user.upsert({
    where: { phone: "09123456789" },
    update: {},
    create: { phone: "09123456789", name: "علی محمدی", password, role: "BARBER" },
  });

  const barberUser2 = await prisma.user.upsert({
    where: { phone: "09198765432" },
    update: {},
    create: { phone: "09198765432", name: "محمد رضایی", password, role: "BARBER" },
  });

  const barberUser3 = await prisma.user.upsert({
    where: { phone: "09187654321" },
    update: {},
    create: { phone: "09187654321", name: "حسین عباسی", password, role: "BARBER" },
  });

  console.log("✅ Users created:", admin.name, customer.name, customer2.name, barberUser1.name, barberUser2.name, barberUser3.name);

  // ─── 2. Barbers ────────────────────────────────────────────────────────────

  const barber1 = await prisma.barber.upsert({
    where: { userId: barberUser1.id },
    update: {},
    create: {
      userId: barberUser1.id,
      bio: "متخصص اصلاح مو و ریش با ۸ سال تجربه در بهترین آرایشگاه‌های تهران",
      experienceYears: 8,
    },
  });

  const barber2 = await prisma.barber.upsert({
    where: { userId: barberUser2.id },
    update: {},
    create: {
      userId: barberUser2.id,
      bio: "طراح خط ریش و اصلاح مو مردانه با ۵ سال تجربه",
      experienceYears: 5,
    },
  });

  const barber3 = await prisma.barber.upsert({
    where: { userId: barberUser3.id },
    update: {},
    create: {
      userId: barberUser3.id,
      bio: "آرایشگر حرفه‌ای با ۱۰ سال سابقه در اصلاح مو مردانه",
      experienceYears: 10,
    },
  });

  console.log("✅ Barbers created:", barber1.id, barber2.id, barber3.id);

  // ─── 3. Services ───────────────────────────────────────────────────────────

  const services = [
    {
      name: "اصلاح مو",
      description: "اصلاح حرفه‌ای مو با جدیدترین تکنیک‌ها و ابزارهای روز",
      durationMinutes: 30,
      price: 150000,
    },
    {
      name: "اصلاح ریش",
      description: "طراحی و اصلاح ریش با دقت بالا و خط‌کشی تمیز",
      durationMinutes: 20,
      price: 100000,
    },
    {
      name: "پکیج کامل",
      description: "اصلاح مو + ریش + ماساص صورت + ابرو",
      durationMinutes: 60,
      price: 350000,
    },
    {
      name: "رنگ مو",
      description: "رنگ موی مردانه با برندهای معتبر و بدون آسیب",
      durationMinutes: 45,
      price: 300000,
    },
    {
      name: "فرم‌دهی مو",
      description: "فرم‌دهی و حالت‌دهی مو با واکس و ژل حرفه‌ای",
      durationMinutes: 25,
      price: 120000,
    },
    {
      name: "اصلاح ابرو",
      description: "اصلاح و مرتب کردن ابرو با نخ",
      durationMinutes: 15,
      price: 50000,
    },
  ];

  const createdServices = [];
  for (const service of services) {
    const existing = await prisma.service.findFirst({
      where: { name: service.name, deletedAt: null },
    });
    if (existing) {
      createdServices.push(existing);
    } else {
      const created = await prisma.service.create({ data: service });
      createdServices.push(created);
    }
  }

  console.log("✅ Services created:", createdServices.map((s) => s.name).join(", "));

  // ─── 4. Working Hours (shop-wide) ─────────────────────────────────────────
  // Saturday-Thursday: 09:00-12:00, 14:00-20:00
  // Friday: closed

  const workDays = ["SATURDAY", "SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY"] as const;
  const morningStart = "09:00";
  const morningEnd = "12:00";
  const afternoonStart = "14:00";
  const afternoonEnd = "20:00";

  // Clear existing shop-wide hours
  await prisma.workingHour.deleteMany({
    where: { barberId: null, isRecurring: true },
  });

  for (const day of workDays) {
    await prisma.workingHour.create({
      data: {
        barberId: null,
        dayOfWeek: day,
        startTime: morningStart,
        endTime: morningEnd,
        isRecurring: true,
      },
    });
    await prisma.workingHour.create({
      data: {
        barberId: null,
        dayOfWeek: day,
        startTime: afternoonStart,
        endTime: afternoonEnd,
        isRecurring: true,
      },
    });
  }

  console.log("✅ Working hours created (shop-wide: Sat-Thu 09:00-12:00, 14:00-20:00)");

  // ─── 5. Sample Appointments ────────────────────────────────────────────────

  // Get tomorrow's date (or next Saturday if tomorrow is Friday)
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  if (tomorrow.getDay() === 5) {
    // Friday = 5, move to Saturday
    tomorrow.setDate(tomorrow.getDate() + 1);
  }
  const tomorrowStr = tomorrow.toISOString().split("T")[0];

  // Get day after tomorrow
  const dayAfter = new Date(tomorrow);
  dayAfter.setDate(dayAfter.getDate() + 1);
  if (dayAfter.getDay() === 5) {
    dayAfter.setDate(dayAfter.getDate() + 1);
  }
  const dayAfterStr = dayAfter.toISOString().split("T")[0];

  // Appointment 1: customer books barber1 for "اصلاح مو" tomorrow at 09:00
  const appt1 = await prisma.appointment.create({
    data: {
      userId: customer.id,
      barberId: barber1.id,
      date: new Date(tomorrowStr),
      startTime: "09:00",
      endTime: "09:30",
      status: "CONFIRMED",
      notes: "لطفاً موها را کوتاه‌تر کنید",
    },
  });

  await prisma.appointmentService.create({
    data: {
      appointmentId: appt1.id,
      serviceId: createdServices[0].id, // اصلاح مو
      priceAtBooking: createdServices[0].price,
    },
  });

  await prisma.payment.create({
    data: {
      appointmentId: appt1.id,
      amount: createdServices[0].price,
      status: "PAID",
      method: "ZARINPAL",
      zarinpalRefId: "MOCK-REF-001",
      paidAt: new Date(),
    },
  });

  // Appointment 2: customer2 books barber2 for "پکیج کامل" day after tomorrow at 14:00
  const appt2 = await prisma.appointment.create({
    data: {
      userId: customer2.id,
      barberId: barber2.id,
      date: new Date(dayAfterStr),
      startTime: "14:00",
      endTime: "15:00",
      status: "PENDING",
    },
  });

  await prisma.appointmentService.create({
    data: {
      appointmentId: appt2.id,
      serviceId: createdServices[2].id, // پکیج کامل
      priceAtBooking: createdServices[2].price,
    },
  });

  await prisma.payment.create({
    data: {
      appointmentId: appt2.id,
      amount: createdServices[2].price,
      status: "PENDING",
      method: "ZARINPAL",
    },
  });

  // Appointment 3: customer books barber3 for "اصلاح مو" + "اصلاح ریش" tomorrow at 10:00
  const appt3 = await prisma.appointment.create({
    data: {
      userId: customer.id,
      barberId: barber3.id,
      date: new Date(tomorrowStr),
      startTime: "10:00",
      endTime: "10:50",
      status: "PENDING",
    },
  });

  await prisma.appointmentService.create({
    data: {
      appointmentId: appt3.id,
      serviceId: createdServices[0].id, // اصلاح مو
      priceAtBooking: createdServices[0].price,
    },
  });

  await prisma.appointmentService.create({
    data: {
      appointmentId: appt3.id,
      serviceId: createdServices[1].id, // اصلاح ریش
      priceAtBooking: createdServices[1].price,
    },
  });

  await prisma.payment.create({
    data: {
      appointmentId: appt3.id,
      amount: Number(createdServices[0].price) + Number(createdServices[1].price),
      status: "PENDING",
      method: "ZARINPAL",
    },
  });

  console.log("✅ Appointments created:", appt1.id, appt2.id, appt3.id);

  // ─── 6. Landing Page Content ───────────────────────────────────────────────

  const landingContent = [
    { key: "shop_name", value: "آرایشگاه مردانه" },
    { key: "hero_subtitle", value: "رزرو آنلاین نوبت در چند ثانیه" },
    { key: "about_text", value: "ما با سال‌ها تجربه در ارائه خدمات آرایشگاهی مردانه، تلاش می‌کنیم تا بهترین تجربه را برای شما فراهم کنیم." },
    { key: "phone", value: "۰۲۱-۱۲۳۴۵۶۷۸" },
    { key: "address", value: "تهران، خیابان ولیعصر، پلاک ۱۲۳" },
  ];

  for (const item of landingContent) {
    await prisma.landingPageContent.upsert({
      where: { key: item.key },
      update: { value: item.value },
      create: item,
    });
  }

  console.log("✅ Landing page content created");

  // ─── Summary ───────────────────────────────────────────────────────────────

  console.log("\n🎉 Seed complete!\n");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("📋 Test Accounts (password: 123456)");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("Admin:    09000000000");
  console.log("Customer: 09111111111");
  console.log("Customer: 09176543210");
  console.log("Barber:   09123456789 (علی محمدی)");
  console.log("Barber:   09198765432 (محمد رضایی)");
  console.log("Barber:   09187654321 (حسین عباسی)");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error("Seed failed:", e);
  process.exit(1);
});
