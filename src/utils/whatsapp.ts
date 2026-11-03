/**
 * WhatsApp integration utility for GodySell Ghana
 * Formats Ghanaian phone numbers into the clean international format for WhatsApp (wa.me)
 * and generates pre-filled click-to-chat links.
 */

/**
 * Cleans and formats a Ghana phone number into the official WhatsApp format (233XXXXXXXXX).
 * Returns null if the phone number is missing, empty, or cannot be formatted.
 */
export function formatGhanaPhoneForWhatsApp(phone?: string | null): string | null {
  if (!phone || typeof phone !== 'string') return null;

  // Strip all non-digit characters (spaces, dashes, parentheses, +, etc.)
  let digits = phone.replace(/\D/g, '');
  if (!digits || digits.length < 8) return null;

  // Handle leading international access code 00233
  if (digits.startsWith('00233')) {
    digits = digits.slice(2);
  }

  // Handle standard international prefix 233
  if (digits.startsWith('233')) {
    // If user typed 233024..., strip the redundant 0 after 233
    const nationalPart = digits.slice(3).replace(/^0+/, '');
    if (nationalPart.length >= 8) {
      return '233' + nationalPart;
    }
    return null;
  }

  // Handle standard Ghanaian local format (e.g. 0244123456 or 0501234567)
  if (digits.startsWith('0')) {
    const withoutZero = digits.replace(/^0+/, '');
    if (withoutZero.length >= 8) {
      return '233' + withoutZero;
    }
    return null;
  }

  // Handle number entered without leading 0 (e.g. 244123456 - 9 digits)
  if (digits.length === 9) {
    return '233' + digits;
  }

  // Generic fallback if user entered a full international number with 10-15 digits
  if (digits.length >= 9 && digits.length <= 15) {
    return digits;
  }

  return null;
}

/**
 * Generates an official WhatsApp click-to-chat link.
 * Format: https://wa.me/{number}?text={message}
 * Returns null if the phone is missing or invalid so no broken button is displayed.
 */
export function generateWhatsAppLink(
  phone?: string | null,
  productTitle?: string,
  formattedPrice?: string
): string | null {
  const cleanPhone = formatGhanaPhoneForWhatsApp(phone);
  if (!cleanPhone) return null;

  let message = "Hello, I saw your product on GodySell and I'm interested in buying it. Is it still available?";
  if (productTitle) {
    const priceText = formattedPrice ? ` (${formattedPrice})` : '';
    message = `Hello, I saw your product "${productTitle}"${priceText} on GodySell and I'm interested in buying it. Is it still available?`;
  }

  const encodedText = encodeURIComponent(message);
  return `https://wa.me/${cleanPhone}?text=${encodedText}`;
}

/**
 * Extracts and formats the 4-digit membership year (defaults to 2026).
 * Any legacy 2024 or missing years are upgraded to 2026 per platform standard.
 */
export function formatMemberSinceYear(val?: string | null): string {
  if (!val || typeof val !== 'string') {
    return '2026';
  }
  const trimmed = val.trim();
  // Any reference to 2024 or earlier becomes 2026 per user instruction
  if (trimmed.includes('2024') || trimmed === '2024' || trimmed === 'Sep 2024') {
    return '2026';
  }
  // If already exactly 4 digits like "2026"
  if (/^\d{4}$/.test(trimmed)) {
    const year = parseInt(trimmed, 10);
    if (year <= 2024) return '2026';
    return trimmed;
  }
  // If it's a date string like "2026-11-03T...", extract the year
  const match = trimmed.match(/\b(20\d{2})\b/);
  if (match) {
    const year = parseInt(match[1], 10);
    if (year <= 2024) return '2026';
    return match[1];
  }
  return '2026';
}
