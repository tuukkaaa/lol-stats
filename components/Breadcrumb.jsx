'use client';

import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';
export default function Breadcrumb({
  items
}) {
  return <nav className="flex items-center space-x-2 text-sm text-stone-400 mb-4">
      <Link href="/" className="flex items-center hover:text-amber-400 transition-colors cursor-pointer">
        <Home className="w-4 h-4" />
      </Link>
      
      {items.map((item, index) => <div key={index} className="flex items-center space-x-2">
          <ChevronRight className="w-4 h-4" />
          {item.href ? <Link href={item.href} className="hover:text-amber-400 transition-colors cursor-pointer">
              {item.label}
            </Link> : <span className="text-stone-300 font-medium">{item.label}</span>}
        </div>)}
    </nav>;
}