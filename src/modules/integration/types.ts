export interface Integration {
  id: string;
  apiKey: string;
  webhookUrl: string;
  enabled: boolean;
  lastDeliveryAt: string | null;
  lastDeliveryOk: boolean | null;
}

export interface IntegrationUpdatePayload {
  webhookUrl?: string;
  enabled?: boolean;
}
