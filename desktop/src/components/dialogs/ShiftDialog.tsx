export default function ShiftDialog() {
  return (
    <div className="space-y-4">
      <p>Shift management interface would go here.</p>
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 border rounded">
          <h3 className="font-medium">Start Shift</h3>
          <p className="text-sm text-muted-foreground">Begin work shift</p>
        </div>
        <div className="p-4 border rounded">
          <h3 className="font-medium">End Shift</h3>
          <p className="text-sm text-muted-foreground">Close work shift</p>
        </div>
      </div>
    </div>
  );
}
