import React, { useState, useEffect, useRef, useCallback, useImperativeHandle, forwardRef } from 'react';
import { useSpring, animated } from '@react-spring/web';
import type { BottomSheetProps } from './types';
import { rubberbandIfOutOfBounds } from './rubberbandIfOutOfBounds';

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

export const BottomSheet = forwardRef<{ snapToPoint: (idx: number) => void }, BottomSheetProps>(({
  open = false,
  duration = 250,
  snapPoints = [50],
  initialSnapPoint = 0,
  blocking = true,
  canSwipeClose = true,
  canBackdropClose = true,
  expandOnContentDrag = true,
  headerClassName = '',
  contentClassName = '',
  footerClassName = '',
  children,
  onClose,
  ...props
}, ref) => {
  const [isVisible, setIsVisible] = useState(open);
  const [isAnimating, setIsAnimating] = useState(false);
  const [currentSnap, setCurrentSnap] = useState(() => initialSnapPoint);
  const sheetRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);

  // Drag state refs
  const dragStartY = useRef<number | null>(null);
  const dragStartHeight = useRef<number | null>(null);
  const dragOffset = useRef<number | null>(null);

  // Calculate snap heights
  const windowHeight = typeof window !== 'undefined' ? window.innerHeight : 800;
  const snapHeights = snapPoints.map(point =>
    typeof point === 'number'
      ? (windowHeight * point) / 100
      : point.endsWith('%')
        ? (windowHeight * parseFloat(point) / 100)
        : parseFloat(point as string)
  );

  // React Spring animation
  const [springs, api] = useSpring(() => ({
    height: snapHeights[initialSnapPoint],
    y: snapHeights[initialSnapPoint],
    config: { 
      tension: 300, 
      friction: 30,
      duration: duration 
    }
  }));

  // Snap to point function (like Vue version)
  const snapToPoint = useCallback((idx: number) => {
    if (idx < 0 || idx >= snapHeights.length) return;
    
    const targetHeight = snapHeights[idx];
    setCurrentSnap(idx);
    
    api.start({
      height: targetHeight,
      y: 0,
      onRest: () => {
        console.log('[BottomSheet] Snapped to point', idx);
      }
    });
  }, [snapHeights, api]);

  // Expose snapToPoint method
  useImperativeHandle(ref, () => ({
    snapToPoint
  }), [snapToPoint]);

  useEffect(() => {
    if (open) {
      setIsVisible(true);
      setIsAnimating(true);
      api.start({
        height: snapHeights[currentSnap],
        y: 0,
        onRest: () => setIsAnimating(false)
      });
    } else {
      setIsAnimating(true);
      api.start({
        y: snapHeights[currentSnap],
        onRest: () => setIsVisible(false)
      });
    }
  }, [open, currentSnap, snapHeights, api]);

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

  // Helper to check if an element is interactive
  function isInteractiveElement(target: EventTarget | null): boolean {
    if (!(target instanceof HTMLElement)) return false;
    const tag = target.tagName.toLowerCase();
    return (
      tag === 'button' ||
      tag === 'input' ||
      tag === 'textarea' ||
      tag === 'select' ||
      tag === 'a' ||
      target.isContentEditable
    );
  }

  const onPointerMove = useCallback((e: PointerEvent) => {
    if (dragStartY.current === null || dragStartHeight.current === null) return;
    const delta = e.clientY - dragStartY.current;
    let newHeight = dragStartHeight.current - delta;
    
    // Apply rubberband effect if out of bounds
    newHeight = rubberbandIfOutOfBounds(newHeight, Math.min(...snapHeights), Math.max(...snapHeights), 0.15);
    
    dragOffset.current = newHeight;
    api.start({ height: newHeight, immediate: true });
  }, [snapHeights, api]);

  const onPointerUp = useCallback(() => {
    if (dragOffset.current !== null) {
      // If canSwipeClose and dragged below the lowest snap point, close
      if (canSwipeClose && dragOffset.current < Math.min(...snapHeights) - 40 && onClose) {
        dragOffset.current = null;
        dragStartY.current = null;
        dragStartHeight.current = null;
        window.removeEventListener('pointermove', onPointerMove, false);
        window.removeEventListener('pointerup', onPointerUp, false);
        onClose();
        return;
      }
      
      // Snap to closest snap point
      const idx = getClosestSnapPointIndex(snapPoints, dragOffset.current, windowHeight);
      snapToPoint(idx);
    }
    
    dragOffset.current = null;
    dragStartY.current = null;
    dragStartHeight.current = null;
    window.removeEventListener('pointermove', onPointerMove, false);
    window.removeEventListener('pointerup', onPointerUp, false);
  }, [canSwipeClose, onClose, onPointerMove, snapPoints, snapHeights, windowHeight, snapToPoint]);

  const onPointerDown = (e: React.PointerEvent) => {
    if (isInteractiveElement(e.target)) return;
    e.preventDefault();
    if (e.button !== 0) return;
    
    dragStartY.current = e.clientY;
    dragStartHeight.current = sheetRef.current?.getBoundingClientRect().height ?? snapHeights[currentSnap];
    dragOffset.current = dragStartHeight.current;
    
    window.addEventListener('pointermove', onPointerMove, { passive: false });
    window.addEventListener('pointerup', onPointerUp, { passive: false });
  };

  if (!isVisible) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        overflow: 'hidden',
        pointerEvents: blocking ? 'none' : 'auto',
        zIndex: 9999,
        visibility: 'visible',
      }}
    >
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
            opacity: isAnimating ? 0 : 1,
            transition: `opacity ${duration}ms ease-in-out`,
          }}
        />
      )}

      {/* Sheet */}
      <animated.div
        ref={sheetRef}
        onKeyDown={handleKeyDown}
        tabIndex={-1}
        aria-modal="true"
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
          willChange: 'transform, height',
          zIndex: 2,
          cursor: 'grab',
          userSelect: dragOffset.current !== null ? 'none' : undefined,
          ...springs,
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
          }}
          onPointerDown={onPointerDown}
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
          onPointerDown={onPointerDown}
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
              }}
            >
              {children}
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
          }}
        />
      </animated.div>
    </div>
  );
});

