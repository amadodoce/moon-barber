import { prisma } from "@/lib/prisma";

export async function getLandingData() {
  const [content, services, barbers] = await Promise.all([
    prisma.landingPageContent.findMany(),
    prisma.service.findMany({ where: { isActive: true, deletedAt: null } }),
    prisma.barber.findMany({
      where: { isActive: true },
      include: { user: { select: { name: true, avatar: true } } },
    }),
  ]);

  const contentMap: Record<string, string> = {};
  content.forEach((c) => {
    contentMap[c.key] = c.value;
  });

  return { content: contentMap, services, barbers };
}
