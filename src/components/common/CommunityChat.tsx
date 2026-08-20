import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import { api } from '../../lib/api.ts';
import { ChatMessage } from '../../types/index.ts';
import { 
  MessageSquare, 
  Send, 
  X, 
  ShieldCheck, 
  Crown, 
  Users,
  Image as ImageIcon,
  Mic,
  Square,
  Paperclip,
  Headphones,
  ShieldAlert,
  UserCheck
} from 'lucide-react';

export const CommunityChat: React.FC = () => {
  const { currentUser, showToast } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Direct Admin Toggle
  const [isDirectAdminMode, setIsDirectAdminMode] = useState(false);

  // Image Upload State (Max 2MB)
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Audio Recording State (Max 1MB)
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [recordedAudio, setRecordedAudio] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isOpenRef = useRef(isOpen);

  isOpenRef.current = isOpen;

  // Load chat history on mount
  useEffect(() => {
    loadChatHistory();
  }, []);

  // Listen for SSE new_chat_message custom events
  useEffect(() => {
    const handleNewMessage = (e: any) => {
      const newMsg: ChatMessage = e.detail;
      setMessages((prev) => {
        if (prev.some((m) => m.id === newMsg.id)) return prev;
        return [...prev, newMsg];
      });

      if (!isOpenRef.current) {
        setUnreadCount((c) => c + 1);
      }
    };

    window.addEventListener('new_chat_message', handleNewMessage);
    return () => {
      window.removeEventListener('new_chat_message', handleNewMessage);
    };
  }, []);

  // Auto-scroll to bottom on new message if open
  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setUnreadCount(0);
    }
  }, [messages, isOpen]);

  const loadChatHistory = async () => {
    try {
      const history = await api.getChatMessages();
      setMessages(history);
    } catch (err) {
      console.error('Error loading chat history:', err);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Image Handling (Auto-Compressed canvas to ~50KB)
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 8 * 1024 * 1024) {
      showToast('A imagem excede o limite máximo permitido de 8MB.', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 800;
        const MAX_HEIGHT = 800;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height = Math.round((height * MAX_WIDTH) / width);
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width = Math.round((width * MAX_HEIGHT) / height);
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.7);
          setSelectedImage(compressedDataUrl);
        } else {
          setSelectedImage(event.target?.result as string);
        }
      };
      img.onerror = () => {
        setSelectedImage(event.target?.result as string);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Audio Recording (Cross-browser compatible MIME type detection)
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];

      const mimeTypes = [
        'audio/webm;codecs=opus',
        'audio/webm',
        'audio/mp4',
        'audio/aac',
        'audio/ogg'
      ];
      const selectedMime = mimeTypes.find(type => typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported(type)) || '';

      const mediaRecorder = selectedMime 
        ? new MediaRecorder(stream, { mimeType: selectedMime })
        : new MediaRecorder(stream);
        
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const typeToUse = selectedMime || 'audio/mp4';
        const audioBlob = new Blob(audioChunksRef.current, { type: typeToUse });
        
        if (audioBlob.size > 3 * 1024 * 1024) {
          showToast('O áudio gravado excede o limite máximo permitido de 3MB.', 'error');
          setRecordedAudio(null);
        } else {
          const reader = new FileReader();
          reader.onload = () => {
            setRecordedAudio(reader.result as string);
          };
          reader.readAsDataURL(audioBlob);
        }

        // Stop all audio tracks
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => {
          if (prev >= 60) {
            stopRecording();
            return 60;
          }
          return prev + 1;
        });
      }, 1000);
    } catch (err) {
      showToast('Permissão de microfone negada ou indisponível.', 'error');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      showToast('Faça login para interagir no chat', 'info');
      return;
    }

    if (!inputMessage.trim() && !selectedImage && !recordedAudio) {
      return;
    }

    setIsSending(true);
    try {
      const res = await api.sendChatMessage(currentUser.id, inputMessage, {
        imageUrl: selectedImage || undefined,
        audioUrl: recordedAudio || undefined,
        isDirectAdmin: isDirectAdminMode
      });

      if (res.success) {
        setInputMessage('');
        setSelectedImage(null);
        setRecordedAudio(null);
        if (isDirectAdminMode) {
          showToast('Mensagem direta enviada para a equipa de Administração!', 'success');
        }
      } else {
        showToast(res.error || 'Erro ao enviar mensagem', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Erro de ligação ao chat', 'error');
    } finally {
      setIsSending(false);
    }
  };

  const toggleOpen = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setUnreadCount(0);
    }
  };

  return (
    <>
      {/* CHAT FLOATING TRIGGER BUTTON */}
      {!isOpen && (
        <button
          onClick={toggleOpen}
          className="fixed bottom-6 right-6 z-40 p-4 rounded-full bg-[#1769D1] hover:bg-blue-600 text-white shadow-2xl flex items-center justify-center transition-all transform hover:scale-105 active:scale-95 group border-2 border-blue-400/40"
          title="Abrir Chat Comunitário & Suporte Direto Admin"
        >
          <MessageSquare className="w-6 h-6 animate-pulse" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 font-black text-[10px] animate-bounce shadow-md">
              {unreadCount}
            </span>
          )}
          <span className="max-w-0 overflow-hidden whitespace-nowrap group-hover:max-w-xs transition-all duration-300 ease-in-out font-bold text-xs pl-0 group-hover:pl-2">
            Chat & Suporte Admin
          </span>
        </button>
      )}

      {/* CHAT WINDOW */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-full max-w-sm sm:max-w-md h-[560px] bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5">
          {/* Header */}
          <div className="bg-slate-950 p-3.5 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  isDirectAdminMode 
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' 
                    : 'bg-[#1769D1]/20 text-[#1769D1] border border-[#1769D1]/40'
                }`}>
                  {isDirectAdminMode ? <Headphones className="w-4 h-4" /> : <Users className="w-4 h-4" />}
                </div>
                <span className="w-2.5 h-2.5 bg-emerald-500 border-2 border-slate-950 rounded-full absolute bottom-0 right-0"></span>
              </div>
              <div>
                <h3 className="text-xs font-black text-white flex items-center gap-1.5">
                  {isDirectAdminMode ? 'Contacto Direto ao Administrador' : 'Sala de Chat Comunitária'}
                  <span className={`text-[9px] px-1.5 py-0.2 font-mono rounded-full border ${
                    isDirectAdminMode ? 'bg-amber-950 text-amber-400 border-amber-800' : 'bg-emerald-950 text-emerald-400 border-emerald-800'
                  }`}>
                    {isDirectAdminMode ? 'Privado' : 'Ao Vivo'}
                  </span>
                </h3>
                <p className="text-[10px] text-slate-400">
                  {isDirectAdminMode ? 'Canal prioritário com verificação e mídia' : 'Troca de ideias entre investidores'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              {/* Toggle Direct Admin Mode */}
              <button
                onClick={() => setIsDirectAdminMode(!isDirectAdminMode)}
                className={`px-2.5 py-1 rounded-xl text-[10px] font-bold border transition-all flex items-center gap-1 ${
                  isDirectAdminMode
                    ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md'
                    : 'bg-slate-800 text-amber-400 border-amber-500/30 hover:bg-slate-700'
                }`}
                title="Alternar Modo de Contacto Direto ao Administrador"
              >
                <ShieldCheck className="w-3 h-3" />
                <span>{isDirectAdminMode ? 'Canal Admin' : 'Falar com Admin'}</span>
              </button>

              <button
                onClick={toggleOpen}
                className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Direct Admin Mode Banner */}
          {isDirectAdminMode && (
            <div className="px-3 py-1.5 bg-amber-950/70 border-b border-amber-800/60 text-amber-300 text-[10px] font-medium flex items-center justify-between">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                Mensagens sinalizadas com prioridade alta para a equipe de gestão.
              </span>
            </div>
          )}

          {/* Messages Container */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-950/50">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500 space-y-2">
                <MessageSquare className="w-8 h-8 text-slate-700" />
                <p className="text-xs font-bold text-slate-400">Nenhuma mensagem ainda.</p>
                <p className="text-[10px] text-slate-500">Inicie a conversa ou contacte o administrador!</p>
              </div>
            ) : (
              messages.map((msg) => {
                const isMe = currentUser?.id === msg.userId;
                const isAdmin = msg.userRole === 'admin' || msg.userRole === 'superadmin';

                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                  >
                    <div className="flex items-center gap-1.5 mb-1 px-1">
                      <span className="text-[10px] font-bold text-slate-300 flex items-center gap-1">
                        {msg.userName}
                        {isAdmin && (
                          <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 text-[9px] font-black border border-amber-500/30 flex items-center gap-0.5">
                            <ShieldCheck className="w-2.5 h-2.5 text-amber-400" />
                            Admin
                          </span>
                        )}
                        {msg.isDirectAdmin && !isAdmin && (
                          <span className="px-1.5 py-0.2 rounded bg-amber-950 text-amber-400 text-[8px] font-mono border border-amber-800">
                            Direto Admin
                          </span>
                        )}
                      </span>
                      <span className="text-[9px] text-slate-500 font-mono">
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <div
                      className={`p-3 rounded-2xl max-w-[85%] text-xs leading-relaxed shadow-md space-y-2 ${
                        isMe
                          ? 'bg-[#1769D1] text-white rounded-br-none font-medium'
                          : isAdmin
                          ? 'bg-amber-950/70 border border-amber-800/80 text-amber-100 rounded-bl-none'
                          : 'bg-slate-800 text-slate-200 border border-slate-700/60 rounded-bl-none'
                      }`}
                    >
                      {msg.message && <div>{msg.message}</div>}

                      {/* Render Image (Up to 2MB) */}
                      {msg.imageUrl && (
                        <div className="mt-1 rounded-xl overflow-hidden border border-slate-700/50">
                          <img
                            src={msg.imageUrl}
                            alt="Anexo de Imagem"
                            className="max-h-48 w-full object-cover rounded-xl"
                          />
                        </div>
                      )}

                      {/* Render Audio (Up to 1MB) */}
                      {msg.audioUrl && (
                        <div className="mt-1 pt-1 border-t border-white/10">
                          <audio controls src={msg.audioUrl} className="w-full h-8 rounded-lg" />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Media Previews */}
          {(selectedImage || recordedAudio || isRecording) && (
            <div className="px-3 py-2 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs">
              {selectedImage && (
                <div className="flex items-center gap-2 text-slate-300">
                  <ImageIcon className="w-4 h-4 text-emerald-400" />
                  <span className="text-[10px] font-bold truncate max-w-[180px]">Imagem selecionada (Máx 2MB)</span>
                  <button onClick={() => setSelectedImage(null)} className="text-red-400 font-bold ml-1">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {isRecording && (
                <div className="flex items-center gap-2 text-red-400 font-bold animate-pulse">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
                  <span className="text-[10px]">A gravar áudio... {recordingTime}s (Máx 1MB / 60s)</span>
                  <button onClick={stopRecording} className="px-2 py-0.5 bg-red-950 rounded text-red-300 text-[10px]">
                    Parar
                  </button>
                </div>
              )}

              {recordedAudio && !isRecording && (
                <div className="flex items-center gap-2 text-amber-300">
                  <Mic className="w-4 h-4 text-amber-400" />
                  <span className="text-[10px] font-bold">Áudio pronto a enviar (Máx 1MB)</span>
                  <button onClick={() => setRecordedAudio(null)} className="text-red-400 font-bold ml-1">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Input Footer */}
          <div className="p-3 bg-slate-900 border-t border-slate-800">
            {currentUser ? (
              <form onSubmit={handleSend} className="flex items-center gap-2">
                {/* Hidden File Input for Images */}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageSelect}
                  accept="image/*"
                  className="hidden"
                />

                {/* Attach Image Button */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                  title="Anexar Imagem (Até 2MB)"
                >
                  <ImageIcon className="w-4 h-4 text-cyan-400" />
                </button>

                {/* Record Audio Button */}
                <button
                  type="button"
                  onClick={isRecording ? stopRecording : startRecording}
                  className={`p-2 rounded-xl transition-colors ${
                    isRecording 
                      ? 'bg-red-600 text-white animate-pulse' 
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white'
                  }`}
                  title={isRecording ? 'Parar Gravação' : 'Gravar Áudio (Até 1MB / 60s)'}
                >
                  {isRecording ? <Square className="w-4 h-4" /> : <Mic className="w-4 h-4 text-amber-400" />}
                </button>

                <input
                  type="text"
                  placeholder={isDirectAdminMode ? "Enviar mensagem direta ao Admin..." : "Escreva a sua mensagem..."}
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#1769D1]"
                  maxLength={300}
                />

                <button
                  type="submit"
                  disabled={isSending || (!inputMessage.trim() && !selectedImage && !recordedAudio)}
                  className={`p-2.5 rounded-xl text-white font-bold transition-all shadow-md ${
                    isDirectAdminMode 
                      ? 'bg-amber-600 hover:bg-amber-500' 
                      : 'bg-[#1769D1] hover:bg-blue-600'
                  } disabled:opacity-50`}
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            ) : (
              <div className="text-center p-2 text-xs text-slate-400 bg-slate-950 rounded-xl border border-slate-800">
                Faça <strong className="text-white">Login</strong> para participar na conversa ou contactar o administrador.
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};
