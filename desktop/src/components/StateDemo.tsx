import { Button } from "@/components/ui/button";
import { useAppState, ErrorType } from "@/contexts/AppStateContext";

export default function StateDemo() {
  const { handleError, handleFatalError, state } = useAppState();

  const triggerNetworkError = () => {
    handleError(
      new Error("Failed to connect to server"),
      ErrorType.NETWORK,
      true
    );
  };

  const triggerFatalError = () => {
    handleFatalError(
      new Error("Critical system failure"),
      "Database corruption detected"
    );
  };

  const triggerValidationError = () => {
    handleError(
      "Invalid product barcode format",
      ErrorType.VALIDATION,
      true
    );
  };

  const simulateCrash = () => {
    // Simulate an unhandled error
    throw new Error("Simulated application crash");
  };

  return (
    <div class="p-4 bg-card rounded-lg border">
      <h3 class="text-lg font-semibold mb-4">State Machine Demo</h3>
      <p class="text-sm text-muted-foreground mb-4">
        Estado actual: <span class="font-mono bg-muted px-2 py-1 rounded">{state}</span>
      </p>

      <div class="space-y-2">
        <Button
          onClick={triggerNetworkError}
          variant="outline"
          size="sm"
          class="w-full"
        >
          🌐 Simular Error de Red
        </Button>

        <Button
          onClick={triggerValidationError}
          variant="outline"
          size="sm"
          class="w-full"
        >
          ❌ Simular Error de Validación
        </Button>

        <Button
          onClick={triggerFatalError}
          variant="destructive"
          size="sm"
          class="w-full"
        >
          💥 Simular Error Fatal
        </Button>

        <Button
          onClick={simulateCrash}
          variant="destructive"
          size="sm"
          class="w-full"
        >
          💣 Simular Crash
        </Button>
      </div>
    </div>
  );
} 
