import { Request } from 'express';

class FingerPrintService {
  generateDeviceFingerprint(req: Request): string {
    const userAgent = req.headers['user-agent'] ?? 'Unknown';
    const clientIp = req.ip;
    const platform = req.headers['sec-ch-ua-platform'] ?? 'Unknown';
    const model = req.headers['sec-ch-ua-model'] || 'Unknown';
    const isMobile = req.headers['sec-ch-ua-mobile'] ?? 'Unknown';

    return `${userAgent}-${clientIp}-${platform}-${model}-${isMobile}`;
  }
}

export default new FingerPrintService();
