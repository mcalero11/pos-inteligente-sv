export default function CustomerDialog() {
  return (
    <div className="space-y-4">
      <p>Customer management interface would go here.</p>
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 border rounded">
          <h3 className="font-medium">Add Customer</h3>
          <p className="text-sm text-muted-foreground">Create new customer</p>
        </div>
        <div className="p-4 border rounded">
          <h3 className="font-medium">Search Customers</h3>
          <p className="text-sm text-muted-foreground">
            Find existing customers
          </p>
        </div>
      </div>
    </div>
  );
}
