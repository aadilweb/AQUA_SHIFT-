import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageSquare, 
  X, 
  Send, 
  Mic, 
  MicOff, 
  Volume2, 
  Square, 
  Key, 
  Sparkles, 
  Bot, 
  User, 
  RefreshCw,
  ExternalLink,
  CheckCircle2,
  Languages,
  Headphones,
  Radio
} from 'lucide-react';
import { 
  ChatMessage, 
  FarmContextPayload, 
  sendChatMessage, 
  getStoredGroqKey, 
  setStoredGroqKey, 
  getStoredGroqModel, 
  setStoredGroqModel,
  fetchAvailableGroqModels,
  GROQ_CANDIDATE_MODELS
} from '../services/groqChatService';

interface KisanChatbotProps {
  farmContext: FarmContextPayload;
}

const QUICK_PROMPTS = [
  { label: "💧 Paddy Water Savings", prompt: "How can I reduce water consumption on Paddy without losing yield?" },
  { label: "🌾 Moong (Green Gram) Profit", prompt: "Why is Moong recommended and how much net income can it generate per hectare?" },
  { label: "🚜 PM-KUSUM & Drip Subsidy", prompt: "What government subsidies are available for solar pumps and drip irrigation in my state?" },
  { label: "🌧️ Borewell Depletion Strategy", prompt: "My local groundwater is over 34 meters deep. What crop shifting strategy should I adopt?" }
];

const VOICE_LANGUAGES = [
  { code: 'hi-IN', label: 'हिन्दी (Hindi)' },
  { code: 'pa-IN', label: 'ਪੰਜਾਬੀ (Punjabi)' },
  { code: 'en-IN', label: 'English (India)' },
  { code: 'mr-IN', label: 'मराठी (Marathi)' },
  { code: 'te-IN', label: 'తెలుగు (Telugu)' }
];

/**
 * Strips all markdown symbols, asterisks, bullet dashes, hash titles, 
 * markdown tables, HTML tags, and emojis so Text-to-Speech speaks like a human.
 */
function cleanTextForSpeech(raw: string): string {
  return raw
    // Remove emojis
    .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{FE00}-\u{FE0F}\u{1F1E6}-\u{1F1FF}]/gu, '')
    // Remove Markdown tables (| column | column |)
    .replace(/\|.*?\|/g, ' ')
    .replace(/[-:]{3,}/g, ' ')
    // Remove bold/italic asterisks & underscores
    .replace(/\*+/g, '')
    .replace(/_+/g, '')
    // Remove markdown headers
    .replace(/^#+\s+/gm, '')
    // Remove markdown links e.g. [text](url) -> text
    .replace(/\[(.*?)\]\(.*?\)/g, '$1')
    .replace(/https?:\/\/\S+/g, '')
    // Remove code blocks
    .replace(/`{1,3}.*?`{1,3}/gs, '')
    // Replace bullet points and dashes
    .replace(/^\s*[-•*]\s+/gm, '')
    // Remove HTML tags
    .replace(/<[^>]*>/g, '')
    // Clean up excessive whitespace
    .replace(/\s+/g, ' ')
    .trim();
}

export const KisanChatbot: React.FC<KisanChatbotProps> = ({ farmContext }) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `Welcome to Kisan AI Mitra, your agricultural advisor powered by Groq.

I have analyzed your farm in ${farmContext.location || 'Punjab'} (${farmContext.total_land_ha || 25} hectares, annual water budget: ${((farmContext.water_budget_m3 || 180000)/1000).toFixed(0)}k cubic meters).

You can speak to me naturally in Hindi, Punjabi, or English using the microphone. Turn on Hands-Free Walkie-Talkie mode to talk back and forth continuously like a live phone call!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputMessage, setInputMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Settings & Keys
  const [isKeyModalOpen, setIsKeyModalOpen] = useState<boolean>(false);
  const [groqKey, setGroqKey] = useState<string>('');
  const [selectedModel, setSelectedModel] = useState<string>('llama-3.3-70b-versatile');
  const [availableModels, setAvailableModels] = useState<string[]>(GROQ_CANDIDATE_MODELS);
  const [keySavedNotification, setKeySavedNotification] = useState<boolean>(false);

  // Voice Recording (Microphone) State
  const [isListening, setIsListening] = useState<boolean>(false);
  const [voiceLang, setVoiceLang] = useState<string>('hi-IN');
  const [isContinuousVoiceMode, setIsContinuousVoiceMode] = useState<boolean>(false);
  
  const recognitionRef = useRef<any>(null);
  const isContinuousVoiceModeRef = useRef<boolean>(false);
  const isSpeakingRef = useRef<boolean>(false);
  const isLoadingRef = useRef<boolean>(false);

  // Text-To-Speech (Audio Output) State
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Synchronize refs
  useEffect(() => {
    isContinuousVoiceModeRef.current = isContinuousVoiceMode;
  }, [isContinuousVoiceMode]);

  useEffect(() => {
    isLoadingRef.current = isLoading;
  }, [isLoading]);

  // Initialize Key & Model on Mount
  useEffect(() => {
    const key = getStoredGroqKey();
    setGroqKey(key);
    const model = getStoredGroqModel();
    setSelectedModel(model);
    if (key && key.startsWith('gsk_')) {
      void fetchAvailableGroqModels(key).then(models => {
        if (models && models.length > 0) setAvailableModels(models);
      });
    }
  }, []);

  // Fetch available models whenever modal opens
  useEffect(() => {
    if (isKeyModalOpen && groqKey && groqKey.startsWith('gsk_')) {
      void fetchAvailableGroqModels(groqKey).then(models => {
        if (models && models.length > 0) setAvailableModels(models);
      });
    }
  }, [isKeyModalOpen, groqKey]);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = voiceLang;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setInputMessage(transcript);
      };

      recognition.onerror = (event: any) => {
        console.warn("Speech recognition error:", event.error);
        setIsListening(false);
        // If continuous mode and not an abort, restart listening after pause
        if (isContinuousVoiceModeRef.current && !isSpeakingRef.current && !isLoadingRef.current) {
          setTimeout(() => {
            if (isContinuousVoiceModeRef.current && !isSpeakingRef.current && !isLoadingRef.current) {
              try { recognition.start(); } catch (_) {}
            }
          }, 1500);
        }
      };

      recognition.onend = () => {
        setIsListening(false);

        // In continuous voice mode: if user finished a sentence, automatically submit it!
        setInputMessage((currentText) => {
          const trimmed = currentText.trim();
          if (trimmed.length > 2 && !isLoadingRef.current && !isSpeakingRef.current) {
            setTimeout(() => {
              void handleSendMessage(trimmed);
            }, 100);
            return '';
          }
          // If no speech, re-arm listening in continuous mode
          if (isContinuousVoiceModeRef.current && !isSpeakingRef.current && !isLoadingRef.current) {
            setTimeout(() => {
              if (isContinuousVoiceModeRef.current && !isSpeakingRef.current && !isLoadingRef.current) {
                try { recognition.start(); } catch (_) {}
              }
            }, 800);
          }
          return currentText;
        });
      };

      recognitionRef.current = recognition;
    }
  }, [voiceLang]);

  // Safely start microphone
  const startListening = () => {
    if (!recognitionRef.current || isSpeakingRef.current || isLoadingRef.current) return;
    try {
      recognitionRef.current.lang = voiceLang;
      recognitionRef.current.start();
    } catch (_) {}
  };

  // Safely stop microphone
  const stopListening = () => {
    if (!recognitionRef.current) return;
    try {
      recognitionRef.current.stop();
    } catch (_) {}
    setIsListening(false);
  };

  // Toggle Standard Mic
  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert("Voice speech recognition is not supported in this browser. Please use Google Chrome or Microsoft Edge.");
      return;
    }
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  // Toggle Hands-Free Continuous Conversation Loop
  const toggleContinuousMode = () => {
    const nextState = !isContinuousVoiceMode;
    setIsContinuousVoiceMode(nextState);
    isContinuousVoiceModeRef.current = nextState;

    if (nextState) {
      startListening();
    } else {
      stopListening();
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      setSpeakingMessageId(null);
      isSpeakingRef.current = false;
    }
  };

  // Human-Sounding Speech Synthesis (TTS) without asterisks, tables, or emojis
  const speakText = (rawText: string, msgId: string, autoContinueAfter = false) => {
    if (!('speechSynthesis' in window)) return;

    if (speakingMessageId === msgId && !autoContinueAfter) {
      window.speechSynthesis.cancel();
      setSpeakingMessageId(null);
      isSpeakingRef.current = false;
      return;
    }

    // Stop microphone before AI speaks to prevent mic feedback
    stopListening();
    window.speechSynthesis.cancel();

    // Clean text completely: NO asterisks, NO markdown tables, NO emojis!
    const cleanSpeech = cleanTextForSpeech(rawText);
    if (!cleanSpeech) return;

    const utterance = new SpeechSynthesisUtterance(cleanSpeech);
    
    // Choose appropriate regional voice language
    if (/[\u0A00-\u0A7F]/.test(cleanSpeech)) {
      utterance.lang = 'pa-IN'; // Punjabi
    } else if (/[\u0900-\u097F]/.test(cleanSpeech)) {
      utterance.lang = 'hi-IN'; // Hindi
    } else {
      utterance.lang = 'en-IN'; // Indian English
    }

    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    utterance.onstart = () => {
      setSpeakingMessageId(msgId);
      isSpeakingRef.current = true;
    };

    utterance.onend = () => {
      setSpeakingMessageId(null);
      isSpeakingRef.current = false;

      // CONTINUOUS CONVERSATION: When AI finishes speaking, immediately re-open mic for user!
      if (isContinuousVoiceModeRef.current || autoContinueAfter) {
        setTimeout(() => {
          if (isContinuousVoiceModeRef.current && !isSpeakingRef.current) {
            startListening();
          }
        }, 500);
      }
    };

    utterance.onerror = () => {
      setSpeakingMessageId(null);
      isSpeakingRef.current = false;
      if (isContinuousVoiceModeRef.current) {
        setTimeout(startListening, 600);
      }
    };

    window.speechSynthesis.speak(utterance);
  };

  // Send Message Action
  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || isLoading) return;

    stopListening();

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setIsLoading(true);
    isLoadingRef.current = true;

    try {
      const historyPayload = messages
        .filter(m => m.id !== 'welcome')
        .concat(userMsg)
        .map(m => ({ role: m.role, content: m.content }));

      const res = await sendChatMessage(
        historyPayload,
        farmContext,
        groqKey,
        selectedModel
      );

      const botMsgId = (Date.now() + 1).toString();
      const botMsg: ChatMessage = {
        id: botMsgId,
        role: 'assistant',
        content: res.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages((prev) => [...prev, botMsg]);

      // If continuous conversation mode is active, automatically speak answer aloud!
      if (isContinuousVoiceModeRef.current) {
        speakText(res.reply, botMsgId, true);
      }
    } catch (err) {
      console.error("Chat error:", err);
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I encountered an error connecting to Groq. Please check your network or API key.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, errorMsg]);
      if (isContinuousVoiceModeRef.current) {
        speakText(errorMsg.content, errorMsg.id || '', true);
      }
    } finally {
      setIsLoading(false);
      isLoadingRef.current = false;
    }
  };

  const handleSaveKey = (e: React.FormEvent) => {
    e.preventDefault();
    setStoredGroqKey(groqKey);
    setStoredGroqModel(selectedModel);
    setKeySavedNotification(true);
    setTimeout(() => {
      setKeySavedNotification(false);
      setIsKeyModalOpen(false);
    }, 1200);
  };

  return (
    <>
      {/* Floating Action Button (Bottom Right) */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-40 bg-gradient-to-r from-emerald-700 to-teal-800 hover:from-emerald-800 hover:to-teal-900 text-white rounded-2xl p-3.5 shadow-2xl flex items-center gap-3 transition-all transform hover:scale-105 cursor-pointer border-2 border-emerald-500/40 group"
          title="Open Kisan AI Voice Chatbot"
        >
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center text-xl shadow-inner border border-white/20">
              🌾
            </div>
            <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-amber-400 border-2 border-emerald-900 rounded-full animate-ping" />
            <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-amber-400 border-2 border-emerald-900 rounded-full" />
          </div>
          <div className="text-left pr-1 hidden sm:block">
            <div className="text-xs font-heading font-extrabold flex items-center gap-1.5">
              <span>Kisan AI Mitra</span>
              <span className="text-[10px] bg-amber-400 text-slate-950 font-extrabold px-1.5 py-0.2 rounded font-mono">
                GROQ
              </span>
            </div>
            <p className="text-[11px] text-emerald-100 font-medium flex items-center gap-1">
              <span>🎙️ Voice Conversation</span>
            </p>
          </div>
        </button>
      )}

      {/* Main Chatbot Drawer / Modal */}
      {isOpen && (
        <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 w-[94vw] sm:w-[450px] h-[660px] max-h-[92vh] bg-white rounded-2xl shadow-2xl border border-slate-300 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-6 duration-200">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white p-4 flex items-center justify-between shrink-0 border-b border-slate-700 shadow-sm">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-xl shadow-md border border-white/20">
                🌾
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-heading font-extrabold text-sm tracking-tight text-white">
                    Kisan AI Mitra
                  </h3>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold px-1.5 py-0.2 rounded font-mono">
                    Groq AI
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 font-medium">
                  Continuous Voice &bull; Multilingual Agronomist
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              {/* Hands-Free Continuous Conversation Toggle Button */}
              <button
                type="button"
                onClick={toggleContinuousMode}
                className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 border ${
                  isContinuousVoiceMode 
                    ? 'bg-rose-600 text-white border-rose-500 shadow-md animate-pulse ring-2 ring-rose-400' 
                    : 'bg-slate-800 hover:bg-slate-750 text-slate-300 border-slate-750 hover:text-white'
                }`}
                title={isContinuousVoiceMode ? "Hands-free continuous conversation is active (Click to disable)" : "Turn on hands-free continuous talk mode"}
              >
                <Radio className="w-3.5 h-3.5" />
                <span className="text-[11px]">{isContinuousVoiceMode ? 'Live Talking' : 'Walkie-Talkie'}</span>
              </button>

              {/* Settings / API Key button */}
              <button
                onClick={() => setIsKeyModalOpen(true)}
                title="Configure Groq API Key & Models"
                className={`p-2 rounded-xl transition cursor-pointer flex items-center gap-1 ${
                  groqKey ? 'bg-slate-800 hover:bg-slate-700 text-slate-300' : 'bg-amber-400 text-slate-950 font-bold text-xs px-2.5'
                }`}
              >
                <Key className="w-4 h-4" />
                {!groqKey && <span className="text-[10px]">Key</span>}
              </button>

              {/* Close Button */}
              <button
                onClick={() => {
                  window.speechSynthesis?.cancel();
                  setIsContinuousVoiceMode(false);
                  isContinuousVoiceModeRef.current = false;
                  stopListening();
                  setIsOpen(false);
                }}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Farm Context Ribbon */}
          <div className="bg-slate-100 border-b border-slate-200 px-3.5 py-2 text-[11px] text-slate-700 flex items-center justify-between shrink-0 font-medium">
            <div className="flex items-center gap-1.5 truncate">
              <span className="text-emerald-700">📍</span>
              <span className="font-bold text-slate-900 truncate">{farmContext.location || 'Sangrur, Punjab'}</span>
              <span>&bull;</span>
              <span>{farmContext.total_land_ha || 25} ha</span>
              <span>&bull;</span>
              <span className="text-sky-700 font-bold">{((farmContext.water_budget_m3 || 180000)/1000).toFixed(0)}k m³</span>
            </div>
            <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded shrink-0">
              Active Context
            </span>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-50/60">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'assistant' && (
                  <div className="w-7 h-7 rounded-lg bg-emerald-700 text-white flex items-center justify-center text-xs shrink-0 mt-0.5 shadow-2xs font-bold">
                    AI
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs shadow-xs leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-emerald-700 text-white rounded-tr-none'
                      : 'bg-white border border-slate-200 text-slate-850 rounded-tl-none font-medium'
                  }`}
                >
                  {/* Clean message presentation */}
                  <div className="whitespace-pre-wrap font-sans">
                    {msg.content}
                  </div>

                  {/* Message Footer: Timestamp and Audio TTS Play Button */}
                  <div className="flex items-center justify-between gap-3 mt-2 pt-1.5 border-t border-slate-200/60 text-[10px] text-slate-500">
                    <span>{msg.timestamp}</span>

                    {msg.role === 'assistant' && (
                      <button
                        onClick={() => speakText(msg.content, msg.id || '')}
                        className="flex items-center gap-1 font-bold text-emerald-700 hover:text-emerald-800 transition cursor-pointer"
                        title="Listen to clean human speech (ਸੁਣੋ)"
                      >
                        {speakingMessageId === msg.id ? (
                          <>
                            <Square className="w-3 h-3 fill-current text-rose-600" />
                            <span className="text-rose-600 font-bold">Stop Audio</span>
                          </>
                        ) : (
                          <>
                            <Volume2 className="w-3.5 h-3.5" />
                            <span>Listen (ਸੁਣੋ)</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>

                {msg.role === 'user' && (
                  <div className="w-7 h-7 rounded-lg bg-slate-200 text-slate-700 flex items-center justify-center text-xs shrink-0 mt-0.5 font-bold">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}

            {/* Loading typing indicator */}
            {isLoading && (
              <div className="flex items-center gap-2 text-slate-500 text-xs py-1">
                <div className="w-7 h-7 rounded-lg bg-emerald-700 text-white flex items-center justify-center text-xs shrink-0 shadow-2xs">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                </div>
                <span className="font-medium animate-pulse">Kisan AI is formulating agricultural advice...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Continuous Voice Loop Live Indicator */}
          {isContinuousVoiceMode && (
            <div className="bg-gradient-to-r from-rose-600 to-amber-600 text-white px-3.5 py-1.5 text-xs font-bold flex items-center justify-between shadow-xs">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-white animate-ping" />
                <span>
                  {speakingMessageId 
                    ? 'AI is speaking to you...' 
                    : isListening 
                    ? 'Your turn: Speak now (Listening...)' 
                    : 'Walkie-Talkie Mode Active'}
                </span>
              </div>
              <button
                onClick={toggleContinuousMode}
                className="text-[10px] bg-white/20 hover:bg-white/30 px-2 py-0.5 rounded cursor-pointer"
              >
                Turn Off
              </button>
            </div>
          )}

          {/* Suggested Quick Prompt Pills */}
          <div className="px-3 py-1.5 bg-slate-50 border-t border-slate-100 flex gap-1.5 overflow-x-auto no-scrollbar shrink-0">
            {QUICK_PROMPTS.map((qp, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(qp.prompt)}
                disabled={isLoading}
                className="whitespace-nowrap px-2.5 py-1 rounded-lg text-[11px] font-bold bg-white text-emerald-800 border border-emerald-200 hover:bg-emerald-50 active:bg-emerald-100 transition cursor-pointer shadow-2xs disabled:opacity-50"
              >
                {qp.label}
              </button>
            ))}
          </div>

          {/* Voice Input & Prompt Bar */}
          <div className="p-3 bg-white border-t border-slate-200 shrink-0">
            
            {/* Live Listening Waves Banner */}
            {isListening && !isContinuousVoiceMode && (
              <div className="mb-2 bg-rose-50 border border-rose-200 rounded-xl p-2 flex items-center justify-between text-xs text-rose-700 font-bold animate-pulse">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-ping" />
                  <span>Listening in {VOICE_LANGUAGES.find(v => v.code === voiceLang)?.label}... Speak now!</span>
                </div>
                <button
                  onClick={toggleListening}
                  className="text-[11px] underline cursor-pointer hover:text-rose-900"
                >
                  Done
                </button>
              </div>
            )}

            <div className="flex items-center gap-2">
              
              {/* Voice Language Selector Pill */}
              <div className="relative shrink-0">
                <select
                  value={voiceLang}
                  onChange={(e) => setVoiceLang(e.target.value)}
                  className="appearance-none bg-slate-100 hover:bg-slate-200 text-slate-800 text-[11px] font-bold py-2 pl-2 pr-6 rounded-xl border border-slate-200 cursor-pointer focus:outline-hidden"
                  title="Select voice recognition language"
                >
                  {VOICE_LANGUAGES.map((v) => (
                    <option key={v.code} value={v.code}>
                      {v.label.split(' ')[0]}
                    </option>
                  ))}
                </select>
                <Languages className="w-3 h-3 text-slate-500 absolute right-2 top-3 pointer-events-none" />
              </div>

              {/* Microphone Button */}
              <button
                type="button"
                onClick={toggleListening}
                className={`p-2.5 rounded-xl transition cursor-pointer shrink-0 shadow-xs ${
                  isListening 
                    ? 'bg-rose-600 text-white animate-bounce ring-2 ring-rose-400' 
                    : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                }`}
                title={isListening ? "Stop listening" : "Click to speak in your language"}
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>

              {/* Text Input */}
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder={isListening ? "Listening to your voice..." : "Ask in Hindi, Punjabi, or English..."}
                disabled={isLoading}
                className="flex-1 bg-slate-100 border border-slate-200 focus:bg-white focus:border-emerald-500 rounded-xl px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-hidden"
              />

              {/* Send Button */}
              <button
                type="button"
                onClick={() => handleSendMessage()}
                disabled={!inputMessage.trim() || isLoading}
                className="p-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 text-white transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-xs shrink-0"
                title="Send Message"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>

        </div>
      )}

      {/* Groq API Key Configuration Modal */}
      {isKeyModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-2xl p-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                  ⚡
                </div>
                <div>
                  <h4 className="font-heading font-extrabold text-sm text-slate-900">
                    Groq Cloud API Settings
                  </h4>
                  <p className="text-[11px] text-slate-500 font-medium">
                    Fastest LLaMA-3.3 inference for farmers
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsKeyModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveKey} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Your Groq API Key (gsk_...)
                </label>
                <input
                  type="password"
                  value={groqKey}
                  onChange={(e) => setGroqKey(e.target.value)}
                  placeholder="gsk_xxxxxxxxxxxxxxxxxxxxxx"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 focus:bg-white focus:border-emerald-500 focus:outline-hidden"
                />
                <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                  <span>Don't have a key?</span>
                  <a
                    href="https://console.groq.com/keys"
                    target="_blank"
                    rel="noreferrer"
                    className="text-emerald-700 hover:underline font-bold inline-flex items-center gap-0.5"
                  >
                    <span>Get free key at console.groq.com</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Neural Model ({availableModels.length} Active Candidates)
                </label>
                <select
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 font-semibold focus:outline-hidden"
                >
                  {availableModels.map((m) => (
                    <option key={m} value={m}>
                      {m} {m.includes('70b') ? '(Recommended • Multilingual Indian Agronomy)' : m.includes('8b') ? '(Ultra-Fast)' : ''}
                    </option>
                  ))}
                </select>
              </div>

              {keySavedNotification && (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-2.5 rounded-xl text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Settings saved successfully! Ready for voice conversations.</span>
                </div>
              )}

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsKeyModalOpen(false)}
                  className="px-3 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-extrabold cursor-pointer shadow-xs"
                >
                  Save Configuration
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
