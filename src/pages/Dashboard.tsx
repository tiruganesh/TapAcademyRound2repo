import { useAuth } from '@/lib/auth';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { AttendanceCard } from '@/components/attendance/AttendanceCard';
import { StatsCard } from '@/components/attendance/StatsCard';
import { AttendanceHistory } from '@/components/attendance/AttendanceHistory';
import { OperationsList } from '@/components/attendance/OperationsList';
import { useAttendance, useAllAttendance } from '@/hooks/useAttendance';
import { Clock, Calendar, TrendingUp, Users, CheckCircle, XCircle } from 'lucide-react';
import { format, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';

function EmployeeDashboard() {
  const { profile } = useAuth();
  const { history, loading } = useAttendance();

  const currentMonth = new Date();
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);

  const monthlyRecords = history.filter((r) =>
    isWithinInterval(new Date(r.date), { start: monthStart, end: monthEnd })
  );

  const presentDays = monthlyRecords.filter((r) => r.status === 'present' || r.status === 'late').length;
  const totalHours = monthlyRecords.reduce((sum, r) => sum + (r.total_hours || 0), 0);
  const avgHours = monthlyRecords.length > 0 ? (totalHours / monthlyRecords.length).toFixed(1) : '0';

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="animate-fade-in">
          <h1 className="text-3xl font-bold text-foreground">
            Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'}, {profile?.full_name?.split(' ')[0]}!
          </h1>
          <p className="text-muted-foreground mt-1">
            {format(new Date(), 'EEEE, MMMM d, yyyy')}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatsCard
            title="Days Present"
            value={presentDays}
            description={`This month (${format(currentMonth, 'MMMM')})`}
            icon={<Calendar className="h-6 w-6" />}
          />
          <StatsCard
            title="Total Hours"
            value={`${totalHours.toFixed(1)}h`}
            description="This month"
            icon={<Clock className="h-6 w-6" />}
          />
          <StatsCard
            title="Avg Hours/Day"
            value={`${avgHours}h`}
            description="This month"
            icon={<TrendingUp className="h-6 w-6" />}
          />
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <AttendanceCard />
          <AttendanceHistory records={history.slice(0, 5)} loading={loading} />
        </div>
      </div>
    </DashboardLayout>
  );
}

function ManagerDashboard() {
  const { profile } = useAuth();
  const { records, loading } = useAllAttendance();

  const today = new Date().toISOString().split('T')[0];
  const todayRecords = records.filter((r) => r.date === today);
  const presentToday = todayRecords.filter((r) => r.check_in_time).length;
  const absentToday = todayRecords.filter((r) => !r.check_in_time).length;

  // Unique employees who have records
  const uniqueEmployees = new Set(records.map((r) => r.user_id)).size;

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="animate-fade-in">
          <h1 className="text-3xl font-bold text-foreground">
            Welcome back, {profile?.full_name?.split(' ')[0]}!
          </h1>
          <p className="text-muted-foreground mt-1">
            Team attendance overview for {format(new Date(), 'EEEE, MMMM d, yyyy')}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatsCard
            title="Total Employees"
            value={uniqueEmployees}
            icon={<Users className="h-6 w-6" />}
          />
          <StatsCard
            title="Present Today"
            value={presentToday}
            icon={<CheckCircle className="h-6 w-6" />}
            className="border-l-4 border-l-success"
          />
          <StatsCard
            title="Absent Today"
            value={absentToday}
            icon={<XCircle className="h-6 w-6" />}
            className="border-l-4 border-l-destructive"
          />
          <StatsCard
            title="Attendance Rate"
            value={todayRecords.length > 0 ? `${Math.round((presentToday / todayRecords.length) * 100)}%` : '0%'}
            icon={<TrendingUp className="h-6 w-6" />}
          />
        </div>

        {/* Recent Attendance */}
  <AttendanceHistory records={records.slice(0, 10)} loading={loading} showEmployee />

  {/* Recent Manager Operations */}
  <OperationsList />
      </div>
    </DashboardLayout>
  );
}

export default function Dashboard() {
  const { role } = useAuth();
  
  if (role === 'manager') {
    return <ManagerDashboard />;
  }
  
  return <EmployeeDashboard />;
}
