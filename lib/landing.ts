import { prisma } from "@/lib/prisma";
import { serializeManyForClient } from "@/lib/serialize";

export const DEFAULT_LANDING_CONTENT = {
  shop_name: "مون باربر",
  hero_subtitle: "رزرو آنلاین نوبت در چند ثانیه",
  about_text:
    "ما با سال‌ها تجربه در ارائه خدمات باربرین، تلاش می‌کنیم تا بهترین تجربه را برای شما فراهم کنیم.",
  phone: "۰۲۱-۱۲۳۴۵۶۷۸",
  address: "تهران، خیابان ولیعصر، پلاک ۱۲۳",
  working_hours_text: "شنبه تا پنج‌شنبه: ۹ صبح تا ۹ شب",
} as const;

export type LandingContentMap = Record<string, string>;

export type LandingService = {
  id: string;
  name: string;
  description: string | null;
  durationMinutes: number;
  price: number;
  imageUrl: string | null;
};

export type LandingBarber = {
  id: string;
  bio: string | null;
  experienceYears: number | null;
  user: { name: string; avatar: string | null };
};

export type LandingData = {
  content: LandingContentMap;
  services: LandingService[];
  barbers: LandingBarber[];
};

function mergeContent(contentMap: LandingContentMap): LandingContentMap {
  return { ...DEFAULT_LANDING_CONTENT, ...contentMap };
}

/** Load landing page data from the database, with safe defaults when unavailable. */
export async function getLandingData(): Promise<LandingData> {
  try {
    const [content, services, barbers] = await Promise.all([
      prisma.landingPageContent.findMany(),
      prisma.service.findMany({ where: { isActive: true, deletedAt: null } }),
      prisma.barber.findMany({
        where: { isActive: true },
        include: { user: { select: { name: true, avatar: true } } },
      }),
    ]);

    const contentMap: LandingContentMap = {};
    content.forEach((c) => {
      contentMap[c.key] = c.value;
    });

    const serializedServices = serializeManyForClient(services).map((service) => ({
      id: service.id as string,
      name: service.name as string,
      description: service.description as string | null,
      durationMinutes: service.durationMinutes as number,
      price: Number(service.price),
      imageUrl: service.imageUrl as string | null,
    }));

    return {
      content: mergeContent(contentMap),
      services: serializedServices,
      barbers: barbers.map((barber) => ({
        id: barber.id,
        bio: barber.bio,
        experienceYears: barber.experienceYears,
        user: {
          name: barber.user.name,
          avatar: barber.user.avatar,
        },
      })),
    };
  } catch (error) {
    console.warn(
      "Landing data unavailable; using defaults.",
      error instanceof Error ? error.message : error
    );

    return {
      content: { ...DEFAULT_LANDING_CONTENT },
      services: [],
      barbers: [],
    };
  }
}
