import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
import { Request } from 'express';

@Injectable()
export class FingerprintService {
  generateFingerprint(req: Request): string {
    const userAgent = req.headers['user-agent'] ?? 'Unknown';
    const clientIp = req.ip;
    const platform = req.headers['sec-ch-ua-platform'] ?? 'Unknown';
    const model = req.headers['sec-ch-ua-model'] || 'Unknown';
    const isMobile = req.headers['sec-ch-ua-mobile'] ?? 'Unknown';

    const fingerprintSource = `${userAgent}-${clientIp}-${platform}-${model}-${isMobile}`;

    const fingerprint = crypto
      .createHash('sha256')
      .update(fingerprintSource)
      .digest('hex');

    return fingerprint;
  }
}
