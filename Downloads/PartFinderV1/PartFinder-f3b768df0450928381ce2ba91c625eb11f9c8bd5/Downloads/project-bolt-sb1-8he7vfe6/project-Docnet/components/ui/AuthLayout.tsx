import React, { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface AuthLayoutProps {
  title: string;
  cardClassName?: string;
  children: ReactNode;
}

export function AuthLayout({ title, cardClassName = 'max-w-sm', children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-900">
      <div className="container mx-auto px-4 py-12">
        <div className={cn('mx-auto bg-gray-800 border border-red-600 rounded-lg p-6 shadow', cardClassName)}>
          <h1 className="mb-6 text-2xl font-semibold text-red-600">{title}</h1>
          {children}
        </div>
      </div>
    </div>
  );
}

