import { useState, useMemo } from 'react';
import { Plus, Pencil, Trash2, Eye, MoreHorizontal } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { DataTable, Column } from '@/components/common/DataTable';
import { CompactModal } from '@/components/common/CompactModal';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { StatusBadge } from '@/components/common/StatusBadge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
import { Account, AccountStatus } from '@/types';
import { mockAccounts, mockUsers } from '@/lib/mockData';
import { formatCurrency, formatDate } from '@/lib/formatters';

const industries = ['Technology', 'Finance', 'Healthcare', 'Retail', 'Education', 'Manufacturing'];
const statuses: AccountStatus[] = ['Prospect', 'Active', 'Dormant'];

export default function Accounts() {
  const { toast } = useToast();
  const { hasPermission } = useAuth();
  const [accounts, setAccounts] = useState<Account[]>(mockAccounts);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortKey, setSortKey] = useState<string>('account_name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [formData, setFormData] = useState<Partial<Account>>({});

  const limit = 10;

  const filteredData = useMemo(() => {
    let result = [...accounts];
    
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(a => 
        a.account_name.toLowerCase().includes(q) ||
        a.industry.toLowerCase().includes(q) ||
        a.location.toLowerCase().includes(q)
      );
    }
    
    if (statusFilter !== 'all') {
      result = result.filter(a => a.account_status === statusFilter);
    }
    
    result.sort((a, b) => {
      const aVal = a[sortKey as keyof Account];
      const bVal = b[sortKey as keyof Account];
      const modifier = sortDirection === 'asc' ? 1 : -1;
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return aVal.localeCompare(bVal) * modifier;
      }
      return ((aVal as number) - (bVal as number)) * modifier;
    });
    
    return result;
  }, [accounts, search, statusFilter, sortKey, sortDirection]);

  const paginatedData = filteredData.slice((page - 1) * limit, page * limit);

  const columns: Column<Account>[] = [
    { key: 'account_id', header: 'ID', className: 'w-16' },
    { 
      key: 'account_name', 
      header: 'Account Name', 
      sortable: true,
      render: (row) => <span className="font-medium">{row.account_name}</span>
    },
    { key: 'industry', header: 'Industry', sortable: true },
    { key: 'location', header: 'Location' },
    { key: 'company_phone', header: 'Phone' },
    { 
      key: 'account_owner', 
      header: 'Owner',
      render: (row) => mockUsers.find(u => u.user_id === row.account_owner)?.full_name || '-'
    },
    { 
      key: 'account_status', 
      header: 'Status',
      render: (row) => <StatusBadge status={row.account_status} type="account" />
    },
    { 
      key: 'total_revenue', 
      header: 'Revenue', 
      sortable: true,
      render: (row) => formatCurrency(row.total_revenue),
      className: 'text-right'
    },
    { 
      key: 'last_updated', 
      header: 'Updated', 
      sortable: true,
      render: (row) => formatDate(row.last_updated)
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
          <DropdownMenuContent align="end" className="w-36">
            {hasPermission('edit', 'accounts') && (
              <DropdownMenuItem onClick={() => handleEdit(row)} className="text-xs">
                <Pencil className="h-3.5 w-3.5 mr-2" />
                Edit
              </DropdownMenuItem>
            )}
            <DropdownMenuItem className="text-xs">
              <Eye className="h-3.5 w-3.5 mr-2" />
              View Leads
            </DropdownMenuItem>
            {hasPermission('delete', 'accounts') && (
              <DropdownMenuItem 
                onClick={() => handleDelete(row)} 
                className="text-xs text-destructive"
              >
                <Trash2 className="h-3.5 w-3.5 mr-2" />
                Delete
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      )
    }
  ];

  const handleEdit = (account: Account | null) => {
    setSelectedAccount(account);
    setFormData(account || {
      account_name: '',
      industry: '',
      head_office: '',
      location: '',
      primary_contact_name: '',
      contact_person_role: '',
      contact_phone: '',
      contact_email: '',
      company_phone: '',
      account_status: 'Prospect',
      account_owner: mockUsers[0].user_id,
      lead_source: '',
      remarks: '',
    });
    setEditModalOpen(true);
  };

  const handleDelete = (account: Account) => {
    setSelectedAccount(account);
    setDeleteDialogOpen(true);
  };

  const handleSave = () => {
    if (!formData.account_name) {
      toast({ title: 'Error', description: 'Account name is required', variant: 'destructive' });
      return;
    }

    if (selectedAccount) {
      setAccounts(accounts.map(a => 
        a.account_id === selectedAccount.account_id 
          ? { ...a, ...formData, last_updated: new Date().toISOString() } 
          : a
      ));
      toast({ title: 'Account updated' });
    } else {
      const newAccount: Account = {
        ...formData as Account,
        account_id: Math.max(...accounts.map(a => a.account_id)) + 1,
        total_meetings_conducted: 0,
        total_pocs: 0,
        total_revenue: 0,
        created_date: new Date().toISOString(),
        last_updated: new Date().toISOString(),
      };
      setAccounts([...accounts, newAccount]);
      toast({ title: 'Account created' });
    }
    setEditModalOpen(false);
  };

  const handleConfirmDelete = () => {
    if (selectedAccount) {
      setAccounts(accounts.filter(a => a.account_id !== selectedAccount.account_id));
      toast({ title: 'Account deleted' });
    }
    setDeleteDialogOpen(false);
  };

  const handleExport = () => {
    const csv = [
      ['ID', 'Name', 'Industry', 'Location', 'Status', 'Revenue'].join(','),
      ...filteredData.map(a => [
        a.account_id,
        `"${a.account_name}"`,
        a.industry,
        `"${a.location}"`,
        a.account_status,
        a.total_revenue
      ].join(','))
    ].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'accounts.csv';
    link.click();
    toast({ title: 'Export complete' });
  };

  return (
    <AppLayout>
      <div className="space-y-4 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-foreground">Accounts</h1>
            <p className="text-sm text-muted-foreground">Manage your customer accounts</p>
          </div>
          {hasPermission('create', 'accounts') && (
            <Button size="sm" className="h-8 text-xs" onClick={() => handleEdit(null)}>
              <Plus className="h-3.5 w-3.5 mr-1.5" />
              Add Account
            </Button>
          )}
        </div>

        <div className="flex gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-32 h-8 text-xs">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              {statuses.map(s => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
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
          onExport={handleExport}
          idKey="account_id"
          emptyMessage="No accounts found. Add your first account!"
        />

        {/* Edit Modal */}
        <CompactModal
          open={editModalOpen}
          onOpenChange={setEditModalOpen}
          title={selectedAccount ? 'Edit Account' : 'Add Account'}
          size="lg"
        >
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <Label className="text-xs">Account Name *</Label>
              <Input 
                value={formData.account_name || ''} 
                onChange={e => setFormData({ ...formData, account_name: e.target.value })}
                className="h-8 text-sm mt-1"
              />
            </div>
            <div>
              <Label className="text-xs">Industry</Label>
              <Select 
                value={formData.industry || ''} 
                onValueChange={v => setFormData({ ...formData, industry: v })}
              >
                <SelectTrigger className="h-8 text-sm mt-1">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  {industries.map(i => (
                    <SelectItem key={i} value={i}>{i}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Status</Label>
              <Select 
                value={formData.account_status || 'Prospect'} 
                onValueChange={v => setFormData({ ...formData, account_status: v as AccountStatus })}
              >
                <SelectTrigger className="h-8 text-sm mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statuses.map(s => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Head Office</Label>
              <Input 
                value={formData.head_office || ''} 
                onChange={e => setFormData({ ...formData, head_office: e.target.value })}
                className="h-8 text-sm mt-1"
              />
            </div>
            <div>
              <Label className="text-xs">Location</Label>
              <Input 
                value={formData.location || ''} 
                onChange={e => setFormData({ ...formData, location: e.target.value })}
                className="h-8 text-sm mt-1"
              />
            </div>
            <div>
              <Label className="text-xs">Primary Contact</Label>
              <Input 
                value={formData.primary_contact_name || ''} 
                onChange={e => setFormData({ ...formData, primary_contact_name: e.target.value })}
                className="h-8 text-sm mt-1"
              />
            </div>
            <div>
              <Label className="text-xs">Contact Role</Label>
              <Input 
                value={formData.contact_person_role || ''} 
                onChange={e => setFormData({ ...formData, contact_person_role: e.target.value })}
                className="h-8 text-sm mt-1"
              />
            </div>
            <div>
              <Label className="text-xs">Contact Phone</Label>
              <Input 
                value={formData.contact_phone || ''} 
                onChange={e => setFormData({ ...formData, contact_phone: e.target.value })}
                className="h-8 text-sm mt-1"
              />
            </div>
            <div>
              <Label className="text-xs">Contact Email</Label>
              <Input 
                type="email"
                value={formData.contact_email || ''} 
                onChange={e => setFormData({ ...formData, contact_email: e.target.value })}
                className="h-8 text-sm mt-1"
              />
            </div>
            <div>
              <Label className="text-xs">Company Phone</Label>
              <Input 
                value={formData.company_phone || ''} 
                onChange={e => setFormData({ ...formData, company_phone: e.target.value })}
                className="h-8 text-sm mt-1"
              />
            </div>
            <div>
              <Label className="text-xs">Account Owner</Label>
              <Select 
                value={String(formData.account_owner || '')} 
                onValueChange={v => setFormData({ ...formData, account_owner: Number(v) })}
              >
                <SelectTrigger className="h-8 text-sm mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {mockUsers.filter(u => ['BD', 'Sales', 'Admin'].includes(u.role)).map(u => (
                    <SelectItem key={u.user_id} value={String(u.user_id)}>{u.full_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2">
              <Label className="text-xs">Remarks</Label>
              <Textarea 
                value={formData.remarks || ''} 
                onChange={e => setFormData({ ...formData, remarks: e.target.value })}
                className="text-sm mt-1 h-16 resize-none"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4 pt-3 border-t">
            <Button variant="outline" size="sm" onClick={() => setEditModalOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleSave}>
              {selectedAccount ? 'Update' : 'Create'}
            </Button>
          </div>
        </CompactModal>

        {/* Delete Confirmation */}
        <ConfirmDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          title="Delete Account"
          description="Are you sure you want to delete this account? This action cannot be undone."
          confirmLabel="Delete"
          onConfirm={handleConfirmDelete}
          variant="destructive"
        />
      </div>
    </AppLayout>
  );
}
