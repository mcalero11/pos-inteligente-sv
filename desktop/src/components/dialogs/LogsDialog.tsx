export default function LogsDialog() {
  return (
    <div className="space-y-4">
      <p>Activity logs interface would go here.</p>
      <div className="space-y-2">
        <div className="p-3 border rounded text-sm">
          <span className="font-medium">2024-01-15 10:30:25</span> - User login:
          admin
        </div>
        <div className="p-3 border rounded text-sm">
          <span className="font-medium">2024-01-15 10:25:15</span> - Sale
          completed: $45.99
        </div>
        <div className="p-3 border rounded text-sm">
          <span className="font-medium">2024-01-15 10:20:10</span> - Inventory
          updated: Product XYZ
        </div>
      </div>
    </div>
  );
}
