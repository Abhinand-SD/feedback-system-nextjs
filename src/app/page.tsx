import Link from 'next/link';
import { ArrowRight, MessageSquare, ShieldCheck, Users } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4">
      <div className="text-center max-w-3xl mb-16">
        <h1 className="text-5xl font-bold mb-6 bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Voice Your Feedback
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          A platform to share your thoughts, report issues, and help us improve.
          Secure, simple, and effective feedback management.
        </p>
        <Link
          href="/signup"
          className="bg-blue-600 text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-blue-700 transition flex items-center gap-2 mx-auto w-fit shadow-lg hover:shadow-xl"
        >
          Get Started <ArrowRight size={20} />
        </Link>
      </div>

      <div className="grid md:grid-cols-3 gap-8 max-w-5xl w-full">
        <div className="p-6 bg-white rounded-xl shadow-md border hover:shadow-lg transition">
          <div className="bg-blue-100 p-3 rounded-full w-fit mb-4 text-blue-600">
            <ShieldCheck size={32} />
          </div>
          <h3 className="text-xl font-bold mb-2">Secure Auth</h3>
          <p className="text-gray-600">OTP-based verification and secure session management keep your account safe.</p>
        </div>
        <div className="p-6 bg-white rounded-xl shadow-md border hover:shadow-lg transition">
          <div className="bg-purple-100 p-3 rounded-full w-fit mb-4 text-purple-600">
            <MessageSquare size={32} />
          </div>
          <h3 className="text-xl font-bold mb-2">Easy Feedback</h3>
          <p className="text-gray-600">Submit bugs, feature requests, or general feedback instantly.</p>
        </div>
        <div className="p-6 bg-white rounded-xl shadow-md border hover:shadow-lg transition">
          <div className="bg-green-100 p-3 rounded-full w-fit mb-4 text-green-600">
            <Users size={32} />
          </div>
          <h3 className="text-xl font-bold mb-2">Community Driven</h3>
          <p className="text-gray-600">Help shape the future of the product with your valuable inputs.</p>
        </div>
      </div>
    </div>
  );
}
