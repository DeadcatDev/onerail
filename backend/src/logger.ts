import { createLogger, format, transports } from 'winston';

const { combine, timestamp, printf, colorize, json, splat, errors } =
    format as any;

const LOG_LEVEL =
    process.env.LOG_LEVEL ||
    (process.env.NODE_ENV === 'production' ? 'info' : 'debug');
const isProd = process.env.NODE_ENV === 'production';

const devFormat = combine(
    colorize({ all: true }),
    timestamp(),
    splat(),
    errors({ stack: true }),
    printf(({ level, message, timestamp, stack, ...meta }: any) => {
        const metaStr = Object.keys(meta).length
            ? ` ${JSON.stringify(meta)}`
            : '';
        const base = `${timestamp} ${level}: ${message}`;
        return stack
            ? `${base}\n${stack}${metaStr ? `\nmeta: ${metaStr}` : ''}`
            : `${base}${metaStr}`;
    }),
);

const prodFormat = combine(
    timestamp(),
    splat(),
    errors({ stack: true }),
    json(),
);

export const logger = createLogger({
    level: LOG_LEVEL,
    format: isProd ? prodFormat : devFormat,
    transports: [new transports.Console()],
});

// Sanitize
export function sanitizeHeaders(
    headers: Record<string, any> = {},
): Record<string, any> {
    const redacted = new Set([
        'authorization',
        'cookie',
        'set-cookie',
        'proxy-authorization',
    ]);
    const out: Record<string, any> = {};
    for (const [k, v] of Object.entries(headers)) {
        if (redacted.has(k.toLowerCase())) {
            out[k] = '*** redacted ***';
        } else {
            out[k] = v;
        }
    }
    return out;
}

export default logger;
