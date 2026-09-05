type SupabaseErrorFields = {
  message?: unknown;
  code?: unknown;
  details?: unknown;
  hint?: unknown;
};

function textField(value: unknown): string | null {
  return typeof value === "string" && value.length > 0 ? value : null;
}

export function logServerDatabaseError(context: string, error: unknown): void {
  const fields = error !== null && typeof error === "object"
    ? error as SupabaseErrorFields
    : {};

  if (process.env.NODE_ENV !== "production") {
    console.error(context, {
      message: textField(fields.message) ?? (error instanceof Error ? error.message : "Unknown database error"),
      code: textField(fields.code),
      details: textField(fields.details),
      hint: textField(fields.hint),
    });
    return;
  }

  console.error(context, { code: textField(fields.code) ?? "UNEXPECTED_DATABASE_ERROR" });
}
