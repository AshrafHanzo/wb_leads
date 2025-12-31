import { useState, useMemo, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
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
import { mockUsers } from '@/lib/mockData';
import { formatCurrency, formatDate } from '@/lib/formatters';
import { api } from '@/lib/api';

const industries = ['Technology', 'Finance', 'Healthcare', 'Retail', 'Education', 'Manufacturing', 'Real Estate', 'Logistics', 'Other'];
const statuses: AccountStatus[] = ['Prospect', 'Active', 'Dormant'];

export default function Accounts() {
  const { toast } = useToast();
  const { hasPermission } = useAuth();
  const navigate = useNavigate();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [industryFilter, setIndustryFilter] = useState<string>('all');
  const [lobFilter, setLobFilter] = useState<string>('all');
  const [cityFilter, setCityFilter] = useState<string>('all');
  const [sortKey, setSortKey] = useState<string>('account_name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [formData, setFormData] = useState<Partial<Account>>({});
  const [users, setUsers] = useState<any[]>(mockUsers);
  const [allIndustries, setAllIndustries] = useState<any[]>([]);
  const [allLobs, setAllLobs] = useState<any[]>([]);
  const [allCities, setAllCities] = useState<any[]>([]);
  const [allStages, setAllStages] = useState<any[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [
        accountsData,
        usersData,
        industriesData,
        lobsData,
        citiesData,
        stagesData
      ] = await Promise.all([
        api.getAllAccounts(),
        api.getUsers(),
        api.getIndustries(),
        api.getIndustryLOBs(),
        api.getCities(),
        api.getStages()
      ]);
      setAccounts(accountsData);
      setUsers(usersData);
      setAllIndustries(industriesData);
      setAllLobs(lobsData);
      setAllCities(citiesData);
      setAllStages(stagesData);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load accounts',
        variant: 'destructive'
      });
    }
  };

  const limit = 10;

  const filteredData = useMemo(() => {
    let result = [...accounts];

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(a =>
        a.account_name.toLowerCase().includes(q) ||
        (a.industry || '').toLowerCase().includes(q) ||
        (a.hq_city || '').toLowerCase().includes(q)
      );
    }



    if (industryFilter !== 'all') {
      result = result.filter(a => a.industry === industryFilter);
    }

    if (lobFilter !== 'all') {
      result = result.filter(a => a.primary_lob === lobFilter);
    }

    if (cityFilter !== 'all') {
      result = result.filter(a => a.hq_city === cityFilter);
    }

    result.sort((a, b) => {
      const aVal = a[sortKey as keyof Account];
      const bVal = b[sortKey as keyof Account];
      const modifier = sortDirection === 'asc' ? 1 : -1;
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return aVal.localeCompare(bVal) * modifier;
      }
      return (((aVal as number) || 0) - ((bVal as number) || 0)) * modifier;
    });

    return result;
  }, [accounts, search, industryFilter, lobFilter, cityFilter, sortKey, sortDirection]);

  const paginatedData = filteredData.slice((page - 1) * limit, page * limit);

  const columns: Column<Account>[] = [
    {
      key: 'account_id',
      header: 'ID',
      sortable: true,
      render: (row: Account) => <span className="text-xs text-muted-foreground">#{row.account_id}</span>
    },
    {
      key: 'created_date',
      header: 'Date',
      sortable: true,
      render: (row: Account) => (
        <span className="text-xs">
          {new Date(row.created_date).toLocaleDateString()}
        </span>
      )
    },
    {
      key: 'account_name',
      header: 'Account',
      sortable: true,
      render: (row: Account) => (
        <div className="flex flex-col">
          <Link to={`/accounts/${row.account_id}`} className="font-medium hover:underline text-primary">
            {row.account_name}
          </Link>
          <span className="text-[10px] text-muted-foreground uppercase">{row.account_status}</span>
        </div>
      )
    },
    {
      key: 'industry',
      header: 'Industry',
      sortable: true,
      render: (row: Account) => <span className="text-xs">{row.industry || '-'}</span>
    },
    {
      key: 'primary_lob',
      header: 'Main LOB',
      sortable: true,
      render: (row: Account) => <span className="text-xs">{row.primary_lob || '-'}</span>
    },
    {
      key: 'hq_city',
      header: 'HQ City',
      sortable: true,
      render: (row: Account) => <span className="text-xs">{row.hq_city || '-'}</span>
    },
    {
      key: 'data_completion_score',
      header: 'Data Completion',
      sortable: true,
      render: (row: Account) => (
        <div className="flex items-center gap-2">
          <div className="w-12 h-1.5 bg-secondary rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full ${(row.data_completion_score || 0) > 80 ? 'bg-green-500' :
                (row.data_completion_score || 0) > 50 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
              style={{ width: `${row.data_completion_score || 0}%` }}
            />
          </div>
          <span className="text-[10px] font-medium">{row.data_completion_score || 0}%</span>
        </div>
      )
    },
    {
      key: 'stage_name',
      header: 'Stage Update',
      render: (row: Account) => (
        <div className="flex items-center gap-2">
          {row.lead_id ? (
            <Select
              value={row.stage_id?.toString()}
              onValueChange={async (value) => {
                try {
                  await api.updateLeadStage(row.lead_id!, { stage_id: parseInt(value) });
                  // Optimistically update local state
                  setAccounts(prev => prev.map(a =>
                    a.account_id === row.account_id
                      ? { ...a, stage_id: parseInt(value), stage_name: allStages.find(s => s.stage_id === parseInt(value))?.stage_name }
                      : a
                  ));
                  toast({ title: 'Stage updated' });
                } catch (err) {
                  console.error(err);
                  toast({ title: 'Error', description: 'Failed to update stage', variant: 'destructive' });
                }
              }}
            >
              <SelectTrigger className="h-7 text-[10px] w-[130px]">
                <SelectValue placeholder="Select stage..." />
              </SelectTrigger>
              <SelectContent>
                {allStages.map(s => (
                  <SelectItem key={s.stage_id} value={s.stage_id.toString()} className="text-[10px]">
                    {s.stage_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <span className="text-[10px] text-muted-foreground italic">No Active Lead</span>
          )}
        </div>
      )
    },
    {
      key: 'actions',
      header: '',
      render: (row: Account) => (
        <div className="flex items-center justify-end gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => {
              setSelectedAccount(row);
              setFormData(row);
              setEditModalOpen(true);
            }}
          >
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-destructive hover:text-destructive"
            onClick={() => {
              setSelectedAccount(row);
              setDeleteDialogOpen(true);
            }}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      )
    }
  ];

  const handleEdit = (account: Account | null) => {
    setSelectedAccount(account);
    setFormData(account || {
      account_name: '',
      industry: '',
      head_office: '',
      primary_contact_name: '',
      contact_person_role: '',
      contact_phone: '',
      contact_email: '',
      company_phone: '',
      account_status: 'Prospect',
      account_owner: users[0]?.user_id || 1,
      lead_source: '',
      remarks: '',
    });
    setEditModalOpen(true);
  };

  const handleDelete = (account: Account) => {
    setSelectedAccount(account);
    setDeleteDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.account_name) {
      toast({ title: 'Error', description: 'Account name is required', variant: 'destructive' });
      return;
    }

    try {
      if (selectedAccount) {
        await api.updateAccount(selectedAccount.account_id, formData);
        toast({ title: 'Account updated' });
      } else {
        await api.createAccount(formData);
        toast({ title: 'Account created' });
      }
      setEditModalOpen(false);
      fetchData();
    } catch (err: any) {
      console.error('Save account error:', err);
      toast({
        title: 'Error',
        description: err.message || 'Failed to save account',
        variant: 'destructive'
      });
    }
  };

  const handleConfirmDelete = async () => {
    if (selectedAccount) {
      try {
        await api.deleteAccount(selectedAccount.account_id);
        toast({ title: 'Account deleted' });
        fetchData();
      } catch (err: any) {
        console.error('Delete account error:', err);
        toast({
          title: 'Error',
          description: err.message || 'Failed to delete account',
          variant: 'destructive'
        });
      }
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
        `"${a.hq_city}"`,
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


          <Select value={industryFilter} onValueChange={setIndustryFilter}>
            <SelectTrigger className="w-32 h-8 text-xs">
              <SelectValue placeholder="Industry" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Industries</SelectItem>
              {allIndustries.map(i => (
                <SelectItem key={i.industry_id} value={i.industry_name}>{i.industry_name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={lobFilter} onValueChange={setLobFilter}>
            <SelectTrigger className="w-32 h-8 text-xs">
              <SelectValue placeholder="Line of Business" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All LOBs</SelectItem>
              {allLobs.map(l => (
                <SelectItem key={l.lob_id} value={l.lob_name}>{l.lob_name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={cityFilter} onValueChange={setCityFilter}>
            <SelectTrigger className="w-32 h-8 text-xs">
              <SelectValue placeholder="HQ City" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Cities</SelectItem>
              {allCities.map(c => (
                <SelectItem key={c.city_id} value={c.city_name}>{c.city_name}</SelectItem>
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
              <Label className="text-xs">Company Website</Label>
              <Input
                value={formData.company_website || ''}
                onChange={e => setFormData({ ...formData, company_website: e.target.value })}
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
                  {users.filter(u => ['BD', 'Sales', 'Admin'].includes(u.role)).map(u => (
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
