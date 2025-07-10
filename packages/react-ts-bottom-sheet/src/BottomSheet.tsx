import React, { useState, useEffect, useRef, useCallback, useImperativeHandle, forwardRef, Children } from 'react';
import { motion, useMotionValue, useAnimation } from 'framer-motion';
// No react-spring
import type { BottomSheetProps } from './types';
// rubberbandIfOutOfBounds no longer needed
import type { Ref } from 'react';

function getClosestSnapPointIndex(snapPoints: (number | string)[], value: number, windowHeight: number): number {
  let minDiff = Infinity;
  let closestIndex = 0;
  snapPoints.forEach((point, i) => {
    const px = typeof point === 'number' ? (windowHeight * point) / 100 :
      point.endsWith('%') ? (windowHeight * parseFloat(point) / 100) : parseFloat(point as string);
    const diff = Math.abs(px - value);
    if (diff < minDiff) {
      minDiff = diff;
      closestIndex = i;
    }
  });
  return closestIndex;
}

export const BottomSheet = forwardRef<
  { snapToPoint: (idx: number) => void },
  BottomSheetProps & {
    children?: React.ReactNode;
    sheetStyle?: React.CSSProperties;
    sheetClassName?: string;
    headerStyle?: React.CSSProperties;
    contentStyle?: React.CSSProperties;
    footerStyle?: React.CSSProperties;
    headerClassName?: string;
    contentClassName?: string;
    footerClassName?: string;
  }
>(({
  open = false,
  duration = 250,
  snapPoints = [50],
  initialSnapPoint = 0,
  blocking = true,
  canSwipeClose = true,
  canBackdropClose = true,
  headerClassName = '',
  contentClassName = '',
  footerClassName = '',
  headerStyle,
  contentStyle,
  footerStyle,
  children,
  sheetStyle,
  sheetClassName,
  onClose,
}, ref) => {
  const [isVisible, setIsVisible] = useState(open);
  // isAnimating removed
  const [currentSnap, setCurrentSnap] = useState(() => initialSnapPoint);
  const sheetRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);

  // Calculate snap heights
  const windowHeight = typeof window !== 'undefined' ? window.innerHeight : 800;
  const snapHeights = snapPoints.map(point =>
    typeof point === 'number'
      ? (windowHeight * point) / 100
      : point.endsWith('%')
        ? (windowHeight * parseFloat(point) / 100)
        : parseFloat(point as string)
  );
  // Calculate min/max snap points for drag constraints
  const minSnap = Math.min(...snapHeights);
  const maxSnap = Math.max(...snapHeights);

  // React Spring animation
  const controls = useAnimation();
  const height = useMotionValue(snapHeights[initialSnapPoint]);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartY = useRef<number | null>(null);
  const dragStartHeight = useRef<number | null>(null);

  // Snap to point function (like Vue version)
  const snapToPoint = useCallback((idx: number) => {
    if (idx < 0 || idx >= snapHeights.length) return;
    const targetHeight = snapHeights[idx];
    setCurrentSnap(idx);
    controls.start({
      height: targetHeight,
      transition: { type: 'spring', stiffness: 300, damping: 30 }
    });
  }, [snapHeights, controls]);

  // Expose snapToPoint method
  useImperativeHandle(ref, () => ({
    snapToPoint
  }), [snapToPoint]);

  useEffect(() => {
    if (open) {
      setIsVisible(true);
      controls.start({
        height: snapHeights[currentSnap],
        transition: { type: 'spring', stiffness: 300, damping: 30 }
      });
    } else {
      controls.start({
        height: 0,
        transition: { duration: duration / 1000 }
      }).then(() => setIsVisible(false));
    }
  }, [open, currentSnap, snapHeights, duration, controls]);

  // Rubberband function (like Vue)
  function rubberbandIfOutOfBounds(val: number, min: number, max: number, constant = 0.15) {
    if (val < min) {
      return min - (min - val) * constant;
    }
    if (val > max) {
      return max + (val - max) * constant;
    }
    return val;
  }

  // Pointer event handlers for drag
  const handlePointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0) return;
    setIsDragging(true);
    dragStartY.current = e.clientY;
    dragStartHeight.current = height.get();
    window.addEventListener('pointermove', handlePointerMove, { passive: false });
    window.addEventListener('pointerup', handlePointerUp, { passive: false });
  };

  const handlePointerMove = (e: PointerEvent) => {
    if (dragStartY.current === null || dragStartHeight.current === null) return;
    const delta = dragStartY.current - e.clientY;
    let newHeight = dragStartHeight.current + delta;
    newHeight = rubberbandIfOutOfBounds(newHeight, minSnap, maxSnap, 0.15);
    height.set(newHeight);
  };

  const handlePointerUp = () => {
    setIsDragging(false);
    window.removeEventListener('pointermove', handlePointerMove, false);
    window.removeEventListener('pointerup', handlePointerUp, false);
    const finalHeight = height.get();
    // If canSwipeClose and dragged below the lowest snap point, close
    if (canSwipeClose && finalHeight < minSnap - 40 && onClose) {
      onClose();
      return;
    }
    // Snap to closest snap point
    const idx = getClosestSnapPointIndex(snapPoints, finalHeight, windowHeight);
    snapToPoint(idx);
  };

  const handleBackdropClick = () => {
    if (canBackdropClose && onClose) {
      onClose();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape' && onClose) {
      onClose();
    }
  };

  if (!isVisible) return null;

  return (
    <>
      {/* Backdrop */}
      {blocking && (
        <div
          ref={backdropRef}
          onClick={handleBackdropClick}
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            inset: 0,
            pointerEvents: 'auto',
            position: 'fixed',
            userSelect: 'none',
            willChange: 'opacity',
            zIndex: 1,
            opacity: isVisible ? 1 : 0,
            transition: `opacity ${duration}ms ease-in-out`,
          }}
        />
      )}

      {/* Sheet */}
      <motion.div
        ref={sheetRef as Ref<HTMLDivElement>}
        onKeyDown={handleKeyDown}
        tabIndex={-1}
        aria-modal="true"
        className={sheetClassName}
        style={{
          backgroundColor: '#fff',
          borderTopLeftRadius: '16px',
          borderTopRightRadius: '16px',
          borderRight: '1px solid transparent',
          borderLeft: '1px solid transparent',
          bottom: 0,
          display: 'flex',
          flexDirection: 'column',
          left: 0,
          marginLeft: 'auto',
          marginRight: 'auto',
          maxHeight: 'inherit',
          maxWidth: '640px',
          pointerEvents: 'all',
          position: 'fixed',
          right: 0,
          width: '100%',
          willChange: 'height',
          zIndex: 2,
          cursor: isDragging ? 'grabbing' : 'grab',
          userSelect: isDragging ? 'none' : undefined,
          height,
          ...sheetStyle,
        }}
        animate={controls}
        onPointerDown={handlePointerDown}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            width: '100%',
          }}
        >
          {/* Header */}
          <div
            className={headerClassName}
            style={{
              boxShadow: '0 1px 0 rgba(46, 59, 66, 0.125)',
              flexShrink: 0,
              padding: '20px 16px 8px',
              userSelect: 'none',
              zIndex: 3,
              borderTopLeftRadius: '16px',
              borderTopRightRadius: '16px',
              borderTop: '1px solid transparent',
              position: 'sticky',
              top: 0,
              background: '#fff',
              ...headerStyle,
            }}
          >
            <div
              style={{
                backgroundColor: 'rgba(0, 0, 0, 0.28)',
                borderRadius: '2px',
                height: '4px',
                left: '50%',
                position: 'absolute',
                top: '8px',
                transform: 'translateX(-50%)',
                width: '36px',
              }}
            />
          </div>

          {/* Content */}
          <div
            style={{
              flexGrow: 1,
              overflowY: 'auto',
              overscrollBehavior: 'none',
            }}
          >
            <div
              style={{
                height: '100%',
              }}
            >
              <div
                className={contentClassName}
                style={{
                  display: 'grid',
                  padding: '8px 16px',
                  userSelect: 'none',
                  ...contentStyle,
                }}
              >
                {Children.toArray(children)}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div
            className={footerClassName}
            style={{
              boxShadow: '0 -1px 0 rgba(46, 59, 66, 0.125)',
              flexGrow: 0,
              flexShrink: 0,
              padding: '16px 16px',
              userSelect: 'none',
              position: 'sticky',
              bottom: 0,
              background: '#fff',
              ...footerStyle,
            }}
          />
        </div>
      </motion.div>
    </>
  );
});

