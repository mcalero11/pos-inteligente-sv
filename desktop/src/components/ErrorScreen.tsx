import POS from "@/windows/POS";
import ErrorDialog from "@/components/dialogs/ErrorDialog";
import DialogManager from "@/components/dialogs/DialogManager";
import { useDialog } from "@/hooks/use-dialog";

interface ErrorScreenProps {
  showPOSBackground?: boolean;
}

export default function ErrorScreen({ showPOSBackground = false }: ErrorScreenProps) {
  const { currentDialog, openDialog, closeDialog } = useDialog();

  return (
    <div class="h-screen bg-muted text-foreground flex flex-col">
      {/* Show the POS interface in background for recoverable errors */}
      {showPOSBackground && <POS />}

      {/* Error Dialog Overlay */}
      <ErrorDialog
        onClose={showPOSBackground ? closeDialog : undefined}
        openDialog={openDialog}
      />

      {/* Dialog Manager for additional dialogs (like logs) */}
      <DialogManager
        currentDialog={currentDialog}
        onClose={closeDialog}
        openDialog={openDialog}
      />
    </div>
  );
} 
