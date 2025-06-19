export default function UserDialog() {
  return (
    <div className="space-y-4">
      <p>User management interface would go here.</p>
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 border rounded">
          <h3 className="font-medium">Add User</h3>
          <p className="text-sm text-muted-foreground">
            Create new user account
          </p>
        </div>
        <div className="p-4 border rounded">
          <h3 className="font-medium">User Permissions</h3>
          <p className="text-sm text-muted-foreground">Manage user roles</p>
        </div>
      </div>
    </div>
  );
}
