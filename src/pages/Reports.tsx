import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatsCard } from '@/components/attendance/StatsCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAllAttendance } from '@/hooks/useAttendance';
import { supabase } from '@/integrations/supabase/client';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { Users, TrendingUp, Clock, Calendar } from 'lucide-react';
import { format, subMonths, startOfMonth, endOfMonth, isWithinInterval, eachDayOfInterval, isSameDay } from 'date-fns';

const COLORS = ['hsl(142, 76%, 36%)', 'hsl(38, 92%, 50%)', 'hsl(0, 84%, 60%)', 'hsl(199, 89%, 48%)'];

export default function Reports() {
  const { records } = useAllAttendance();
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'));
  const [employeeCount, setEmployeeCount] = useState(0);

  useEffect(() => {
    fetchEmployeeCount();
  }, []);

  async function fetchEmployeeCount() {
    const { count } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });
    
    setEmployeeCount(count || 0);
  }

  const selectedDate = new Date(selectedMonth + '-01');
  const monthStart = startOfMonth(selectedDate);
  const monthEnd = endOfMonth(selectedDate);

  const monthlyRecords = records.filter((r) =>
    isWithinInterval(new Date(r.date), { start: monthStart, end: monthEnd })
  );

  // Status distribution
  const statusCounts = {
    present: monthlyRecords.filter((r) => r.status === 'present').length,
    late: monthlyRecords.filter((r) => r.status === 'late').length,
    absent: monthlyRecords.filter((r) => r.status === 'absent').length,
    'half-day': monthlyRecords.filter((r) => r.status === 'half-day').length,
  };

  const pieData = Object.entries(statusCounts).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value,
  })).filter(d => d.value > 0);

  // Daily attendance for bar chart
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const dailyData = daysInMonth.map((day) => {
    const dayRecords = monthlyRecords.filter((r) => isSameDay(new Date(r.date), day));
    return {
      date: format(day, 'd'),
      present: dayRecords.filter((r) => r.status === 'present' || r.status === 'late').length,
      absent: dayRecords.filter((r) => r.status === 'absent').length,
    };
  });

  const totalHours = monthlyRecords.reduce((sum, r) => sum + (r.total_hours || 0), 0);
  const avgAttendance = employeeCount > 0 
    ? Math.round((statusCounts.present + statusCounts.late) / (daysInMonth.length * employeeCount) * 100)
    : 0;

  const months = [
    subMonths(new Date(), 2),
    subMonths(new Date(), 1),
    new Date(),
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between animate-fade-in">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Reports & Analytics</h1>
            <p className="text-muted-foreground mt-1">
              Team attendance insights and statistics
            </p>
          </div>
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {months.map((month) => (
                <SelectItem key={format(month, 'yyyy-MM')} value={format(month, 'yyyy-MM')}>
                  {format(month, 'MMMM yyyy')}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatsCard
            title="Total Records"
            value={monthlyRecords.length}
            icon={<Calendar className="h-6 w-6" />}
          />
          <StatsCard
            title="Total Hours"
            value={`${totalHours.toFixed(0)}h`}
            icon={<Clock className="h-6 w-6" />}
          />
          <StatsCard
            title="Avg Attendance"
            value={`${avgAttendance}%`}
            icon={<TrendingUp className="h-6 w-6" />}
          />
          <StatsCard
            title="Team Size"
            value={employeeCount}
            icon={<Users className="h-6 w-6" />}
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Bar Chart */}
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle>Daily Attendance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dailyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                    />
                    <YAxis 
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                    />
                    <Bar dataKey="present" fill="hsl(142, 76%, 36%)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Pie Chart */}
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle>Attendance Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                {pieData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Legend />
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-muted-foreground">
                    No data available for this month
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Status Summary */}
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle>Status Summary - {format(selectedDate, 'MMMM yyyy')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(statusCounts).map(([status, count], index) => (
                <div
                  key={status}
                  className="rounded-xl p-4 text-center"
                  style={{ backgroundColor: `${COLORS[index]}20` }}
                >
                  <p className="text-3xl font-bold" style={{ color: COLORS[index] }}>
                    {count}
                  </p>
                  <p className="text-sm text-muted-foreground capitalize mt-1">{status}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
