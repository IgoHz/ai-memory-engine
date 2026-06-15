type LogLevel = 'debug' | 'info' | 'warn' | 'error';

type Metadata = Record<string, unknown>;

class Logger {
  private format(
    level: LogLevel,
    message: string,
    metadata?: Metadata
  ): string {
    const prefix =
      `[${new Date().toISOString()}] ` + `[${level.toUpperCase()}] ${message}`;

    return metadata ? `${prefix} ${JSON.stringify(metadata)}` : prefix;
  }

  debug(message: string, metadata?: Metadata): void {
    console.debug(this.format('debug', message, metadata));
  }

  info(message: string, metadata?: Metadata): void {
    console.info(this.format('info', message, metadata));
  }

  warn(message: string, metadata?: Metadata): void {
    console.warn(this.format('warn', message, metadata));
  }

  error(message: string, error?: unknown, metadata?: Metadata): void {
    console.error(this.format('error', message, metadata));

    if (error) {
      console.error(error);
    }
  }
}

export const logger = new Logger();
