import React from 'react';
import { Bot, BriefcaseBusiness, GraduationCap, Database, Zap, Clock } from 'lucide-react';
import { cn } from '../lib/utils';
import type { AgentResponse } from '../lib/gemini';

interface SidebarProps {
  currentMode: AgentResponse['mode'];
  messageCount: number;
}

export function Sidebar({ currentMode, messageCount }: SidebarProps) {
  return (
    <aside className="w-72 hidden md:flex bg-gray-900 border-r border-gray-800 flex-col h-full text-gray-300">
      <div className="p-6 border-b border-gray-800 flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 rounded-lg p-2 text-white">
            <Bot size={24} />
          </div>
          <h1 className="text-xl font-semibold text-white tracking-tight">Agent OS</h1>
        </div>
        <p className="text-xs text-gray-400 mt-2 leading-relaxed">
          Autonomous Dual-Role Assistant.
          Detects intent and switches modes automatically.
        </p>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Active Mode */}
        <div>
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Active Mode
          </h2>
          <div className="flex flex-col gap-2">
            <ModeItem 
              mode="Business Automation" 
              currentMode={currentMode} 
              icon={BriefcaseBusiness} 
              colorClass="text-emerald-400 bg-emerald-400/10 border-emerald-400/20"
            />
            <ModeItem 
              mode="Study Coach" 
              currentMode={currentMode} 
              icon={GraduationCap} 
              colorClass="text-purple-400 bg-purple-400/10 border-purple-400/20"
            />
            <ModeItem 
              mode="General" 
              currentMode={currentMode} 
              icon={Zap} 
              colorClass="text-blue-400 bg-blue-400/10 border-blue-400/20"
            />
          </div>
        </div>

        {/* System Tools */}
        <div>
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
            System Tools
          </h2>
          <div className="space-y-2">
            <ToolItem icon={Database} label="PostgreSQL (Memory)" status="Connected" />
            <ToolItem icon={Clock} label="Redis (Context)" status={messageCount > 0 ? 'Active' : 'Idle'} />
          </div>
        </div>
      </div>
      
      <div className="p-4 border-t border-gray-800 text-xs text-gray-500 flex items-center justify-between">
        <span>Status: Online</span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          Ready
        </span>
      </div>
    </aside>
  );
}

function ModeItem({ mode, currentMode, icon: Icon, colorClass }: { mode: string, currentMode: string, icon: React.ElementType, colorClass: string }) {
  const isActive = mode === currentMode;
  
  return (
    <div className={cn(
      "flex items-center gap-3 px-3 py-2.5 rounded-md border transition-all duration-200",
      isActive 
        ? cn("border-transparent", colorClass)
        : "border-transparent text-gray-500 hover:bg-gray-800"
    )}>
      <Icon size={18} />
      <span className="text-sm font-medium">{mode}</span>
      {isActive && (
        <span className="ml-auto w-1.5 h-1.5 rounded-full bg-current shadow-[0_0_8px_currentColor]" />
      )}
    </div>
  );
}

function ToolItem({ icon: Icon, label, status }: { icon: React.ElementType, label: string, status: string }) {
  return (
    <div className="flex items-center justify-between px-3 py-2 text-sm rounded-md bg-gray-800/50">
      <div className="flex items-center gap-2">
        <Icon size={16} className="text-gray-400" />
        <span className="text-gray-300">{label}</span>
      </div>
      <span className={cn(
        "text-[10px] px-1.5 py-0.5 rounded uppercase font-medium",
        status === 'Connected' || status === 'Active' ? "text-emerald-400 bg-emerald-400/10" : "text-gray-400 bg-gray-700"
      )}>
        {status}
      </span>
    </div>
  );
}
