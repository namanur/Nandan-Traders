import type { Order } from '../types';
import { businessInfo } from '../data/businessInfo';

// WARNING: Storing secrets like BOT_TOKEN on the client-side is insecure and should only be used for local development/testing.
// In production, this logic must be moved to a secure backend server.
const BOT_TOKEN = '8413058931:AAEfdyJmrmbkkkwYlzOME8mI4LAYGfdjSqI';
const CHAT_ID_FALLBACK = '-1003369221122';

const formatOrderForTelegram = (order: Order): string => {
    const itemsList = order.items
      .map(item => `- ${item.name} x ${item.qty} (₹${(item.rate * item.qty).toFixed(2)})`)
      .join('\n');
  
    const orderDetails = [
      `📦 *New Order Received*`,
      `*Order:* \`${order.orderId}\``,
      `*Name:* ${order.name}`,
      `*Mobile:* ${order.mobile}`,
    ];
  
    if (order.gst) orderDetails.push(`*GST:* ${order.gst}`);
    if (order.address) orderDetails.push(`*Address:* ${order.address}`);
  
    orderDetails.push(`*Total:* ₹${order.grandTotal.toFixed(2)}`);
    orderDetails.push(`*Items:*\n${itemsList}`);
    
    if (order.notes) orderDetails.push(`*Notes:* ${order.notes}`);

    const businessSignature = [
        `────────────────────────────`,
        `🏷️ *${businessInfo.businessName}*`,
        `_${businessInfo.tagline}_`,
        `🧾 GSTIN: ${businessInfo.gstin}`,
        `👤 Proprietor: ${businessInfo.owner}`,
        `📞 ${businessInfo.contacts.join(' | ')}`,
        `📧 ${businessInfo.email}`,
        `📍 ${businessInfo.address}`,
        `────────────────────────────`,
    ];
    
    return `${orderDetails.join('\n')}\n\n${businessSignature.join('\n')}`;
};

export const sendOrder = async (order: Order): Promise<{ ok: boolean, error?: string }> => {
    console.log('Sending order to Telegram:', order.orderId);
    
    const settings = JSON.parse(window.localStorage.getItem('settings') || '{}');
    const CHAT_ID = settings.chatId || CHAT_ID_FALLBACK;
  
    if (!BOT_TOKEN || !CHAT_ID) {
      console.warn('BOT_TOKEN or CHAT_ID is not configured. Skipping Telegram notification.');
      // Simulate network delay and a successful response for development without credentials
      await new Promise(resolve => setTimeout(resolve, 1000));
      return { ok: true };
    }
  
    const message = formatOrderForTelegram(order);
    const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
  
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: CHAT_ID,
          text: message,
          parse_mode: 'Markdown',
        }),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Telegram API error:', errorData);
        throw new Error(`Telegram API responded with status ${response.status}: ${errorData.description}`);
      }
      
      console.log('Order sent to Telegram successfully:', order.orderId);
      return { ok: true };
  
    } catch (error) {
      console.error('Failed to send order to Telegram:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return { ok: false, error: errorMessage };
    }
  };