'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { updateLastTab } from '@/actions/tab-actions';

const tabs = [
  { label: 'Plan', href: '/plan', slug: 'plan' },
  { label: 'This Week', href: '/this-week', slug: 'this-week' },
  { label: 'Skills', href: '/skills', slug: 'skills' },
  { label: 'Log', href: '/log', slug: 'log' },
] as const;

export function TabNav() {
  const pathname = usePathname();

  return (
    <nav className="flex border-b border-accent-light bg-paper" aria-label="Main navigation">
      {tabs.map((tab) => {
        const isActive = pathname === tab.href;
        return (
          <Link
            key={tab.slug}
            href={tab.href}
            onClick={() => updateLastTab(tab.slug)}
            className={`flex-1 py-3 text-center text-sm font-medium transition-colors focus:outline-none focus-visible:bg-accent-light/30 ${
              isActive
                ? 'border-b-2 border-accent text-accent'
                : 'text-ink-light hover:text-ink'
            }`}
            aria-current={isActive ? 'page' : undefined}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
