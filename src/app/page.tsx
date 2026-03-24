import Link from 'next/link';
import { ArrowRight, MessageSquare, ShieldCheck, Activity } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 bg-background min-h-screen">
      <div className="text-center max-w-3xl mb-16">
        <h1 className="font-bold mb-6 text-foreground">
          ASD Hospital Feedback Portal
        </h1>
        <p className="text-xl text-slate-600 mb-8 leading-relaxed">
          We value your experience. Share your feedback to help us improve patient care and hospital services.
          Your voice matters in building a better healthcare environment.
        </p>
        <Link
          href="/signup"
          className="bg-primary text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-sky-700 transition flex items-center gap-2 mx-auto w-fit shadow-md hover:shadow-lg"
        >
          Share Your Experience <ArrowRight size={20} />
        </Link>
      </div>

      <div className="grid md:grid-cols-3 gap-8 max-w-5xl w-full">
        <div className="p-6 bg-card rounded-xl shadow-sm border border-border hover:shadow-md transition">
          <div className="bg-sky-50 p-3 rounded-full w-fit mb-4 text-primary">
            <ShieldCheck size={32} />
          </div>
          <h3 className="text-xl font-bold mb-2 text-foreground">Secure & Confidential</h3>
          <p className="text-slate-600">Your feedback is handled with the utmost privacy and security protocols.</p>
        </div>
        <div className="p-6 bg-card rounded-xl shadow-sm border border-border hover:shadow-md transition">
          <div className="bg-sky-50 p-3 rounded-full w-fit mb-4 text-primary">
            <MessageSquare size={32} />
          </div>
          <h3 className="text-xl font-bold mb-2 text-foreground">Direct Communication</h3>
          <p className="text-slate-600">Ensure your concerns reach the right department for quick resolution.</p>
        </div>
        <div className="p-6 bg-card rounded-xl shadow-sm border border-border hover:shadow-md transition">
          <div className="bg-sky-50 p-3 rounded-full w-fit mb-4 text-primary">
            <Activity size={32} />
          </div>
          <h3 className="text-xl font-bold mb-2 text-foreground">Continuous Improvement</h3>
          <p className="text-slate-600">Help us enhance our medical facilities and patient care standards.</p>
        </div>
      </div>
    </div>
  );
}

