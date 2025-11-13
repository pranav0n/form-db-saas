const MIN_DIGITS = 8;
const MAX_DIGITS = 15;
export function sanitizeWhatsappValue(rawValue) {
    if (!rawValue)
        return '';
    return rawValue.replace(/[^\d]/g, '');
}
export function formatWhatsappValue(rawValue) {
    const digitsOnly = sanitizeWhatsappValue(rawValue);
    if (!digitsOnly)
        return '';
    return `+${digitsOnly}`;
}
export function validateWhatsappValue(rawValue) {
    const sanitizedDigits = sanitizeWhatsappValue(rawValue);
    if (!sanitizedDigits) {
        return {
            isValid: false,
            formattedValue: '',
            sanitizedDigits,
            issue: 'Enter a WhatsApp-enabled number.'
        };
    }
    if (sanitizedDigits.length < MIN_DIGITS) {
        return {
            isValid: false,
            formattedValue: '',
            sanitizedDigits,
            issue: `Need at least ${MIN_DIGITS} digits.`
        };
    }
    if (sanitizedDigits.length > MAX_DIGITS) {
        return {
            isValid: false,
            formattedValue: '',
            sanitizedDigits,
            issue: `Keep it under ${MAX_DIGITS} digits.`
        };
    }
    const formattedValue = `+${sanitizedDigits}`;
    return {
        isValid: true,
        formattedValue,
        sanitizedDigits,
        issue: undefined
    };
}
//# sourceMappingURL=whatsapp.js.map