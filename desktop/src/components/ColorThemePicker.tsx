import { useTheme, ColorTheme } from "@/contexts/ThemeContext";
import { Check } from "lucide-preact";

const colorOptions: Array<{
  name: string;
  value: ColorTheme;
  colorClass: string;
  lightColorClass: string;
}> = [
  {
    name: "Orange",
    value: "orange",
    colorClass: "bg-orange-600",
    lightColorClass: "bg-orange-100",
  },
  {
    name: "Red",
    value: "red",
    colorClass: "bg-red-600",
    lightColorClass: "bg-red-100",
  },
  {
    name: "Rose",
    value: "rose",
    colorClass: "bg-rose-600",
    lightColorClass: "bg-rose-100",
  },
  {
    name: "Green",
    value: "green",
    colorClass: "bg-green-600",
    lightColorClass: "bg-green-100",
  },
  {
    name: "Blue",
    value: "blue",
    colorClass: "bg-blue-600",
    lightColorClass: "bg-blue-100",
  },
  {
    name: "Yellow",
    value: "yellow",
    colorClass: "bg-yellow-500",
    lightColorClass: "bg-yellow-100",
  },
  {
    name: "Violet",
    value: "violet",
    colorClass: "bg-violet-600",
    lightColorClass: "bg-violet-100",
  },
  {
    name: "White",
    value: "white",
    colorClass: "bg-gray-800",
    lightColorClass: "bg-gray-100",
  },
];

export function ColorThemePicker() {
  const { colorTheme, setColorTheme } = useTheme();

  return (
    <div class="space-y-3">
      <label class="text-sm font-medium">Theme Color</label>
      <div class="grid grid-cols-2 gap-3">
        {colorOptions.map((option) => {
          const isSelected = colorTheme === option.value;
          return (
            <button
              key={option.value}
              onClick={() => setColorTheme(option.value)}
              class={`relative p-3 rounded-lg border-2 flex items-center gap-3 text-left transition-all ${
                isSelected
                  ? "border-primary bg-primary-light"
                  : "border-border bg-card hover:border-primary/30 hover:bg-primary-light/30"
              }`}
              data-selected={isSelected}
            >
              <div class="flex items-center gap-2">
                <div
                  class={`w-5 h-5 rounded-full ${option.colorClass} shadow-sm`}
                />
                <div
                  class={`w-3 h-3 rounded-full ${option.lightColorClass} -ml-2 border border-white`}
                />
              </div>
              <div class="flex-1">
                <span class="text-sm font-medium">{option.name}</span>
                {option.value === "yellow" && (
                  <div class="text-xs text-muted-foreground">Dark text</div>
                )}
                {option.value === "white" && (
                  <div class="text-xs text-muted-foreground">Monochrome</div>
                )}
              </div>
              {isSelected && <Check class="w-4 h-4 text-primary ml-auto" />}
            </button>
          );
        })}
      </div>

      <div class="text-xs text-muted-foreground pt-2 border-t">
        <p>
          Theme colors will be applied to buttons, headers, and accent elements
          throughout the application.
        </p>
      </div>
    </div>
  );
}
