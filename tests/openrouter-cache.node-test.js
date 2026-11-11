import { test } from 'node:test';
import assert from 'node:assert/strict';
import { getOpenRouterCacheRouting, usesImplicitCachingOnly } from '../src/openrouter-cache.js';

test('fallback preference survives an empty provider list', () => {
    assert.deepEqual(getOpenRouterCacheRouting({ provider: [], allow_fallbacks: false }, 'alice'), { provider: { allow_fallbacks: false } });
});
test('provider ordering and default fallback behavior are retained', () => {
    assert.deepEqual(getOpenRouterCacheRouting({ provider: ['Google'] }, 'alice'), { provider: { allow_fallbacks: true, order: ['Google'] } });
    assert.deepEqual(getOpenRouterCacheRouting({}, 'alice'), {});
});
test('conversation routing is stable, isolated by chat and user, and hides chat names', () => {
    const route = (user, chat) => getOpenRouterCacheRouting({ chat_id: chat }, user).session_id;
    assert.equal(route('alice', 'private-chat'), route('alice', 'private-chat'));
    assert.notEqual(route('alice', 'private-chat'), route('alice', 'other-chat'));
    assert.notEqual(route('alice', 'private-chat'), route('bob', 'private-chat'));
    assert.match(route('alice', 'private-chat'), /^[a-f0-9]{64}$/);
    assert.equal(route('alice', ''), undefined);
    assert.equal(route('alice', {}), undefined);
    assert.equal(route('alice', 'a'.repeat(4097)), undefined);
});
test('only Argon and Carbon variants bypass explicit caching', () => {
    assert.equal(usesImplicitCachingOnly('google/gemini-4-argon'), true);
    assert.equal(usesImplicitCachingOnly('google/gemini-4-argon:free'), true);
    assert.equal(usesImplicitCachingOnly('google/gemini-4-carbon'), true);
    assert.equal(usesImplicitCachingOnly('google/gemini-4-carbon:batch'), true);
    assert.equal(usesImplicitCachingOnly('google/gemini-4-carbon-other'), false);
    assert.equal(usesImplicitCachingOnly('google/gemini-4-neon'), false);
    assert.equal(usesImplicitCachingOnly('google/gemini-2.5-pro'), false);
    assert.equal(usesImplicitCachingOnly('anthropic/claude-sonnet-4'), false);
    assert.equal(usesImplicitCachingOnly('google/gemini-4-argon-other'), false);
});
