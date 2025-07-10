import type { ForwardedRef } from 'react';

export interface BottomSheetProps {
  duration?: number;
  snapPoints?: Array<number | `${number}%`>;
  initialSnapPoint?: number;
  blocking?: boolean;
  canSwipeClose?: boolean;
  canBackdropClose?: boolean;
  expandOnContentDrag?: boolean;
  open?: boolean; // modelValue in Vue, open in React
  portalTarget?: string | Element; // teleportTo in Vue, portalTarget in React
  portalDefer?: boolean; // teleportDefer in Vue
  headerClassName?: string;
  contentClassName?: string;
  footerClassName?: string;
  children?: React.ReactNode;
  onClose?: () => void;
  ref?: ForwardedRef<{ snapToPoint: (idx: number) => void }>;
} 