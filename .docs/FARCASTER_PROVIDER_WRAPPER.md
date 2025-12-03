# Farcaster Provider Wrapper - Hybrid Architecture

## Overview
This document explains the hybrid WebApp + MiniApp architecture for Farcaster integration.

## Architecture

### Why Hybrid Mode?
- **WebApp**: Normal browser access without Farcaster SDK overhead
- **MiniApp**: Warpcast iframe with full Farcaster SDK integration

### Provider Separation
```
Web Mode:
  <Providers>           ← OnchainConnect + Neynar + Audio
    <WebScreen />
  </Providers>

MiniApp Mode:
  <MiniAppClientProviders>
    <FarcasterProvider>   ← SDK initialization wrapper
      <OnchainConnect>
        <NeynarContextProvider>
          <AudioProvider>
            <MiniAppScreen />
          </AudioProvider>
        </NeynarContextProvider>
      </OnchainConnect>
    </FarcasterProvider>
  </MiniAppClientProviders>
```

### Detection
Uses official `sdk.isInMiniApp()` method instead of fragile iframe checks.

### sdk.ready() Timing
**CRITICAL**: `sdk.actions.ready()` MUST fire:
1. AFTER hydration is complete
2. INSIDE MiniAppScreen component
3. ONCE only (use useRef guard)

```typescript
// Correct: In MiniAppScreen.tsx
useEffect(() => {
  if (!isReady || !isFarcaster) return;
  if (!sentReady.current) {
    sentReady.current = true;
    sdk.actions.ready();
  }
}, [isReady, isFarcaster]);
```

## Common Issues

### Splash Stuck
**Cause**: `sdk.ready()` fired before hydration or SDK initialization
**Fix**: Ensure FarcasterProvider wraps app, ready() in useEffect with guards

### SDK Context Undefined
**Cause**: Accessing `sdk.context` without proper initialization
**Fix**: Always use `sdk.isInMiniApp()` before accessing context

## File Structure
```
app/
  layout.tsx            ← Server-only (metadata)
  page.tsx              ← Hybrid switch
  (web)/
    WebScreen.tsx       ← Web UI
  (miniapp)/
    FarcasterProvider.tsx
    MiniAppClientProviders.tsx
    MiniAppScreen.tsx   ← sdk.ready() here

hooks/
  useFarcasterContext.ts ← Detection via sdk.isInMiniApp()

lib/
  providers.tsx         ← Web mode providers
```

## Hybrid Flow

### Web Browser
1. `useFarcasterContext()` → `isFarcaster: false`
2. Loads `<Providers>` + `<WebScreen />`
3. No splash, no Farcaster SDK
4. Full DApp UX with wallet connect

### Farcaster MiniApp
1. `sdk.isInMiniApp()` → true
2. SDK context loaded
3. `isFarcaster: true`
4. `<MiniAppClientProviders>` hydrates
5. Wagmi + OnchainConnect ready
6. `sdk.ready()` fires AFTER hydration
7. Warpcast splash disappears
8. MiniApp UI loads instantly

## References
- [Farcaster MiniApp SDK](https://docs.farcaster.xyz/miniapps)
- See `.docs/log.md` for detailed issue history
