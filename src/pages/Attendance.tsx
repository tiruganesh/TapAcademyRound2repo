import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { AttendanceCard } from '@/components/attendance/AttendanceCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAttendance } from '@/hooks/useAttendance';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay } from 'date-fns';
import { cn } from '@/lib/utils';

const statusColors: Record<string, string> = {
  present: 'bg-success text-success-foreground',
  absent: 'bg-destructive text-destructive-foreground',
  late: 'bg-warning text-warning-foreground',
  'half-day': 'bg-info text-info-foreground',
};

export default function Attendance() {
  const { history } = useAttendance();

  const today = new Date();
  const weekStart = startOfWeek(today, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(today, { weekStartsOn: 1 });
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

  const getStatusForDay = (day: Date) => {
    const record = history.find((r) => isSameDay(new Date(r.date), day));
    return record?.status || null;
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="animate-fade-in">
          <h1 className="text-3xl font-bold text-foreground">Mark Attendance</h1>
          <p className="text-muted-foreground mt-1">
            Check in and check out for today
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <AttendanceCard />

          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>This Week</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-2">
                {weekDays.map((day) => {
                  const status = getStatusForDay(day);
                  const isToday = isSameDay(day, today);
                  const isFuture = day > today;

                  return (
                    <div
                      key={day.toISOString()}
                      className={cn(
                        'aspect-square rounded-lg flex flex-col items-center justify-center text-center transition-all',
                        isToday && 'ring-2 ring-primary ring-offset-2',
                        !status && !isFuture && 'bg-secondary',
                        status && statusColors[status],
                        isFuture && 'bg-muted/50 text-muted-foreground'
                      )}
                    >
                      <span className="text-xs font-medium">
                        {format(day, 'EEE')}
                      </span>
                      <span className="text-lg font-bold">
                        {format(day, 'd')}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="flex flex-wrap gap-3 mt-6 pt-6 border-t border-border">
                {Object.entries(statusColors).map(([status, color]) => (
                  <div key={status} className="flex items-center gap-2">
                    <div className={cn('w-3 h-3 rounded-full', color)} />
                    <span className="text-xs text-muted-foreground capitalize">{status}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
