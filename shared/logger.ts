// Production-safe logging utility
const isDevelopment = process.env.NODE_ENV === 'development';
const isClient = typeof window !== 'undefined';

export const logger = {
  debug: (...args: any[]) => {
    if (isDevelopment) {
      console.log(...args);
    }
  },
  info: (...args: any[]) => {
    console.log(...args);
  },
  warn: (...args: any[]) => {
    console.warn(...args);
  },
  error: (...args: any[]) => {
    console.error(...args);
  }
};

// Client-side logger (browser console)
export const clientLogger = {
  debug: (...args: any[]) => {
    if (isDevelopment && isClient) {
      console.log(...args);
    }
  },
  info: (...args: any[]) => {
    if (isClient) {
      console.log(...args);
    }
  },
  warn: (...args: any[]) => {
    if (isClient) {
      console.warn(...args);
    }
  },
  error: (...args: any[]) => {
    if (isClient) {
      console.error(...args);
    }
  }
};