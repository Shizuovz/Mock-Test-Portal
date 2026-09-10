type LogLevel = "info" | "warn" | "error" | "debug";

interface StructuredLogPayload {
  event: string;
  level?: LogLevel;
  correlationId?: string;
  userId?: string;
  orderId?: string;
  attemptId?: string;
  testId?: string;
  metadata?: Record<string, unknown>;
  error?: string;
}

const SENSITIVE_KEYS = new Set([
  "authorization",
  "password",
  "token",
  "secret",
  "razorpay_key_secret",
  "razorpay_signature",
  "key_secret",
  "webhook_secret",
  "service_role_key",
  "selected_option_id",
  "correct_option_id",
]);

/**
 * Recursively scrubs PII, secrets, and protected exam answers from log payloads.
 */
function sanitizeLogData(data: any): any {
  if (!data || typeof data !== "object") {
    return data;
  }

  if (Array.isArray(data)) {
    return data.map(sanitizeLogData);
  }

  const sanitized: Record<string, any> = {};
  for (const [key, value] of Object.entries(data)) {
    if (SENSITIVE_KEYS.has(key.toLowerCase())) {
      sanitized[key] = "[REDACTED]";
    } else if (typeof value === "object" && value !== null) {
      sanitized[key] = sanitizeLogData(value);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
}

/**
 * Production structured logger outputting JSON lines.
 */
export const logger = {
  info: (event: string, payload: Omit<StructuredLogPayload, "event" | "level"> = {}) => {
    logMessage("info", event, payload);
  },
  warn: (event: string, payload: Omit<StructuredLogPayload, "event" | "level"> = {}) => {
    logMessage("warn", event, payload);
  },
  error: (event: string, payload: Omit<StructuredLogPayload, "event" | "level"> = {}) => {
    logMessage("error", event, payload);
  },
};

function logMessage(
  level: LogLevel,
  event: string,
  payload: Omit<StructuredLogPayload, "event" | "level">
) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    level,
    event,
    ...sanitizeLogData(payload),
  };

  const output = JSON.stringify(logEntry);

  if (level === "error") {
    console.error(output);
  } else if (level === "warn") {
    console.warn(output);
  } else {
    console.log(output);
  }
}
