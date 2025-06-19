import { useState } from "preact/hooks";
import { invoke } from "@tauri-apps/api/core";
import POSHeader from "@/components/pos/pos-header";
import DialogManager from "@/components/dialogs/DialogManager";
import { DialogState } from "@/components/dialogs/types";
import POSFooter from "@/components/pos/pos-footer";
import POSProducts from "@/components/pos/pos-products";
import POSCart from "@/components/pos/pos-cart";

function POS() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [greetMsg, setGreetMsg] = useState("");
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [name, setName] = useState("");
  const [currentDialog, setCurrentDialog] = useState<DialogState | null>(null);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async function greet() {
    // Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
    setGreetMsg(await invoke("greet", { name }));
  }

  const openDialog = (dialogType: string, props: any = {}) => {
    setCurrentDialog({ type: dialogType, props });
  };

  const closeDialog = () => setCurrentDialog(null);

  return (
    <div class="h-screen bg-muted text-foreground flex flex-col">
      <POSHeader openDialog={openDialog} />

      <main class="flex-1 flex overflow-hidden">
        <POSProducts />
        <POSCart />
      </main>

      <POSFooter openDialog={openDialog} />

      {/* Centralized Dialog System */}
      <DialogManager
        currentDialog={currentDialog}
        onClose={closeDialog}
        openDialog={openDialog}
      />
    </div>
  );
}

export default POS;
