export default function InventoryDialog() {
  return (
    <div className="space-y-4">
      <p>Inventory management interface would go here.</p>
      <div className="grid grid-cols-3 gap-4">
        <div className="p-4 border rounded">
          <h3 className="font-medium">Add Product</h3>
          <p className="text-sm text-muted-foreground">Add new inventory</p>
        </div>
        <div className="p-4 border rounded">
          <h3 className="font-medium">Stock Check</h3>
          <p className="text-sm text-muted-foreground">Check current stock</p>
        </div>
        <div className="p-4 border rounded">
          <h3 className="font-medium">Low Stock</h3>
          <p className="text-sm text-muted-foreground">View low stock items</p>
        </div>
      </div>
    </div>
  );
}
