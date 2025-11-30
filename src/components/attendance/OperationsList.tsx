import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useOperations } from '@/hooks/useOperations';

export function OperationsList() {
  const { operations, loading } = useOperations();

  if (loading) {
    return (
      <Card className="border-0 shadow-md">
        <CardHeader>
          <CardTitle>Recent Operations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground">Loading...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-md">
      <CardHeader>
        <CardTitle>Recent Operations</CardTitle>
      </CardHeader>
      <CardContent>
        {operations.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">No recent operations</div>
        ) : (
          <div className="rounded-lg border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-secondary/50">
                  <TableHead className="font-semibold">Time</TableHead>
                  <TableHead className="font-semibold">Actor</TableHead>
                  <TableHead className="font-semibold">Action</TableHead>
                  <TableHead className="font-semibold">Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {operations.map((op) => (
                  <TableRow key={op.id} className="hover:bg-secondary/30 transition-colors">
                    <TableCell className="font-medium">{format(new Date(op.created_at), 'MMM d, yyyy hh:mm a')}</TableCell>
                    <TableCell>{op.actor_user_id || '-'}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="capitalize">{op.action}</Badge>
                    </TableCell>
                    <TableCell>
                      <pre className="whitespace-pre-wrap text-xs text-muted-foreground">{JSON.stringify(op.metadata || {}, null, 2)}</pre>
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
