import { createHash } from 'node:crypto';

/**
 * Gemini 4 Argon and Gemini 4 Carbon support implicit caching only. Do not attach
 * explicit cache markers or block their requests on an explicit-cache capability lookup.
 * @param {string} model Model ID
 * @returns {boolean}
 */
export function usesImplicitCachingOnly(model) {
    return /^google\/gemini-4-(?:argon|carbon)(?::[^\s]+)?$/.test(model);
}

/**
 * Preserve an explicit fallback preference even without a provider order.
 * Hash the user/chat pair so conversation names are not sent as session IDs.
 * @param {object} request Generation parameters
 * @param {string} userHandle Local user handle
 * @returns {object} OpenRouter routing fields
 */
export function getOpenRouterCacheRouting(request, userHandle) {
    const result = {};
    const order = Array.isArray(request.provider) ? request.provider.filter(value => typeof value === 'string' && value.length > 0) : [];
    if (order.length > 0 || typeof request.allow_fallbacks === 'boolean') {
        result.provider = { allow_fallbacks: request.allow_fallbacks ?? true };
        if (order.length > 0) {
            result.provider.order = order;
        }
    }
    if (typeof request.chat_id === 'string' && request.chat_id.trim().length > 0 && request.chat_id.length <= 4096) {
        result.session_id = createHash('sha256').update(JSON.stringify([userHandle, request.chat_id])).digest('hex');
    }
    return result;
}
