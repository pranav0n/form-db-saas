export type WhatsappSyncStatus = 'idle' | 'invalid' | 'valid' | 'syncing' | 'synced' | 'error';
export interface WhatsappSubmission {
    number: string;
    capturedAt: string;
    source?: string;
}
export interface WhatsappValidationResult {
    isValid: boolean;
    formattedValue: string;
    sanitizedDigits: string;
    issue?: string;
}
export declare function sanitizeWhatsappValue(rawValue: string): string;
export declare function formatWhatsappValue(rawValue: string): string;
export declare function validateWhatsappValue(rawValue: string): WhatsappValidationResult;
//# sourceMappingURL=whatsapp.d.ts.map