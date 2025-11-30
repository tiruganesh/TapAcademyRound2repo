import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { AttendanceRecord } from '@/hooks/useAttendance';
import { cn } from '@/lib/utils';

interface AttendanceHistoryProps {
  records: AttendanceRecord[];
  loading?: boolean;
  showEmployee?: boolean;
  employeeInfo?: { full_name: string; employee_id: string };
}

const statusColors: Record<string, string> = {
  present: 'bg-success/10 text-success border-success/20',
  absent: 'bg-destructive/10 text-destructive border-destructive/20',
  late: 'bg-warning/10 text-warning border-warning/20',
  'half-day': 'bg-info/10 text-info border-info/20',
};

export function AttendanceHistory({ records, loading, showEmployee, employeeInfo }: AttendanceHistoryProps) {
  const formatTime = (time: string | null) => {
    if (!time) return '-';
    return format(new Date(time), 'hh:mm a');
  };

  if (loading) {
    return (
      <Card className="border-0 shadow-md">
        <CardContent className="p-8">
          <div className="flex items-center justify-center">
            <div className="animate-pulse-soft text-muted-foreground">Loading...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-md">
      <CardHeader>
        <CardTitle>Attendance History</CardTitle>
      </CardHeader>
      <CardContent>
        {records.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No attendance records found
          </div>
        ) : (
          <div className="rounded-lg border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-secondary/50">
                  <TableHead className="font-semibold">Date</TableHead>
                  {showEmployee && <TableHead className="font-semibold">Employee</TableHead>}
                  <TableHead className="font-semibold">Check In</TableHead>
                  <TableHead className="font-semibold">Check Out</TableHead>
                  <TableHead className="font-semibold">Hours</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {records.map((record: any) => (
                  <TableRow key={record.id} className="hover:bg-secondary/30 transition-colors">
                    <TableCell className="font-medium">
                      {format(new Date(record.date), 'MMM d, yyyy')}
                    </TableCell>
                    {showEmployee && (
                      <TableCell>
                        <div>
                          <p className="font-medium">{record.profiles?.full_name || '-'}</p>
                          <p className="text-xs text-muted-foreground">{record.profiles?.employee_id || '-'}</p>
                        </div>
                      </TableCell>
                    )}
                    <TableCell>{formatTime(record.check_in_time)}</TableCell>
                    <TableCell>{formatTime(record.check_out_time)}</TableCell>
                    <TableCell>
                      {record.total_hours ? `${record.total_hours}h` : '-'}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={cn('capitalize', statusColors[record.status] || '')}
                      >
                        {record.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
