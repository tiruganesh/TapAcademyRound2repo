import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { AttendanceHistory } from '@/components/attendance/AttendanceHistory';
import { StatsCard } from '@/components/attendance/StatsCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAttendance } from '@/hooks/useAttendance';
import { Calendar, Clock, TrendingUp, CheckCircle } from 'lucide-react';
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  isSameMonth,
  subMonths,
  addMonths,
  getDay,
} from 'date-fns';
import { cn } from '@/lib/utils';

const statusColors: Record<string, string> = {
  present: 'bg-success',
  absent: 'bg-destructive',
  late: 'bg-warning',
  'half-day': 'bg-info',
};

export default function History() {
  const { history, loading } = useAttendance();
  const [selectedMonth, setSelectedMonth] = useState(new Date());

  const monthStart = startOfMonth(selectedMonth);
  const monthEnd = endOfMonth(selectedMonth);
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Get the starting day of the week for proper alignment (0 = Sunday, 1 = Monday, etc.)
  const startDayOfWeek = getDay(monthStart);

  const monthlyRecords = history.filter((r) =>
    isSameMonth(new Date(r.date), selectedMonth)
  );

  const presentDays = monthlyRecords.filter((r) => r.status === 'present').length;
  const lateDays = monthlyRecords.filter((r) => r.status === 'late').length;
  const totalHours = monthlyRecords.reduce((sum, r) => sum + (r.total_hours || 0), 0);
  const avgHours = monthlyRecords.length > 0 ? (totalHours / monthlyRecords.length).toFixed(1) : '0';

  const getStatusForDay = (day: Date) => {
    const record = history.find((r) => isSameDay(new Date(r.date), day));
    return record?.status || null;
  };

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
            <h1 className="text-3xl font-bold text-foreground">Attendance History</h1>
            <p className="text-muted-foreground mt-1">
              View your attendance records and statistics
            </p>
          </div>
          <Select
            value={format(selectedMonth, 'yyyy-MM')}
            onValueChange={(v) => setSelectedMonth(new Date(v + '-01'))}
          >
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

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatsCard
            title="Present Days"
            value={presentDays}
            icon={<CheckCircle className="h-6 w-6" />}
          />
          <StatsCard
            title="Late Days"
            value={lateDays}
            icon={<Clock className="h-6 w-6" />}
          />
          <StatsCard
            title="Total Hours"
            value={`${totalHours.toFixed(1)}h`}
            icon={<Calendar className="h-6 w-6" />}
          />
          <StatsCard
            title="Avg Hours/Day"
            value={`${avgHours}h`}
            icon={<TrendingUp className="h-6 w-6" />}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Calendar View */}
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle>{format(selectedMonth, 'MMMM yyyy')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-1 mb-2">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                  <div key={day} className="text-center text-xs font-medium text-muted-foreground py-2">
                    {day}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {/* Empty cells for days before the month starts */}
                {Array.from({ length: startDayOfWeek }).map((_, i) => (
                  <div key={`empty-${i}`} className="aspect-square" />
                ))}
                {monthDays.map((day) => {
                  const status = getStatusForDay(day);
                  const isToday = isSameDay(day, new Date());

                  return (
                    <div
                      key={day.toISOString()}
                      className={cn(
                        'aspect-square rounded-md flex items-center justify-center text-sm transition-all',
                        isToday && 'ring-2 ring-primary',
                        !status && 'bg-secondary/50 text-muted-foreground',
                        status && statusColors[status],
                        status && 'text-white font-medium'
                      )}
                    >
                      {format(day, 'd')}
                    </div>
                  );
                })}
              </div>

              <div className="flex flex-wrap gap-3 mt-6 pt-4 border-t border-border">
                {Object.entries(statusColors).map(([status, color]) => (
                  <div key={status} className="flex items-center gap-2">
                    <div className={cn('w-3 h-3 rounded-full', color)} />
                    <span className="text-xs text-muted-foreground capitalize">{status}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Table View */}
          <AttendanceHistory records={monthlyRecords} loading={loading} />
        </div>
      </div>
    </DashboardLayout>
  );
}
