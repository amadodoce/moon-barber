"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import {
  requireAdmin,
  handleActionError,
  type ActionResponse,
} from "@/lib/auth-utils";
import {
  upsertLandingContentSchema,
  type UpsertLandingContentInput,
} from "@/lib/validations/landing-page";
import type { LandingPageContent } from "@/app/generated/prisma/client";

/** Upsert a landing page content entry (ADMIN only) */
export async function upsertLandingContent(
  input: UpsertLandingContentInput
): Promise<ActionResponse<LandingPageContent>> {
  try {
    await requireAdmin();

    const data = upsertLandingContentSchema.parse(input);

    const content = await prisma.landingPageContent.upsert({
      where: { key: data.key },
      create: {
        key: data.key,
        value: data.value,
        type: data.type ?? "TEXT",
      },
      update: {
        value: data.value,
        type: data.type ?? "TEXT",
      },
    });

    revalidatePath("/admin/content");
    revalidatePath("/");
    return { success: true, data: content };
  } catch (error) {
    return handleActionError(error);
  }
}

/** Get all landing page content (ADMIN only) */
export async function getLandingContent(): Promise<
  ActionResponse<LandingPageContent[]>
> {
  try {
    await requireAdmin();

    const contents = await prisma.landingPageContent.findMany({
      orderBy: { key: "asc" },
    });

    return { success: true, data: contents };
  } catch (error) {
    return handleActionError(error);
  }
}

/** Delete a landing page content entry (ADMIN only) */
export async function deleteLandingContent(
  key: string
): Promise<ActionResponse> {
  try {
    await requireAdmin();

    await prisma.landingPageContent.delete({
      where: { key },
    });

    revalidatePath("/admin/content");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    return handleActionError(error);
  }
}
