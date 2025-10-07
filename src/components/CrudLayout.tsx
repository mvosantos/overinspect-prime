import React from 'react';
import TopMenu from '../components/TopMenu';

export default function CrudLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <TopMenu />
      <main className="p-4">{children}</main>
    </div>
  );
}
