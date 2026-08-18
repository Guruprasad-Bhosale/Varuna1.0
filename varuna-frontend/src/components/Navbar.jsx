import React from 'react';
import { Search, Bell, User, Menu } from 'lucide-react';

export default function Navbar({ lastSyncTime }) {
  const currentDate = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
  });

  return (
    <header className="h-16 bg-surface border-b border-border px-6 flex items-center justify-between sticky top-0 z-30">
      {/* Left side: Page Title & Date */}
      <div className="flex items-center gap-4">
        <button className="lg:hidden text-textMuted hover:text-navy">
          <Menu className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-lg font-semibold text-navy">River Intelligence</h2>
          <div className="flex items-center gap-2 text-xs text-textMuted">
            <span>{currentDate}</span>
            <span className="w-1 h-1 rounded-full bg-border"></span>
            <span>Last sync: {lastSyncTime ? new Date(lastSyncTime).toLocaleTimeString() : 'Connecting...'}</span>
          </div>
        </div>
      </div>

      {/* Right side: Search, Notifications, Profile */}
      <div className="flex items-center gap-6">
        {/* Search */}
        <div className="hidden md:flex relative">
          <Search className="w-4 h-4 text-textMuted absolute left-3 top-1/2 -translate-y-1/2" />
          <input 
            type="text" 
            placeholder="Search nodes or locations..." 
            className="pl-9 pr-4 py-1.5 text-sm bg-background border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-teal focus:border-teal w-64 transition-all"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 border-l border-border pl-6">
          <button 
            onClick={() => window.dispatchEvent(new CustomEvent('open-whatsapp-modal'))}
            className="p-2 text-textMuted hover:text-teal hover:bg-background rounded-full transition-colors relative"
            title="WhatsApp Gateway Status"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21"/><path d="M9 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1a5 5 0 0 0 5 5h1a.5.5 0 0 0 0-1h-1a.5.5 0 0 0 0 1"/></svg>
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-safe rounded-full border border-surface"></span>
          </button>
          
          <button className="p-2 text-textMuted hover:text-navy hover:bg-background rounded-full transition-colors relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-moderate rounded-full border border-surface"></span>
          </button>
          <button className="flex items-center gap-2 p-1 hover:bg-background rounded-md transition-colors">
            <div className="w-8 h-8 bg-tealLight text-teal rounded-full flex items-center justify-center font-semibold text-sm">
              OP
            </div>
            <div className="hidden md:block text-left">
              <div className="text-sm font-medium text-navy leading-none">Operator</div>
              <div className="text-xs text-textMuted mt-1">Field Admin</div>
            </div>
          </button>
        </div>
      </div>
    </header>
  );
}
