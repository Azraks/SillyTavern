# Gemini and OpenRouter cache maintenance branch

This branch preserves OpenRouter routing fixes and the implicit-cache-only handling for Gemini 4 Argon. It is based on the local `staging` checkout. Cache hit rates still depend on stable prompt prefixes, provider behavior, and cache retention; these changes do not guarantee a particular hit rate.

## Changes

- Send a stable per-user, per-chat SHA-256 session identifier to OpenRouter. Chat names are not sent as the identifier.
- Forward an explicit `allow_fallbacks` preference even when the provider order is empty.
- Skip explicit cache markers and explicit-cache model metadata checks for the Argon model alias and its colon variants. Other Gemini model behavior remains unchanged.
- Preserve the existing cleanup that omits an unspecified Claude cache TTL. JSON serialization already omitted undefined values; this cleanup is not a cache hit-rate fix.

## Prompt configuration

Keep stable character descriptions and writing rules ahead of the changing conversation. A Character's Note or Author's Note injected at a moving depth can change the previously submitted history. Migrate such rules deliberately, preserving the intended role and character-specific wording. Changing note defaults does not override metadata already saved in existing chats.

Personal characters, chats, presets, server ports, credentials, cost exports, and local repair backups are not part of this branch's commits.

## Offline validation

Requires an existing Node.js 20+ installation. No new dependencies are required:

```sh
node --test tests/openrouter-cache.node-test.js
node --check src/endpoints/backends/chat-completions.js
node --check public/scripts/openai.js
git diff --check
```

The tests cover empty provider orders, fallback settings, stable and isolated session IDs, and Argon alias matching. They do not make network requests or test provider-side cache retention. Full browser prompt assembly has not been verified by these unit tests.

## Updating

Keep the upstream repository as a separate remote and merge or rebase its `staging` branch into this branch after reviewing upstream changes. Avoid an unattended update script while unrelated local modifications remain in the checkout.

References:

- https://openrouter.ai/docs/guides/best-practices/prompt-caching
- https://docs.cloud.google.com/gemini-enterprise-agent-platform/models/gemini/4-argon
