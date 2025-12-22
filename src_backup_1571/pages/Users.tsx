import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, MoreHorizontal } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { DataTable, Column } from '@/components/common/DataTable';
import { CompactModal } from '@/components/common/CompactModal';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { StatusBadge } from '@/components/common/StatusBadge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { User, UserRole } from '@/types';
import { formatDate } from '@/lib/formatters';
import { api } from '@/lib/api';

const roles: UserRole[] = ['Admin', 'BD', 'Sales', 'Telecaller', 'Intern'];

export default function Users() {
  const { toast } = useToast();
  const { hasPermission, currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<string>('full_name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<Partial<User> & { password?: string }>({});

  const limit = 10;

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const data = await api.getUsers();
      setUsers(data);
    } catch (error) {
      console.error('Failed to fetch users:', error);
      toast({ title: 'Error', description: 'Failed to load users', variant: 'destructive' });
    }
  };

  // Only Admin can access this page
  if (currentUser?.role !== 'Admin') {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Access denied. Admin only.</p>
        </div>
      </AppLayout>
    );
  }

  const filteredData = users.filter(u => {
    if (!search) return true;
    const q = search.toLowerCase();
    return u.full_name?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q) ||
      u.role?.toLowerCase().includes(q);
  }).sort((a, b) => {
    const aVal = a[sortKey as keyof User];
    const bVal = b[sortKey as keyof User];
    const modifier = sortDirection === 'asc' ? 1 : -1;
    if (typeof aVal === 'string' && typeof bVal === 'string') {
      return aVal.localeCompare(bVal) * modifier;
    }
    return 0;
  });

  const paginatedData = filteredData.slice((page - 1) * limit, page * limit);

  const columns: Column<User>[] = [
    { key: 'user_id', header: 'ID', className: 'w-14' },
    {
      key: 'full_name',
      header: 'Name',
      sortable: true,
      render: (row) => <span className="font-medium">{row.full_name}</span>
    },
    {
      key: 'role',
      header: 'Role',
      render: (row) => (
        <Badge variant="outline" className="text-2xs">{row.role}</Badge>
      )
    },
    { key: 'email', header: 'Email' },
    { key: 'phone', header: 'Phone' },
    {
      key: 'status',
      header: 'Status',
      render: (row) => <StatusBadge status={row.status} type="user" />
    },
    {
      key: 'created_date',
      header: 'Created',
      sortable: true,
      render: (row) => formatDate(row.created_date)
    },
    {
      key: 'actions',
      header: '',
      className: 'w-10',
      render: (row) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-7 w-7">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-32">
            <DropdownMenuItem onClick={() => handleEdit(row)} className="text-xs">
              <Pencil className="h-3 w-3 mr-2" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => handleDelete(row)}
              className="text-xs text-destructive"
              disabled={row.user_id === currentUser?.user_id}
            >
              <Trash2 className="h-3 w-3 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    }
  ];

  const handleEdit = (user: User | null) => {
    setSelectedUser(user);
    setFormData(user || {
      full_name: '',
      email: '',
      phone: '',
      role: 'Intern',
      status: 'Active',
      password: '', // Initialize password field
    });
    setEditModalOpen(true);
  };

  const handleDelete = (user: User) => {
    setSelectedUser(user);
    setDeleteDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.full_name || !formData.email) {
      toast({ title: 'Error', description: 'Name and email are required', variant: 'destructive' });
      return;
    }

    if (!selectedUser && !formData.password) {
      toast({ title: 'Error', description: 'Password is required for new users', variant: 'destructive' });
      return;
    }

    try {
      if (selectedUser) {
        await api.updateUser(selectedUser.user_id, formData);
        toast({ title: 'User updated successfully' });
      } else {
        await api.createUser(formData);
        toast({ title: 'User created successfully' });
      }
      await fetchUsers(); // Refresh list
      setEditModalOpen(false);
    } catch (error) {
      console.error('Save user error:', error);
      toast({ title: 'Error', description: 'Failed to save user', variant: 'destructive' });
    }
  };

  const handleConfirmDelete = async () => {
    if (selectedUser) {
      try {
        await api.deleteUser(selectedUser.user_id);
        toast({ title: 'User deleted' });
        await fetchUsers();
      } catch (error) {
        console.error('Delete user error:', error);
        toast({ title: 'Error', description: 'Failed to delete user', variant: 'destructive' });
      }
    }
    setDeleteDialogOpen(false);
  };

  return (
    <AppLayout>
      <div className="space-y-4 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-foreground">Users</h1>
            <p className="text-sm text-muted-foreground">Manage team members and roles</p>
          </div>
          <Button size="sm" className="h-8 text-xs" onClick={() => handleEdit(null)}>
            <Plus className="h-3.5 w-3.5 mr-1.5" />
            Add User
          </Button>
        </div>

        <DataTable
          data={paginatedData}
          columns={columns}
          total={filteredData.length}
          page={page}
          limit={limit}
          onPageChange={setPage}
          onSearch={setSearch}
          onSort={(key, dir) => { setSortKey(key); setSortDirection(dir); }}
          sortKey={sortKey}
          sortDirection={sortDirection}
          idKey="user_id"
          emptyMessage="No users found"
        />

        {/* Edit Modal */}
        <CompactModal
          open={editModalOpen}
          onOpenChange={setEditModalOpen}
          title={selectedUser ? 'Edit User' : 'Add User'}
          size="sm"
        >
          <div className="space-y-3">
            <div>
              <Label className="text-xs">Full Name *</Label>
              <Input
                value={formData.full_name || ''}
                onChange={e => setFormData({ ...formData, full_name: e.target.value })}
                className="h-8 text-sm mt-1"
              />
            </div>
            <div>
              <Label className="text-xs">Email *</Label>
              <Input
                type="email"
                value={formData.email || ''}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                className="h-8 text-sm mt-1"
              />
            </div>

            {/* Password Field */}
            <div>
              <Label className="text-xs">{selectedUser ? 'New Password (leave blank to keep current)' : 'Password *'}</Label>
              <Input
                type="password"
                value={formData.password || ''}
                onChange={e => setFormData({ ...formData, password: e.target.value })}
                className="h-8 text-sm mt-1"
                placeholder={selectedUser ? '********' : 'Enter password'}
              />
            </div>

            <div>
              <Label className="text-xs">Phone</Label>
              <Input
                value={formData.phone || ''}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                className="h-8 text-sm mt-1"
              />
            </div>
            <div>
              <Label className="text-xs">Role</Label>
              <Select
                value={formData.role || 'Intern'}
                onValueChange={v => setFormData({ ...formData, role: v as UserRole })}
              >
                <SelectTrigger className="h-8 text-sm mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {roles.map(r => (
                    <SelectItem key={r} value={r}>{r}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Status</Label>
              <Select
                value={formData.status || 'Active'}
                onValueChange={v => setFormData({ ...formData, status: v as 'Active' | 'Inactive' })}
              >
                <SelectTrigger className="h-8 text-sm mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4 pt-3 border-t">
            <Button variant="outline" size="sm" onClick={() => setEditModalOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleSave}>
              {selectedUser ? 'Update' : 'Create'}
            </Button>
          </div>
        </CompactModal>

        {/* Delete Confirmation */}
        <ConfirmDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          title="Delete User"
          description="Are you sure you want to delete this user? This action cannot be undone."
          confirmLabel="Delete"
          onConfirm={handleConfirmDelete}
          variant="destructive"
        />
      </div>
    </AppLayout>
  );
}
