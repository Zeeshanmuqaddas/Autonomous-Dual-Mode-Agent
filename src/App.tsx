/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { ChatInterface } from './components/ChatInterface';
import type { AgentResponse } from './lib/gemini';

export default function App() {
  const [currentMode, setCurrentMode] = useState<AgentResponse['mode']>('General');
  const [messageCount, setMessageCount] = useState(0);

  return (
    <div className="flex h-screen w-full bg-black text-gray-900 font-sans antialiased overflow-hidden">
      <Sidebar currentMode={currentMode} messageCount={messageCount} />
      <ChatInterface 
        onModeChange={setCurrentMode} 
        onMessageCountChange={setMessageCount} 
      />
    </div>
  );
}
