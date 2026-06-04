import { TouchEvent, useState } from "react";

interface SwipeCallbacks {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
}

interface SwipeHandlers {
  onTouchStart: (e: TouchEvent) => void;
  onTouchMove: (e: TouchEvent) => void;
  onTouchEnd: () => void;
}

export const useSwipe = (callbacks: SwipeCallbacks, threshold = 60): SwipeHandlers => {
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);
  const [touchEnd, setTouchEnd] = useState<{ x: number; y: number } | null>(null);

  const onTouchStart = (e: TouchEvent) => {
    setTouchEnd(null); // Reset
    setTouchStart({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY,
    });
  };

  const onTouchMove = (e: TouchEvent) => {
    setTouchEnd({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY,
    });
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const diffX = touchStart.x - touchEnd.x;
    const diffY = touchStart.y - touchEnd.y;

    // Check if horizontal movement is greater than vertical movement (ignore scrolling)
    if (Math.abs(diffX) > Math.abs(diffY)) {
      if (Math.abs(diffX) > threshold) {
        if (diffX > 0) {
          // Swiped left (finger moves right to left -> next day / forward)
          callbacks.onSwipeLeft?.();
        } else {
          // Swiped right (finger moves left to right -> previous day / backward)
          callbacks.onSwipeRight?.();
        }
      }
    } else {
      if (Math.abs(diffY) > threshold) {
        if (diffY > 0) {
          // Swiped up
          callbacks.onSwipeUp?.();
        } else {
          // Swiped down
          callbacks.onSwipeDown?.();
        }
      }
    }

    // Reset
    setTouchStart(null);
    setTouchEnd(null);
  };

  return {
    onTouchStart,
    onTouchMove,
    onTouchEnd,
  };
};
