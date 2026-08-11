/** Duck-type check for Prisma Decimal-like values. */
function isDecimalLike(value: unknown): value is { toNumber: () => number } {
  return (
    typeof value === "object" &&
    value !== null &&
    "toNumber" in value &&
    typeof (value as { toNumber: unknown }).toNumber === "function"
  );
}

/** Convert Prisma Decimal to a plain number for client components. */
export function decimalToNumber(value: unknown): number {
  if (isDecimalLike(value)) {
    return value.toNumber();
  }
  return Number(value);
}

/** Serialize a Prisma model field bag for safe client transfer. */
export function serializeForClient<T extends Record<string, unknown>>(
  obj: T
): T {
  const result = { ...obj } as Record<string, unknown>;

  for (const [key, value] of Object.entries(result)) {
    if (value === null || value === undefined) continue;

    if (isDecimalLike(value)) {
      result[key] = value.toNumber();
      continue;
    }

    if (typeof value === "object" && value !== null && "toFixed" in value) {
      result[key] = Number(value);
      continue;
    }

    if (value instanceof Date) {
      result[key] = value.toISOString();
      continue;
    }

    if (Array.isArray(value)) {
      result[key] = value.map((item) =>
        typeof item === "object" && item !== null
          ? serializeForClient(item as Record<string, unknown>)
          : item
      );
    }
  }

  return result as T;
}

/** Serialize an array of Prisma records for client components. */
export function serializeManyForClient<T extends Record<string, unknown>>(
  items: T[]
): T[] {
  return items.map((item) => serializeForClient(item));
}
