import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { toast } from 'sonner';

export interface AttendanceRecord {
  id: string;
  user_id: string;
  date: string;
  check_in_time: string | null;
  check_out_time: string | null;
  status: string;
  total_hours: number | null;
  notes: string | null;
  created_at: string;
}

export function useAttendance() {
  const { user } = useAuth();
  const [todayRecord, setTodayRecord] = useState<AttendanceRecord | null>(null);
  const [history, setHistory] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    if (user) {
      fetchTodayAttendance();
      fetchHistory();
    }
  }, [user]);

  async function fetchTodayAttendance() {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('attendance')
      .select('*')
      .eq('user_id', user.id)
      .eq('date', today)
      .maybeSingle();

    if (!error && data) {
      setTodayRecord(data as AttendanceRecord);
    }
    setLoading(false);
  }

  async function fetchHistory() {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('attendance')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: false })
      .limit(30);

    if (!error && data) {
      setHistory(data as AttendanceRecord[]);
    }
  }

  async function checkIn() {
    if (!user) return;

    const now = new Date().toISOString();
    const currentHour = new Date().getHours();
    const status = currentHour > 9 ? 'late' : 'present';

    const { data, error } = await supabase
      .from('attendance')
      .insert({
        user_id: user.id,
        date: today,
        check_in_time: now,
        status,
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        toast.error('You have already checked in today');
      } else {
        toast.error('Failed to check in');
      }
      return;
    }

    setTodayRecord(data as AttendanceRecord);
    toast.success('Checked in successfully!');
    fetchHistory();
  }

  async function checkOut() {
    if (!user || !todayRecord) return;

    const now = new Date().toISOString();

    const { data, error } = await supabase
      .from('attendance')
      .update({
        check_out_time: now,
      })
      .eq('id', todayRecord.id)
      .select()
      .single();

    if (error) {
      toast.error('Failed to check out');
      return;
    }

    setTodayRecord(data as AttendanceRecord);
    toast.success('Checked out successfully!');
    fetchHistory();
  }

  return {
    todayRecord,
    history,
    loading,
    checkIn,
    checkOut,
    refetch: () => {
      fetchTodayAttendance();
      fetchHistory();
    },
  };
}

export function useAllAttendance() {
  const { role } = useAuth();
  const [records, setRecords] = useState<(AttendanceRecord & { profiles?: { full_name: string; employee_id: string } })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (role === 'manager') {
      fetchAllAttendance();
    }
  }, [role]);

  async function fetchAllAttendance() {
    // Fetch attendance rows first
    const { data: attendanceData, error: attendanceError } = await supabase
      .from('attendance')
      .select('*')
      .order('date', { ascending: false })
      .limit(100);

    if (attendanceError || !attendanceData) {
      setRecords([]);
      setLoading(false);
      return;
    }

    // Fetch profiles for the users returned so we can attach names to records
    const userIds = Array.from(new Set(attendanceData.map((r: any) => r.user_id)));
    let profilesMap: Record<string, { full_name?: string; employee_id?: string }> = {};

    if (userIds.length > 0) {
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('user_id, full_name, employee_id')
        .in('user_id', userIds as string[]);

      if (profilesData) {
        profilesData.forEach((p: any) => {
          profilesMap[p.user_id] = { full_name: p.full_name, employee_id: p.employee_id };
        });
      }
    }

    const merged = (attendanceData as any[]).map((r) => ({ ...r, profiles: profilesMap[r.user_id] || {} }));
    setRecords(merged as any);
    setLoading(false);
  }

  return { records, loading, refetch: fetchAllAttendance };
}
