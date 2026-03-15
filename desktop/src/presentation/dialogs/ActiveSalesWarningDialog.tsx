import { useTranslation } from "react-i18next";
import { Button } from "@/shared/ui/button";

interface ActiveSalesWarningDialogProps {
  count: number;
  onClose: () => void;
}

export default function ActiveSalesWarningDialog({
  count,
  onClose,
}: ActiveSalesWarningDialogProps) {
  const { t } = useTranslation("dialogs");

  return (
    <div className="space-y-4">
      <p className="text-muted-foreground">
        {t("active_sales_warning.message", { count })}
      </p>
      <div className="flex justify-end">
        <Button onClick={onClose}>{t("active_sales_warning.confirm")}</Button>
      </div>
    </div>
  );
}
