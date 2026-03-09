/**
 * Mouse Store with rAF batching, normalized coordinates, and accessibility detection.
 * Provides a pub/sub interface for cursor tracking across components.
 */

export interface MouseState {
  x: number; // Raw screen X
  y: number; // Raw screen Y
  nx: number; // Normalized X: -1 (left) to +1 (right)
  ny: number; // Normalized Y: -1 (bottom) to +1 (top)
  isTouch: boolean; // True if touch device detected
  prefersReducedMotion: boolean; // True if user prefers reduced motion
}

type Callback = (state: MouseState) => void;

// Internal state - singleton
const state: MouseState = {
  x: 0,
  y: 0,
  nx: 0,
  ny: 0,
  isTouch: false,
  prefersReducedMotion: false,
};

const subscribers = new Set<Callback>();
let initialized = false;
let rafId: number | null = null;
let pendingUpdate = false;

// Detect touch and reduced motion preferences
function detectCapabilities(): void {
  if (typeof window === "undefined") return;

  // Touch detection: check for touch points or coarse pointer
  state.isTouch =
    "ontouchstart" in window ||
    navigator.maxTouchPoints > 0 ||
    window.matchMedia("(pointer: coarse)").matches;

  // Reduced motion preference
  const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  state.prefersReducedMotion = motionQuery.matches;

  // Listen for changes to reduced motion preference
  motionQuery.addEventListener("change", (e) => {
    state.prefersReducedMotion = e.matches;
    notifySubscribers();
  });
}

// Batch notifications via rAF to avoid per-event spam
function scheduleNotify(): void {
  if (pendingUpdate) return;
  pendingUpdate = true;

  rafId = requestAnimationFrame(() => {
    pendingUpdate = false;
    notifySubscribers();
  });
}

function notifySubscribers(): void {
  for (const cb of subscribers) {
    cb(state);
  }
}

// Update state from pointer event
function handlePointerMove(e: PointerEvent): void {
  state.x = e.clientX;
  state.y = e.clientY;

  // Normalize: nx ∈ [-1, 1], ny ∈ [-1, 1] (Y flipped for 3D convention)
  const width = window.innerWidth;
  const height = window.innerHeight;

  state.nx = (e.clientX / width) * 2 - 1;
  state.ny = -((e.clientY / height) * 2 - 1); // Flip Y: top = +1

  scheduleNotify();
}

// Touch fallback - use first touch point
function handleTouchMove(e: TouchEvent): void {
  if (e.touches.length === 0) return;
  const touch = e.touches[0];

  state.x = touch.clientX;
  state.y = touch.clientY;
  state.nx = (touch.clientX / window.innerWidth) * 2 - 1;
  state.ny = -((touch.clientY / window.innerHeight) * 2 - 1);
  state.isTouch = true;

  scheduleNotify();
}

// Initialize listeners (lazy, on first subscribe)
function init(): void {
  if (initialized || typeof window === "undefined") return;
  initialized = true;

  detectCapabilities();

  // Use passive listeners for performance
  window.addEventListener("pointermove", handlePointerMove, { passive: true });
  window.addEventListener("touchmove", handleTouchMove, { passive: true });
}

// Cleanup (for SSR or manual teardown)
function cleanup(): void {
  if (!initialized || typeof window === "undefined") return;

  window.removeEventListener("pointermove", handlePointerMove);
  window.removeEventListener("touchmove", handleTouchMove);

  if (rafId !== null) {
    cancelAnimationFrame(rafId);
    rafId = null;
  }

  subscribers.clear();
  initialized = false;
}

/**
 * Subscribe to mouse updates. Returns an unsubscribe function.
 * @param cb - Callback receiving MouseState on each update
 */
function subscribe(cb: Callback): () => void {
  init();
  subscribers.add(cb);

  // Immediately call with current state
  cb(state);

  return () => {
    subscribers.delete(cb);
    // Cleanup if no subscribers remain
    if (subscribers.size === 0) {
      cleanup();
    }
  };
}

/**
 * Get current mouse state snapshot (non-reactive)
 */
function getState(): Readonly<MouseState> {
  return state;
}

export const mouse = {
  subscribe,
  getState,
  cleanup,
};
