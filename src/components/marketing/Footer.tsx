import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-16 border-t bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 text-sm">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded bg-blue-600 text-white font-bold">A</span>
            <span className="font-bold text-black">ADS Personeelsapp</span>
          </div>
          <p className="text-black font-medium">Alles-in-één personeelsapp voor uren, verlof en goedkeuringen.</p>
        </div>
        <div>
          <h4 className="font-bold mb-3 text-black">Product</h4>
          <ul className="space-y-2 text-black font-medium">
            <li><Link href="/marketing/features" className="hover:underline">Functies</Link></li>
            <li><Link href="/marketing/pricing" className="hover:underline">Prijzen</Link></li>
            <li><Link href="/marketing/security" className="hover:underline">Beveiliging</Link></li>
            <li><Link href="/marketing/faq" className="hover:underline">FAQ</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold mb-3 text-black">Support</h4>
          <ul className="space-y-2 text-black font-medium">
            <li><a href="mailto:support@example.com" className="hover:underline">support@example.com</a></li>
            <li><a href="#" className="hover:underline">Statuspagina</a></li>
            <li><a href="#" className="hover:underline">Handleidingen</a></li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold mb-3 text-black">Juridisch</h4>
          <ul className="space-y-2 text-black font-medium">
            <li><a href="#" className="hover:underline">Privacy (AVG)</a></li>
            <li><a href="#" className="hover:underline">Verwerkersovereenkomst</a></li>
            <li><a href="#" className="hover:underline">Algemene Voorwaarden</a></li>
          </ul>
        </div>
      </div>
      <div className="border-t py-4 text-xs text-black font-medium">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <span>© {new Date().getFullYear()} ADS Personeelsapp</span>
          <div className="flex gap-4">
            <a href="#" className="hover:underline">Security</a>
            <a href="#" className="hover:underline">Responsible Disclosure</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
