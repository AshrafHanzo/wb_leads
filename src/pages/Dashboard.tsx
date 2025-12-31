import { useMemo, useState, useEffect } from 'react';
import {
  Target,
  Building2,
  Calendar,
  Users,
  Plus,
  Loader2,
  Phone
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AppLayout } from '@/components/layout/AppLayout';
import { formatCurrency } from '@/lib/formatters';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';
import { Link } from 'react-router-dom';
import { api } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

const stageColors = [
  'hsl(217, 91%, 60%)',   // New Lead
  'hsl(199, 89%, 48%)',   // Contacted
  'hsl(142, 71%, 45%)',   // Qualified
  'hsl(280, 65%, 60%)',   // Proposal
  'hsl(38, 92%, 50%)',    // Negotiation
  'hsl(142, 71%, 45%)',   // Closed Won
  'hsl(0, 84%, 60%)',     // Closed Lost
];

interface DashboardStats {
  totalLeads: number;
  totalAccounts: number;
  totalRevenue: number;
  expectedPipeline: number;
  todayFollowups: number;
  leadsByStage: { name: string; count: number }[];
  recentLeads: any[];
  callsToday?: number;
  outcomes?: {
    noAnswer: number;
    busy: number;
    callback: number;
    interested: number;
    notInterested: number;
  };
}

export default function Dashboard() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalLeads: 0,
    totalAccounts: 0,
    totalRevenue: 0,
    expectedPipeline: 0,
    todayFollowups: 0,
    leadsByStage: [],
    recentLeads: []
  });

  const [userStats, setUserStats] = useState<any[]>([]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [dashboardData, usersData] = await Promise.all([
          api.getDashboardStats(),
          api.getUserLeadStats()
        ]);
        setStats(dashboardData);
        setUserStats(usersData || []);
      } catch (error) {
        console.error('Failed to load dashboard stats', error);
        toast({
          title: 'Error',
          description: 'Failed to load dashboard statistics',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [toast]);

  if (loading) {
    return (
      <AppLayout>
        <div className="h-[80vh] flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-foreground">Dashboard</h1>
            <p className="text-sm text-muted-foreground">Welcome back! Here's your overview.</p>
          </div>
          <div className="flex gap-2">
            <Link to="/accounts">
              <Button variant="outline" size="sm" className="h-8 text-xs">
                <Building2 className="h-3.5 w-3.5 mr-1.5" />
                Add Account
              </Button>
            </Link>
            <Link to="/leads">
              <Button size="sm" className="h-8 text-xs">
                <Plus className="h-3.5 w-3.5 mr-1.5" />
                Add Lead
              </Button>
            </Link>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-none shadow-sm bg-white">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-md bg-blue-50 text-blue-600">
                  <Plus className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-2xs text-muted-foreground font-medium uppercase tracking-wider">Total Leads</p>
                  <p className="text-xl font-bold">{stats.totalLeads}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm bg-white">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-md bg-green-50 text-green-600">
                  <Building2 className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-2xs text-muted-foreground font-medium uppercase tracking-wider">Accounts</p>
                  <p className="text-xl font-bold">{stats.totalAccounts}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm bg-white">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-md bg-orange-50 text-orange-600">
                  <Calendar className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-2xs text-muted-foreground font-medium uppercase tracking-wider">Today's Followups</p>
                  <p className="text-xl font-bold">{stats.todayFollowups}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Call Activity Today - Global */}
        {stats.callsToday !== undefined && (
          <Card className="border-none shadow-sm bg-white">
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary border border-primary/20 shadow-sm">
                    <Phone className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-foreground">Call Activity Today</p>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-medium">Total: {stats.callsToday} calls done</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 flex-1 max-w-4xl">
                  {[
                    { label: 'No Answer', value: stats.outcomes?.noAnswer, bg: 'from-white to-slate-50/50', border: 'border-slate-100', text: 'text-slate-600' },
                    { label: 'Busy', value: stats.outcomes?.busy, bg: 'from-white to-amber-50/30', border: 'border-amber-100/50', text: 'text-amber-600' },
                    { label: 'Call Back', value: stats.outcomes?.callback, bg: 'from-white to-blue-50/30', border: 'border-blue-100/50', text: 'text-blue-600' },
                    { label: 'Interested', value: stats.outcomes?.interested, bg: 'from-white to-emerald-50/30', border: 'border-emerald-100/50', text: 'text-emerald-600' },
                    { label: 'Not Interested', value: stats.outcomes?.notInterested, bg: 'from-white to-rose-50/30', border: 'border-rose-100/50', text: 'text-rose-600' }
                  ].map((box) => (
                    <div key={box.label} className={`group/stat relative overflow-hidden bg-gradient-to-b ${box.bg} p-2.5 rounded-xl border ${box.border} shadow-[0_2px_4px_rgba(0,0,0,0.02)] hover:shadow-lg transition-all duration-300 flex flex-col items-center justify-center min-w-[100px]`}>
                      <span className="text-[8px] uppercase text-slate-400 font-bold tracking-wider mb-1 text-center">{box.label}</span>
                      <span className={`text-base font-black ${box.value > 0 ? box.text : 'text-slate-300'}`}>{box.value || 0}</span>
                      <div className="absolute inset-x-0 bottom-0 h-0.5 bg-current opacity-0 group-hover/stat:opacity-20 transition-opacity" />
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* User Performance Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">User Performance</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {userStats.length === 0 ? (
              <Card className="col-span-full py-12 border-none shadow-sm bg-white">
                <CardContent className="flex flex-col items-center justify-center text-muted-foreground">
                  <Users className="h-12 w-12 mb-4 opacity-20" />
                  <p>No user activity found.</p>
                </CardContent>
              </Card>
            ) : (
              userStats.map((user) => (
                <Card key={user.user_id} className="overflow-hidden border-none shadow-md bg-white">
                  <CardHeader className="pb-3 border-b bg-slate-50/50">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-sm text-primary font-bold border border-primary/20">
                        {user.full_name.substring(0, 2).toUpperCase()}
                      </div>
                      <div className="flex-1 truncate">
                        <CardTitle className="text-sm font-bold truncate">{user.full_name}</CardTitle>
                        <p className="text-[10px] text-muted-foreground">Lead & Call Performance</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 space-y-5">
                    {/* Lead Generation Section */}
                    <div>
                      <div className="flex items-center gap-1.5 mb-2.5">
                        <Target className="h-3 w-3 text-primary/70" />
                        <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Lead Generation</p>
                      </div>
                      <div className="grid grid-cols-4 gap-2">
                        {[
                          { label: 'Today', value: user.today, color: 'text-blue-600', bg: 'bg-blue-50/30' },
                          { label: 'Yes.', value: user.yesterday, color: 'text-slate-600', bg: 'bg-slate-50/30' },
                          { label: 'Week', value: user.thisWeek, color: 'text-purple-600', bg: 'bg-purple-50/30' },
                          { label: 'Month', value: user.thisMonth, color: 'text-emerald-600', bg: 'bg-emerald-50/30' }
                        ].map((box) => (
                          <div key={box.label} className={`group/box relative overflow-hidden bg-white p-2 rounded-xl border border-slate-100/80 shadow-[0_2px_4px_rgba(0,0,0,0.02)] hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 flex flex-col items-center justify-center`}>
                            <span className="text-[8px] uppercase text-slate-400 font-bold tracking-tighter mb-1">{box.label}</span>
                            <span className={`text-sm font-black ${box.value > 0 ? box.color : 'text-slate-300'}`}>{box.value}</span>
                            <div className={`absolute inset-0 ${box.bg} opacity-0 group-hover/box:opacity-100 transition-opacity pointer-events-none`} />
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>

        {/* Charts & Recent Activity */}
        <div className="grid lg:grid-cols-2 gap-4">
          <Card className="border-none shadow-sm bg-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Leads by Stage</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.leadsByStage} layout="vertical" margin={{ left: 20, right: 20 }}>
                    <XAxis type="number" tick={{ fontSize: 10 }} allowDecimals={false} />
                    <YAxis
                      dataKey="name"
                      type="category"
                      tick={{ fontSize: 10 }}
                      width={80}
                    />
                    <Tooltip
                      contentStyle={{
                        fontSize: 12,
                        borderRadius: 6,
                        border: '1px solid hsl(var(--border))',
                        backgroundColor: 'hsl(var(--card))'
                      }}
                    />
                    <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                      {stats.leadsByStage.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={stageColors[index % stageColors.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm bg-white">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">Recent Leads</CardTitle>
                <Link to="/leads">
                  <Button variant="ghost" size="sm" className="h-7 text-xs">
                    View all
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {stats.recentLeads.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">No recent leads found.</p>
                ) : (
                  stats.recentLeads.map((lead) => (
                    <div
                      key={lead.lead_id}
                      className="flex items-center justify-between p-2 rounded-md bg-muted/30 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center">
                          <Users className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">{lead.account_name}</p>
                          <p className="text-[10px] text-muted-foreground">
                            {lead.lead_source} • {lead.generated_by_name}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{formatCurrency(lead.expected_value)}</p>
                        <p className="text-[10px] text-muted-foreground">{lead.stage_name}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
