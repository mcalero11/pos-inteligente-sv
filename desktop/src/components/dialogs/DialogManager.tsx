import { Button } from "@/components/ui/button";
import { X } from "lucide-preact";
import { dialogRegistry } from "./registry";
import { DialogManagerProps, dialogSizeMap } from "./types";

export default function DialogManager({
  currentDialog,
  onClose,
  openDialog,
}: DialogManagerProps) {
  if (!currentDialog) return null;

  const config = dialogRegistry[currentDialog.type];
  if (!config) return null;

  const DialogComponent = config.component;
  const sizeClass = dialogSizeMap[config.size || "md"];

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />

      {/* Modal */}
      <div
        className={`fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-background border rounded-lg shadow-lg p-6 z-50 ${sizeClass} w-full mx-4 max-h-[80vh] overflow-y-auto`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-primary">{config.title}</h2>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-primary hover:text-primary-hover hover:bg-primary-light"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="dialog-content">
          <DialogComponent
            {...currentDialog.props}
            onClose={onClose}
            openDialog={openDialog}
          />
        </div>
      </div>
    </>
  );
}
