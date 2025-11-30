import crypto from 'crypto';

export function computeETag(payload: any): string {
    const json =
        typeof payload === 'string' ? payload : JSON.stringify(payload);
    const hash = crypto.createHash('sha1').update(json).digest('hex');
    return '"' + hash + '"';
}

export default { computeETag };
