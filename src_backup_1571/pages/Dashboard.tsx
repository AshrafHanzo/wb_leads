import { useMemo, useState, useEffect } from 'react';
import {
  Target,
  Building2,
  DollarSign,
  Calendar,
  TrendingUp,
  Users,
  Plus,
  Loader2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AppLayout } from '@/components/layout/AppLayout';
import { formatCurrency, formatDate } from '@/lib/formatters';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie
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

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await api.getDashboardStats();
        setStats(data);
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
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <Card>
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-md bg-primary/10">
                  <Target className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-2xs text-muted-foreground font-medium">Total Leads</p>
                  <p className="text-xl font-semibold">{stats.totalLeads}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-md bg-success/10">
                  <Building2 className="h-4 w-4 text-success" />
                </div>
                <div>
                  <p className="text-2xs text-muted-foreground font-medium">Accounts</p>
                  <p className="text-xl font-semibold">{stats.totalAccounts}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-md bg-chart-3/10">
                  <DollarSign className="h-4 w-4 text-chart-3" />
                </div>
                <div>
                  <p className="text-2xs text-muted-foreground font-medium">Total Revenue</p>
                  <p className="text-xl font-semibold">{formatCurrency(stats.totalRevenue)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-md bg-chart-4/10">
                  <TrendingUp className="h-4 w-4 text-chart-4" />
                </div>
                <div>
                  <p className="text-2xs text-muted-foreground font-medium">Pipeline</p>
                  <p className="text-xl font-semibold">{formatCurrency(stats.expectedPipeline)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-md bg-warning/10">
                  <Calendar className="h-4 w-4 text-warning" />
                </div>
                <div>
                  <p className="text-2xs text-muted-foreground font-medium">Today's Followups</p>
                  <p className="text-xl font-semibold">{stats.todayFollowups}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid lg:grid-cols-2 gap-4">
          {/* Leads by Stage Bar Chart */}
          <Card>
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

          {/* Pipeline Pie Chart */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Pipeline Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stats.leadsByStage.filter(s => s.count > 0)}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="count"
                      nameKey="name"
                    >
                      {stats.leadsByStage.filter(s => s.count > 0).map((_, index) => (
                        <Cell key={`cell-${index}`} fill={stageColors[index % stageColors.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        fontSize: 12,
                        borderRadius: 6,
                        border: '1px solid hsl(var(--border))',
                        backgroundColor: 'hsl(var(--card))'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-wrap gap-2 mt-2 justify-center">
                {stats.leadsByStage.filter(s => s.count > 0).slice(0, 5).map((stage, i) => (
                  <div key={stage.name} className="flex items-center gap-1.5 text-2xs">
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: stageColors[i % stageColors.length] }}
                    />
                    <span className="text-muted-foreground">{stage.name}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Leads */}
        <Card>
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
                        <p className="text-2xs text-muted-foreground">
                          {lead.lead_source} • {lead.generated_by_name}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{formatCurrency(lead.expected_value)}</p>
                      <p className="text-2xs text-muted-foreground">{lead.stage_name}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
