import React, { useState } from 'react';
import { Employee } from '../types';
import { X, Sparkles, Send, Bot, User, Loader2 } from 'lucide-react';

interface AiAssistantDrawerProps {
  employee: Employee;
  onClose: () => void;
}

interface Message {
  sender: 'user' | 'ai';
  text: string;
}

export const AiAssistantDrawer: React.FC<AiAssistantDrawerProps> = ({
  employee,
  onClose,
}) => {
  const [input, setInput] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'ai',
      text: `¡Hola ${employee.firstName}! Soy **LicenciIA**, tu asistente de Recursos Humanos y Legislación Laboral. ¿En qué puedo ayudarte hoy con respecto a vacaciones, licencias o políticas de la empresa?`,
    },
  ]);
  const [loading, setLoading] = useState<boolean>(false);

  const suggestedQuestions = [
    '¿Cuántos días de vacaciones me corresponden por antigüedad?',
    '¿Qué documentación necesito para una licencia médica?',
    '¿Cómo funciona el flujo de aprobación en 2 niveles?',
    '¿Los permisos por horas descuentan días anuales?',
  ];

  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim()) return;

    setMessages((prev) => [...prev, { sender: 'user', text: query }]);
    if (!textToSend) setInput('');
    setLoading(true);

    try {
      const response = await fetch('/api/ai/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: query,
          employeeContext: {
            name: `${employee.firstName} ${employee.lastName}`,
            position: employee.position,
            hireDate: employee.hireDate,
            role: employee.role,
          },
        }),
      });

      const data = await response.json();
      setMessages((prev) => [
        ...prev,
        { sender: 'ai', text: data.answer || 'No pude obtener respuesta en este momento.' },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: 'Las vacaciones se calculan según tu fecha de alta en la empresa: Hasta 5 años (14 días), 5 a 10 años (21 días), 10 a 20 años (28 días) y más de 20 años (35 días).',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-end p-0 sm:p-4">
      <div className="bg-white dark:bg-slate-900 w-full sm:max-w-md h-full sm:h-auto sm:max-h-[85vh] sm:rounded-3xl border-l sm:border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col animate-slide-left overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-violet-600 to-indigo-600 text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h3 className="font-bold text-sm">LicenciIA Copilot</h3>
              <p className="text-[11px] text-indigo-100">Asistente Virtual de RRHH</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-white/80 hover:text-white rounded-full hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Messages */}
        <div className="p-4 space-y-3 overflow-y-auto flex-1 text-xs">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.sender === 'ai' && (
                <div className="w-7 h-7 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-600 flex items-center justify-center shrink-0 mt-0.5">
                  <Bot className="w-4 h-4" />
                </div>
              )}
              <div
                className={`p-3 rounded-2xl max-w-[85%] whitespace-pre-wrap ${
                  msg.sender === 'user'
                    ? 'bg-indigo-600 text-white font-medium rounded-tr-none'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-none border border-slate-200/50 dark:border-slate-700/50'
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-2 text-slate-400 text-xs italic">
              <Loader2 className="w-4 h-4 animate-spin text-indigo-500" />
              <span>LicenciIA está consultando las políticas...</span>
            </div>
          )}
        </div>

        {/* Suggestions */}
        <div className="p-3 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 text-[11px]">
          <span className="text-slate-400 font-semibold block mb-1.5">Preguntas Frecuentes:</span>
          <div className="flex flex-wrap gap-1.5">
            {suggestedQuestions.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(q)}
                className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-indigo-400 text-left line-clamp-1"
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        {/* Input */}
        <div className="p-3 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              placeholder="Escribe tu consulta laboral o de licencias..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="p-2.5 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
