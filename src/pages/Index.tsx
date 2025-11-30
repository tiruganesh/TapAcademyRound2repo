import { useAuth } from '@/lib/auth';
import { Loader2, Users, Clock, FileText } from 'lucide-react';

const FeatureCard = ({ title, desc, icon }: { title: string; desc: string; icon: React.ReactNode }) => (
  <div className="p-6 bg-card rounded-xl shadow-sm">
    <div className="flex items-center gap-4">
      <div className="p-3 bg-primary/10 rounded-lg">{icon}</div>
      <div>
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="text-sm text-muted-foreground mt-1">{desc}</p>
      </div>
    </div>
  </div>
);

const Index = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (user) {
    // Authenticated users still go straight to dashboard
    return <div />;
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <section className="max-w-6xl mx-auto px-6 py-24">
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-5xl font-extrabold leading-tight">AttendEase — smart attendance made simple</h1>
          <p className="mt-6 text-lg text-muted-foreground">Fast check-ins, accurate time tracking, and manager reports — built for modern teams. Reduce manual work and get reliable attendance insights.</p>

          <div className="mt-8 flex items-center justify-center gap-3">
            <a href="/auth" className="inline-flex items-center px-6 py-3 rounded-lg bg-primary text-primary-foreground font-medium">Get started — it's free</a>
            <a href="/auth" className="inline-flex items-center px-6 py-3 rounded-lg border border-border text-muted-foreground">Sign in</a>
          </div>
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          <FeatureCard title="Quick check-in" desc="Fast, one-click check-ins for employees." icon={<Clock className="h-5 w-5 text-primary" />} />
          <FeatureCard title="Team reports" desc="Managers get an overview of team attendance." icon={<Users className="h-5 w-5 text-primary" />} />
          <FeatureCard title="Export & reports" desc="Download attendance reports for payroll." icon={<FileText className="h-5 w-5 text-primary" />} />
        </div>
      </section>
    </main>
  );
};

export default Index;
