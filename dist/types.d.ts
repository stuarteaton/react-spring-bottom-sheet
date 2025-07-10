export interface BottomSheetProps {
    open?: boolean;
    duration?: number;
    snapPoints?: (number | string)[];
    initialSnapPoint?: number;
    blocking?: boolean;
    canSwipeClose?: boolean;
    canBackdropClose?: boolean;
    onClose?: () => void;
}
