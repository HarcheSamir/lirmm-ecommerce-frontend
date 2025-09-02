// A simple, dependency-free mapping of ISO currency codes to Unicode flag emojis.
const flagMap = {
    USD: '🇺🇸', EUR: '🇪🇺', JPY: '🇯🇵', GBP: '🇬🇧', AUD: '🇦🇺',
    CAD: '🇨🇦', CHF: '🇨🇭', CNY: '🇨🇳', SEK: '🇸🇪', NZD: '🇳🇿',
    MXN: '🇲🇽', SGD: '🇸🇬', HKD: '🇭🇰', NOK: '🇳🇴', KRW: '🇰🇷',
    TRY: '🇹🇷', RUB: '🇷🇺', INR: '🇮🇳', BRL: '🇧🇷', ZAR: '🇿🇦',
    DZD: '🇩🇿', SAR: '🇸🇦', AED: '🇦🇪', EGP: '🇪🇬',
    // Add more as needed
};

/**
 * Returns a Unicode flag emoji for a given ISO 4217 currency code.
 * @param {string} code The 3-letter uppercase currency code.
 * @returns {string} The flag emoji, or a default symbol if not found.
 */
export const getCurrencyFlag = (code) => {
    return flagMap[code] || '🏳️'; // Default to a white flag
};