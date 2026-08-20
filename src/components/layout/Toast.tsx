import React from 'react';
import { useApp } from '../../context/AppContext.tsx';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export const Toast: React.FC = () => {
  const { toastMessage } = useApp();

  if (!toastMessage) return null;

  const bgColors = {
    success: 'bg-[#071A3A] border-emerald-500 text-white',
    error: 'bg-[#DC2626] border-red-700 text-white',
    info: 'bg-[#1769D1] border-blue-400 text-white'
  };

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />,
    error: <AlertCircle className="w-5 h-5 text-white shrink-0" />,
    info: <Info className="w-5 h-5 text-cyan-300 shrink-0" />
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 max-w-md w-full px-4 animate-in fade-in slide-in-from-bottom-5 duration-300">
      <div className={`flex items-start gap-3 p-4 rounded-xl border shadow-2xl ${bgColors[toastMessage.type as keyof typeof bgColors] || bgColors.info}`}>
        {icons[toastMessage.type as keyof typeof icons] || icons.info}
        <div className="flex-1 text-xs sm:text-sm font-medium leading-relaxed">
          {toastMessage.message}
        </div>
      </div>
    </div>
  );
};
