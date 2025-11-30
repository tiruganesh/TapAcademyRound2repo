import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { AttendanceHistory } from '@/components/attendance/AttendanceHistory';
import { StatsCard } from '@/components/attendance/StatsCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAllAttendance } from '@/hooks/useAttendance';
import { supabase } from '@/integrations/supabase/client';
import { Users, Search, Download, CheckCircle, XCircle, Clock } from 'lucide-react';
import { format } from 'date-fns';

interface Employee {
  id: string;
  user_id: string;
  full_name: string;
  employee_id: string;
  department: string | null;
}

export default function Team() {
  const { records, loading } = useAllAttendance();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  useEffect(() => {
    fetchEmployees();
  }, []);

  async function fetchEmployees() {
    const { data } = await supabase
      .from('profiles')
      .select('id, user_id, full_name, employee_id, department');
    
    if (data) {
      setEmployees(data as Employee[]);
    }
  }

  const filteredRecords = records.filter((record: any) => {
    const matchesSearch = searchTerm === '' || 
      record.profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.profiles?.employee_id?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesEmployee = selectedEmployee === 'all' || record.user_id === selectedEmployee;
    const matchesStatus = selectedStatus === 'all' || record.status === selectedStatus;

    return matchesSearch && matchesEmployee && matchesStatus;
  });

  const today = new Date().toISOString().split('T')[0];
  const todayRecords = records.filter((r) => r.date === today);
  const presentToday = todayRecords.filter((r) => r.check_in_time).length;
  const lateToday = todayRecords.filter((r) => r.status === 'late').length;

  const exportToCSV = () => {
    const headers = ['Date', 'Employee', 'Employee ID', 'Check In', 'Check Out', 'Hours', 'Status'];
    const rows = filteredRecords.map((r: any) => [
      r.date,
      r.profiles?.full_name || '',
      r.profiles?.employee_id || '',
      r.check_in_time ? format(new Date(r.check_in_time), 'HH:mm') : '',
      r.check_out_time ? format(new Date(r.check_out_time), 'HH:mm') : '',
      r.total_hours || '',
      r.status,
    ]);

    const csvContent = [headers, ...rows].map((row) => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between animate-fade-in">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Team Attendance</h1>
            <p className="text-muted-foreground mt-1">
              Monitor and manage your team's attendance
            </p>
          </div>
          <Button variant="outline" onClick={exportToCSV}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatsCard
            title="Total Employees"
            value={employees.length}
            icon={<Users className="h-6 w-6" />}
          />
          <StatsCard
            title="Present Today"
            value={presentToday}
            icon={<CheckCircle className="h-6 w-6" />}
          />
          <StatsCard
            title="Late Today"
            value={lateToday}
            icon={<Clock className="h-6 w-6" />}
          />
          <StatsCard
            title="Absent Today"
            value={employees.length - presentToday}
            icon={<XCircle className="h-6 w-6" />}
          />
        </div>

        {/* Filters */}
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle className="text-lg">Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="All Employees" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Employees</SelectItem>
                  {employees.map((emp) => (
                    <SelectItem key={emp.user_id} value={emp.user_id}>
                      {emp.full_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="present">Present</SelectItem>
                  <SelectItem value="late">Late</SelectItem>
                  <SelectItem value="absent">Absent</SelectItem>
                  <SelectItem value="half-day">Half Day</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Attendance Table */}
        <AttendanceHistory records={filteredRecords} loading={loading} showEmployee />
      </div>
    </DashboardLayout>
  );
}
