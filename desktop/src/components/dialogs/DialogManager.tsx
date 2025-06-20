import { Dialog } from "@/components/ui/dialog";
import { getDialogRegistry } from "./registry";
import { DialogManagerProps } from "./types";
import { usePOSTranslation } from "@/hooks/use-pos-translation";

// Map dialog sizes to Dialog component sizes
const sizeMap = {
  xs: "sm" as const,
  sm: "sm" as const,
  md: "md" as const,
  lg: "lg" as const,
  xl: "xl" as const,
  "2xl": "xl" as const,
  "3xl": "xl" as const,
  "4xl": "xl" as const,
};

export default function DialogManager({
  currentDialog,
  onClose,
  openDialog,
}: DialogManagerProps) {
  const { t } = usePOSTranslation();

  if (!currentDialog) return null;

  const dialogRegistry = getDialogRegistry(t);
  const config = dialogRegistry[currentDialog.type];
  if (!config) return null;

  const DialogComponent = config.component;
  const dialogSize = sizeMap[config.size || "md"];

  return (
    <Dialog
      isOpen={true}
      onClose={onClose}
      title={config.title}
      size={dialogSize}
    >
      <DialogComponent
        {...currentDialog.props}
        onClose={onClose}
        openDialog={openDialog}
      />
    </Dialog>
  );
}
