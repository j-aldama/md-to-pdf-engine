export type LogLevel = "verbose" | "normal" | "quiet";

export interface Logger {
  verbose(msg: string): void;
  info(msg: string): void;
  warn(msg: string): void;
  error(msg: string): void;
  time(label: string): void;
  timeEnd(label: string): string;
}

export function createLogger(level: LogLevel): Logger {
  const timers = new Map<string, number>();

  const write = (msg: string): void => {
    process.stderr.write(msg + "\n");
  };

  return {
    verbose(msg: string): void {
      if (level === "verbose") write(msg);
    },

    info(msg: string): void {
      if (level !== "quiet") write(msg);
    },

    warn(msg: string): void {
      write(`Warning: ${msg}`);
    },

    error(msg: string): void {
      write(`Error: ${msg}`);
    },

    time(label: string): void {
      if (level === "verbose") {
        timers.set(label, performance.now());
      }
    },

    timeEnd(label: string): string {
      const start = timers.get(label);
      if (start === undefined) return "";
      timers.delete(label);
      const elapsed = ((performance.now() - start) / 1000).toFixed(2);
      if (level === "verbose") {
        write(`${label}: ${elapsed}s`);
      }
      return `${elapsed}s`;
    },
  };
}
