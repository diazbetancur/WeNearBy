import type { OrderIntent } from '../../types/models';

/**
 * OrderIntentService interface
 * Manages order intent creation (lightweight, used to initiate WhatsApp contact)
 */
export interface OrderIntentService {
  /**
   * Create a new order intent
   * @returns Promise with the created OrderIntent
   */
  create(intent: Omit<OrderIntent, 'id' | 'createdAt'>): Promise<OrderIntent>;
}
