import { Mail } from "lucide-react";

export default function SupportPage() {
  return (
    <div className="max-w-lg mx-auto px-4 py-20 text-center">
      <div className="w-14 h-14 rounded-full bg-arm-blue/10 border border-arm-blue/30 flex items-center justify-center mx-auto mb-5">
        <Mail size={22} className="text-arm-blue" />
      </div>
      <h1 className="text-2xl font-black chrome-text font-display mb-3">SUPPORT</h1>
      <p className="text-white/60 text-sm mb-6">Got feedback, found a bug, or just want to say something? Reach out directly:</p>
      <a href="mailto:tylerdesenabusiness@gmail.com" className="inline-block bg-arm-blue/15 text-arm-blue border border-arm-blue/40 text-sm font-semibold rounded px-5 py-2.5 hover:bg-arm-blue/25 transition-colors mb-8">tylerdesenabusiness@gmail.com</a>
      <p className="text-white/40 text-xs font-mono">// more features are coming soon</p>
    </div>
  );
}
