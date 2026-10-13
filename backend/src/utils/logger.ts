type LogContext = Record<string, unknown>;

function writeLog(
  level: "info" | "warn" | "error",
  message: string,
  context: LogContext = {},
): void {
  const entry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...context,
  };

  const output = JSON.stringify(entry);

  if (level === "error") {
    console.error(output);
  } else if (level === "warn") {
    console.warn(output);
  } else {
    console.log(output);
  }
}

const logger = {
  info: (message: string, context?: LogContext) =>
    writeLog("info", message, context),

  warn: (message: string, context?: LogContext) =>
    writeLog("warn", message, context),

  error: (message: string, context?: LogContext) =>
    writeLog("error", message, context),
};

export default logger;