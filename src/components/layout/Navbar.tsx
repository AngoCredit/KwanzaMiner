import React, { useState } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import { BrandLogo } from '../common/BrandLogo.tsx';
import { 
  Bell, 
  User as UserIcon, 
  LogOut, 
  Shield, 
  Wallet, 
  Layers, 
  ArrowUpRight, 
  ArrowDownLeft, 
  TrendingUp, 
  Menu, 
  X, 
  CheckCircle2, 
  Sparkles,
  RefreshCw,
  Coins,
  ChevronDown
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { 
    currentUser, 
    wallet, 
    kcRate, 
    currentRoute, 
    setCurrentRoute, 
    setAuthModalOpen, 
    setAuthMode, 
    logout, 
    notifications, 
    unreadCount,
    showToast
  } = useApp();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);

  const isAdmin = currentUser?.role === 'admin' || currentUser?.role === 'superadmin';
  const isDashboardRoute = currentRoute.startsWith('/dashboard') || currentRoute.startsWith('/admin');

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      {/* Live Market & System Status Banner */}
      <div className="bg-[#071A3A] text-slate-200 text-xs px-4 py-1.5 flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-4 overflow-x-auto scrollbar-none py-0.5">
          <div className="flex items-center gap-1.5 font-medium whitespace-nowrap">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-slate-400">Cotação Oficial KC:</span>
            <span className="text-amber-400 font-bold">1 KC = {kcRate.rateAoa.toLocaleString('pt-AO')} AOA</span>
            <span className="text-emerald-400 text-[10px] bg-emerald-950/60 px-1 py-0.5 rounded border border-emerald-800 font-bold">
              +{kcRate.change24h}% 24h
            </span>
          </div>

          <div className="hidden md:flex items-center gap-1 text-slate-400 whitespace-nowrap border-l border-slate-700 pl-3">
            <Coins className="w-3.5 h-3.5 text-amber-400" />
            <span>Mínimo de Entrada:</span>
            <strong className="text-white">6.000 AOA</strong>
          </div>

          <div className="hidden lg:flex items-center gap-1 text-slate-400 whitespace-nowrap border-l border-slate-700 pl-3">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Mineração em Tempo Real:</span>
            <strong className="text-emerald-400">Ativa 24/24h</strong>
          </div>
        </div>

        {/* Security / User Status Badge */}
        <div className="flex items-center gap-2">
          {currentUser ? (
            <div className="flex items-center gap-1.5 text-xs bg-slate-800/90 text-slate-200 px-2.5 py-0.5 rounded-md border border-slate-700">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              <span className="text-[11px] text-amber-400 font-semibold">
                {currentUser.name.split(' ')[0]}
              </span>
              <span className="text-[10px] px-1 rounded bg-slate-900 text-slate-300 uppercase font-mono">
                {currentUser.role}
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-1 text-[11px] text-slate-400">
              <Shield className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Acesso Seguro SSL 256-bit</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div onClick={() => setCurrentRoute('/')}>
          <BrandLogo size="md" variant="dark" />
        </div>

        {/* Public & App Links */}
        <nav className="hidden lg:flex items-center gap-6">
          <button 
            onClick={() => setCurrentRoute('/')}
            className={`text-sm font-semibold transition-colors ${currentRoute === '/' ? 'text-[#1769D1]' : 'text-slate-600 hover:text-slate-900'}`}
          >
            Início
          </button>
          <button 
            onClick={() => setCurrentRoute('/planos')}
            className={`text-sm font-semibold transition-colors ${currentRoute === '/planos' ? 'text-[#1769D1]' : 'text-slate-600 hover:text-slate-900'}`}
          >
            Planos
          </button>
          <button 
            onClick={() => setCurrentRoute('/como-funciona')}
            className={`text-sm font-semibold transition-colors ${currentRoute === '/como-funciona' ? 'text-[#1769D1]' : 'text-slate-600 hover:text-slate-900'}`}
          >
            Como Funciona
          </button>
          <button 
            onClick={() => setCurrentRoute('/kwanzacoin')}
            className={`text-sm font-semibold transition-colors flex items-center gap-1 ${currentRoute === '/kwanzacoin' ? 'text-[#1769D1]' : 'text-slate-600 hover:text-slate-900'}`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
            KwanzaCoin (KC)
          </button>
          <button 
            onClick={() => setCurrentRoute('/sobre')}
            className={`text-sm font-semibold transition-colors ${currentRoute === '/sobre' ? 'text-slate-900' : 'text-slate-600 hover:text-slate-900'}`}
          >
            Sobre Nós
          </button>
          <button 
            onClick={() => setCurrentRoute('/faq')}
            className={`text-sm font-semibold transition-colors ${currentRoute === '/faq' ? 'text-[#1769D1]' : 'text-slate-600 hover:text-slate-900'}`}
          >
            FAQ
          </button>
        </nav>

        {/* Right Action Bar */}
        <div className="flex items-center gap-3">
          {currentUser ? (
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Quick Balance Preview on Desktop */}
              {wallet && (
                <div 
                  onClick={() => setCurrentRoute('/dashboard/carteira')}
                  className="hidden md:flex flex-col text-right cursor-pointer hover:opacity-80 transition-opacity bg-slate-50 px-3 py-1 rounded-lg border border-slate-200/80"
                >
                  <span className="text-[10px] text-slate-500 font-medium uppercase">Saldo Disponível</span>
                  <span className="text-xs font-bold text-slate-900">
                    {wallet.availableBalance.toLocaleString('pt-AO', { minimumFractionDigits: 2 })} AOA
                  </span>
                </div>
              )}

              {/* Notifications Dropdown */}
              <div className="relative">
                <button
                  id="btn-notifications-toggle"
                  onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
                  className="relative p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                  title="Notificações em tempo real"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[#DC2626] text-white text-[10px] font-bold flex items-center justify-center animate-bounce">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {notifDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-2xl border border-slate-200 p-3 z-50">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                      <div className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                        <Bell className="w-4 h-4 text-[#1769D1]" />
                        <span>Notificações</span>
                        <span className="text-xs text-slate-500 font-normal">({notifications.length})</span>
                      </div>
                      <span className="text-[11px] text-[#1769D1] font-medium cursor-pointer hover:underline">
                        Em tempo real
                      </span>
                    </div>

                    <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 py-1">
                      {notifications.length === 0 ? (
                        <div className="text-center py-6 text-xs text-slate-500">
                          Sem novas notificações
                        </div>
                      ) : (
                        notifications.slice(0, 5).map((n) => (
                          <div key={n.id} className={`py-2.5 px-2 hover:bg-slate-50 rounded-lg transition-colors ${!n.read ? 'bg-blue-50/40' : ''}`}>
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-slate-900">{n.title}</span>
                              <span className="text-[10px] text-slate-400">
                                {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">{n.message}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Enter Dashboard / Admin button */}
              <button
                id="btn-goto-dashboard"
                onClick={() => setCurrentRoute(isAdmin ? '/admin' : '/dashboard')}
                className="flex items-center gap-2 text-xs font-bold px-3.5 py-2 rounded-lg text-white shadow-sm transition-all hover:shadow"
                style={{
                  background: isAdmin 
                    ? 'linear-gradient(135deg, #071A3A 0%, #1769D1 100%)' 
                    : 'linear-gradient(135deg, #1769D1 0%, #071A3A 100%)'
                }}
              >
                {isAdmin ? <Shield className="w-4 h-4 text-amber-300" /> : <Layers className="w-4 h-4 text-white" />}
                <span>{isAdmin ? 'Painel Admin' : 'Meu Dashboard'}</span>
              </button>

              {/* User Logout Button */}
              <button
                id="btn-logout"
                onClick={logout}
                className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Terminar Sessão"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                id="btn-nav-login"
                onClick={() => {
                  setAuthMode('login');
                  setAuthModalOpen(true);
                }}
                className="text-xs font-semibold text-slate-700 hover:text-[#1769D1] px-3 py-2 rounded-lg transition-colors"
              >
                Entrar
              </button>
              <button
                id="btn-nav-register"
                onClick={() => {
                  setAuthMode('register');
                  setAuthModalOpen(true);
                }}
                className="text-xs font-bold text-white bg-[#1769D1] hover:bg-[#1357ad] px-4 py-2 rounded-lg shadow-sm transition-all"
              >
                Criar Conta
              </button>
            </div>
          )}

          {/* Mobile Menu Button */}
          <button
            id="btn-mobile-menu"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-slate-200 px-4 pt-2 pb-6 space-y-3 shadow-lg">
          <div className="flex flex-col space-y-2">
            <button
              onClick={() => {
                setCurrentRoute('/');
                setMobileMenuOpen(false);
              }}
              className="text-left py-2 font-semibold text-slate-800 hover:text-[#1769D1]"
            >
              Início
            </button>
            <button
              onClick={() => {
                setCurrentRoute('/planos');
                setMobileMenuOpen(false);
              }}
              className="text-left py-2 font-semibold text-slate-800 hover:text-[#1769D1]"
            >
              Planos de Investimento (A partir de 6.000 AOA)
            </button>
            <button
              onClick={() => {
                setCurrentRoute('/como-funciona');
                setMobileMenuOpen(false);
              }}
              className="text-left py-2 font-semibold text-slate-800 hover:text-[#1769D1]"
            >
              Como Funciona (7 Passos)
            </button>
            <button
              onClick={() => {
                setCurrentRoute('/kwanzacoin');
                setMobileMenuOpen(false);
              }}
              className="text-left py-2 font-semibold text-slate-800 hover:text-[#1769D1]"
            >
              KwanzaCoin (KC Token)
            </button>
            <button
              onClick={() => {
                setCurrentRoute('/sobre');
                setMobileMenuOpen(false);
              }}
              className="text-left py-2 font-semibold text-slate-800 hover:text-[#1769D1]"
            >
              Sobre a Plataforma
            </button>
            <button
              onClick={() => {
                setCurrentRoute('/faq');
                setMobileMenuOpen(false);
              }}
              className="text-left py-2 font-semibold text-slate-800 hover:text-[#1769D1]"
            >
              Perguntas Frequentes (FAQ)
            </button>
            <button
              onClick={() => {
                setCurrentRoute('/contactos');
                setMobileMenuOpen(false);
              }}
              className="text-left py-2 font-semibold text-slate-800 hover:text-[#1769D1]"
            >
              Contactos & Apoio ao Cliente
            </button>
          </div>

          {currentUser && (
            <div className="pt-3 border-t border-slate-100">
              <button
                onClick={() => {
                  setCurrentRoute(isAdmin ? '/admin' : '/dashboard');
                  setMobileMenuOpen(false);
                }}
                className="w-full text-center py-2.5 rounded-lg bg-[#1769D1] text-white font-bold text-sm"
              >
                Abrir {isAdmin ? 'Painel de Administração' : 'Dashboard de Investidor'}
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
