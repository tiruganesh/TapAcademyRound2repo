import { Clock, LogIn, LogOut, Timer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAttendance } from '@/hooks/useAttendance';
import { format } from 'date-fns';

export function AttendanceCard() {
  const { todayRecord, loading, checkIn, checkOut } = useAttendance();

  const hasCheckedIn = !!todayRecord?.check_in_time;
  const hasCheckedOut = !!todayRecord?.check_out_time;

  const formatTime = (time: string | null) => {
    if (!time) return '--:--';
    return format(new Date(time), 'hh:mm a');
  };

  return (
    <Card className="overflow-hidden border-0 shadow-lg animate-scale-in">
      <CardHeader className="gradient-hero pb-12">
        <CardTitle className="flex items-center gap-2 text-primary-foreground">
          <Clock className="h-5 w-5" />
          Today's Attendance
        </CardTitle>
        <p className="text-primary-foreground/80 text-sm">
          {format(new Date(), 'EEEE, MMMM d, yyyy')}
        </p>
      </CardHeader>
      <CardContent className="-mt-8">
        <div className="rounded-xl bg-card p-6 shadow-md">
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 mx-auto mb-2 rounded-full bg-success/10">
                <LogIn className="h-5 w-5 text-success" />
              </div>
              <p className="text-xs text-muted-foreground mb-1">Check In</p>
              <p className="text-lg font-bold text-foreground">
                {formatTime(todayRecord?.check_in_time ?? null)}
              </p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 mx-auto mb-2 rounded-full bg-warning/10">
                <LogOut className="h-5 w-5 text-warning" />
              </div>
              <p className="text-xs text-muted-foreground mb-1">Check Out</p>
              <p className="text-lg font-bold text-foreground">
                {formatTime(todayRecord?.check_out_time ?? null)}
              </p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 mx-auto mb-2 rounded-full bg-primary/10">
                <Timer className="h-5 w-5 text-primary" />
              </div>
              <p className="text-xs text-muted-foreground mb-1">Hours</p>
              <p className="text-lg font-bold text-foreground">
                {todayRecord?.total_hours ? `${todayRecord.total_hours}h` : '--'}
              </p>
            </div>
          </div>

          {!hasCheckedIn ? (
            <Button
              variant="check-in"
              size="xl"
              className="w-full"
              onClick={checkIn}
              disabled={loading}
            >
              <LogIn className="h-5 w-5 mr-2" />
              Check In
            </Button>
          ) : !hasCheckedOut ? (
            <Button
              variant="check-out"
              size="xl"
              className="w-full"
              onClick={checkOut}
              disabled={loading}
            >
              <LogOut className="h-5 w-5 mr-2" />
              Check Out
            </Button>
          ) : (
            <div className="text-center py-4">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-success/10 text-success">
                <span className="text-sm font-medium">✓ Attendance Complete</span>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
