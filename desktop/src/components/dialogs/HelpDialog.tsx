export default function HelpDialog() {
  return (
    <div className="space-y-4">
      <h3 className="font-medium">Keyboard Shortcuts</h3>
      <div className="space-y-2">
        <div className="flex justify-between p-2 border rounded">
          <span>F6</span>
          <span>Toggle Help</span>
        </div>
        <div className="flex justify-between p-2 border rounded">
          <span>F7</span>
          <span>Customer Management</span>
        </div>
        <div className="flex justify-between p-2 border rounded">
          <span>Ctrl+I</span>
          <span>Inventory</span>
        </div>
        <div className="flex justify-between p-2 border rounded">
          <span>Ctrl+S</span>
          <span>Settings</span>
        </div>
      </div>
    </div>
  );
}
