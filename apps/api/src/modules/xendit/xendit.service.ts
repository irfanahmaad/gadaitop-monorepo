import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface XenditVaResult {
  xenditId: string;
  externalId: string;
  vaNumber: string;
  bankCode: string;
  expiresAt: Date;
}

@Injectable()
export class XenditService {
  private readonly logger = new Logger(XenditService.name);
  private readonly secretKey: string;
  private readonly apiUrl = 'https://api.xendit.co';

  constructor(private configService: ConfigService) {
    this.secretKey = this.configService.get<string>('XENDIT_SECRET_KEY') ?? '';
  }

  /**
   * Create a Fixed Virtual Account via Xendit REST API.
   * The VA is single-use, closed amount, expires at end of the given date.
   */
  async createFixedVirtualAccount(
    externalId: string,
    amount: number,
    expiresAt: Date,
    name = 'Gadai Top',
    bankCode = 'BNI',
  ): Promise<XenditVaResult> {
    const auth = Buffer.from(`${this.secretKey}:`).toString('base64');

    const body = {
      external_id: externalId,
      bank_code: bankCode,
      name,
      expected_amount: amount,
      expiration_date: expiresAt.toISOString(),
      is_single_use: true,
      is_closed: true,
    };

    const response = await fetch(`${this.apiUrl}/callback_virtual_accounts`, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      this.logger.error(`Xendit VA creation failed: ${response.status} ${errorText}`);
      throw new InternalServerErrorException(
        `Failed to create Xendit Virtual Account: ${response.status}`,
      );
    }

    const data = (await response.json()) as {
      id: string;
      external_id: string;
      account_number: string;
      bank_code: string;
      expiration_date: string;
    };

    return {
      xenditId: data.id,
      externalId: data.external_id,
      vaNumber: data.account_number,
      bankCode: data.bank_code,
      expiresAt: new Date(data.expiration_date),
    };
  }

  /**
   * Verify that a webhook callback is from Xendit.
   * Compares the x-callback-token header with XENDIT_WEBHOOK_TOKEN env var.
   */
  verifyWebhookToken(callbackToken: string): boolean {
    const webhookToken = this.configService.get<string>('XENDIT_WEBHOOK_TOKEN') ?? '';
    return callbackToken === webhookToken;
  }
}
