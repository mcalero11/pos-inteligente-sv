import { useState, useCallback } from "preact/hooks";
import { DialogState } from "@/components/dialogs/types";

export interface UseDialogReturn {
  currentDialog: DialogState | null;
  isDialogOpen: boolean;
  openDialog: (dialogType: string, props?: any) => void;
  closeDialog: () => void;
  updateDialogProps: (props: any) => void;
}

export function useDialog(): UseDialogReturn {
  const [currentDialog, setCurrentDialog] = useState<DialogState | null>(null);

  const openDialog = useCallback((dialogType: string, props: any = {}) => {
    setCurrentDialog({ type: dialogType, props });
  }, []);

  const closeDialog = useCallback(() => {
    setCurrentDialog(null);
  }, []);

  const updateDialogProps = useCallback((props: any) => {
    setCurrentDialog(prev =>
      prev ? { ...prev, props: { ...prev.props, ...props } } : null
    );
  }, []);

  const isDialogOpen = currentDialog !== null;

  return {
    currentDialog,
    isDialogOpen,
    openDialog,
    closeDialog,
    updateDialogProps
  };
} 
