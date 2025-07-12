import type { ForwardedRef } from 'react';
export interface BottomSheetProps {
    duration?: number;
    snapPoints?: Array<number | `${number}%`>;
    initialSnapPoint?: number;
    blocking?: boolean;
    canSwipeClose?: boolean;
    canBackdropClose?: boolean;
    expandOnContentDrag?: boolean;
    open?: boolean;
    portalTarget?: string | Element;
    portalDefer?: boolean;
    headerClassName?: string;
    contentClassName?: string;
    footerClassName?: string;
    footer?: React.ReactNode;
    children?: React.ReactNode;
    onClose?: () => void;
    ref?: ForwardedRef<{
        snapToPoint: (idx: number) => void;
    }>;
}
