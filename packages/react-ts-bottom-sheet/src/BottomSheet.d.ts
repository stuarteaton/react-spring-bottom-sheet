import React from 'react';
import type { BottomSheetProps } from './types';
export declare const BottomSheet: React.ForwardRefExoticComponent<Omit<BottomSheetProps & {
    children?: React.ReactNode;
    sheetStyle?: React.CSSProperties;
    sheetClassName?: string;
    headerStyle?: React.CSSProperties;
    contentStyle?: React.CSSProperties;
    footerStyle?: React.CSSProperties;
    headerClassName?: string;
    contentClassName?: string;
    footerClassName?: string;
}, "ref"> & React.RefAttributes<{
    snapToPoint: (idx: number) => void;
}>>;
