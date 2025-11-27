/**
 * Farcaster MiniApp Context Types
 *
 * Unified type definitions for the global Farcaster context provider.
 * Used across all components for consistent SDK access.
 */

export interface FarcasterUser {
  fid: number | null;
  username: string | null;
  displayName: string | null;
  pfpUrl: string | null;
}

export interface FarcasterSafeAreaInsets {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

export interface FarcasterClient {
  safeAreaInsets: FarcasterSafeAreaInsets;
}

export interface ComposeCastResult {
  success: boolean;
  hash?: string;
}

export interface FarcasterActions {
  /**
   * Compose and post a cast to Farcaster
   * In MiniApp: uses sdk.actions.composeCast()
   * In Web: falls back to warpcast.com URL
   */
  composeCast: (text: string, embeds?: string[]) => Promise<ComposeCastResult>;

  /**
   * Open a URL
   * In MiniApp: uses sdk.actions.openUrl() (stays in app)
   * In Web: uses window.open()
   */
  openUrl: (url: string) => Promise<void>;

  /**
   * Signal that the app is ready (removes splash screen)
   * Only effective in MiniApp mode
   */
  ready: () => void;
}

export interface FarcasterContextValue {
  /** True when running inside Farcaster MiniApp (Warpcast) */
  isFarcaster: boolean;

  /** True when SDK detection is complete and context is available */
  isReady: boolean;

  /** User information from Farcaster (null in web mode or if not authenticated) */
  user: FarcasterUser | null;

  /** Client information including safe area insets for mobile layout */
  client: FarcasterClient | null;

  /** Actions for interacting with Farcaster SDK */
  actions: FarcasterActions;
}

/**
 * Default context value for SSR and initial render
 */
export const defaultFarcasterContext: FarcasterContextValue = {
  isFarcaster: false,
  isReady: false,
  user: null,
  client: null,
  actions: {
    composeCast: async () => ({ success: false }),
    openUrl: async () => {},
    ready: () => {},
  },
};
