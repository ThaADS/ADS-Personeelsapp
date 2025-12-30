'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';

interface Message {
  id: string;
  type: 'user' | 'bot';
  content: string;
  links?: { text: string; href: string }[];
  timestamp: Date;
  showSupportButton?: boolean;
}

interface FAQItem {
  keywords: string[];
  question: string;
  answer: string;
  links?: { text: string; href: string }[];
  category: 'fleet' | 'timesheet' | 'vacation' | 'employee' | 'general' | 'settings';
}

const faqDatabase: FAQItem[] = [
  // Fleet Tracking FAQ
  {
    keywords: ['fleet', 'tracking', 'voertuig', 'auto', 'routevision', 'fleetgo', 'samsara', 'provider'],
    question: 'Hoe stel ik fleet tracking in?',
    answer: 'Fleet tracking wordt per bedrijf/tenant ingesteld. Ga naar Instellingen → Fleet Provider en kies uw provider (bijv. RouteVision, FleetGO, Samsara). Na configuratie worden voertuigen automatisch gesynchroniseerd.',
    links: [{ text: 'Naar Instellingen', href: '/settings' }],
    category: 'fleet'
  },
  {
    keywords: ['voertuig', 'koppel', 'medewerker', 'auto', 'toewijzen', 'assign'],
    question: 'Hoe koppel ik een voertuig aan een medewerker?',
    answer: 'Dit kan op drie manieren: 1) Via Instellingen → Fleet Provider → Voertuig-Medewerker Koppelingen, 2) Bij het aanmaken van een nieuwe medewerker (stap 4: Voertuigen), 3) In het medewerkerprofiel onder de Voertuigen tab.',
    links: [
      { text: 'Naar medewerkers', href: '/employees' },
      { text: 'Naar instellingen', href: '/settings' }
    ],
    category: 'fleet'
  },
  {
    keywords: ['rit', 'ritten', 'automatisch', 'registratie', 'trip'],
    question: 'Worden ritten automatisch geregistreerd?',
    answer: 'Ja! Zodra een voertuig aan een medewerker is gekoppeld, worden ritten automatisch geïmporteerd. De ritten verschijnen onder Dashboard → Ritten en kunnen worden goedgekeurd als werkuren.',
    links: [{ text: 'Bekijk ritten', href: '/trips' }],
    category: 'fleet'
  },
  {
    keywords: ['sync', 'synchronisatie', 'ophalen', 'update'],
    question: 'Hoe vaak worden voertuigen gesynchroniseerd?',
    answer: 'Standaard gebeurt dit dagelijks om 06:00 (indien automatische sync is ingeschakeld). U kunt ook handmatig synchroniseren via de "Nu Synchroniseren" knop in de Fleet Provider instellingen.',
    links: [{ text: 'Naar Fleet Provider', href: '/settings' }],
    category: 'fleet'
  },

  // Timesheet FAQ
  {
    keywords: ['uren', 'registreren', 'klok', 'inklokken', 'uitklokken', 'timesheet'],
    question: 'Hoe registreer ik mijn uren?',
    answer: 'U kunt uren registreren via de "Quick Clock In" widget op het dashboard, of ga naar Urenregistratie voor gedetailleerde invoer. Klik op "Start werkdag" om in te klokken en "Einde werkdag" om uit te klokken.',
    links: [
      { text: 'Naar dashboard', href: '/dashboard' },
      { text: 'Naar urenregistratie', href: '/timesheet' }
    ],
    category: 'timesheet'
  },
  {
    keywords: ['goedkeuren', 'approval', 'accorderen', 'manager'],
    question: 'Hoe worden uren goedgekeurd?',
    answer: 'Uren moeten door een manager of admin worden goedgekeurd. Managers kunnen dit doen via Goedkeuringen. Medewerkers zien hun status (Pending/Approved/Rejected) in hun urenregistratie overzicht.',
    links: [{ text: 'Naar goedkeuringen', href: '/approvals' }],
    category: 'timesheet'
  },
  {
    keywords: ['overuren', 'overtime', 'extra'],
    question: 'Hoe worden overuren berekend?',
    answer: 'Overuren worden automatisch berekend op basis van uw contracturen per week. Alle uren boven uw standaard werkweek worden als overuren geregistreerd en apart weergegeven in uw statistieken.',
    links: [{ text: 'Bekijk statistieken', href: '/dashboard' }],
    category: 'timesheet'
  },

  // Vacation FAQ
  {
    keywords: ['verlof', 'vakantie', 'aanvragen', 'vrij', 'leave'],
    question: 'Hoe vraag ik verlof aan?',
    answer: 'Ga naar Verlof en klik op "Verlof aanvragen". Selecteer de datums, het type verlof en voeg eventueel een opmerking toe. Uw aanvraag wordt naar uw manager gestuurd voor goedkeuring.',
    links: [{ text: 'Verlof aanvragen', href: '/vacation' }],
    category: 'vacation'
  },
  {
    keywords: ['saldo', 'dagen', 'over', 'resterend', 'balance'],
    question: 'Hoeveel verlofdagen heb ik nog?',
    answer: 'Uw verlofsaldo is zichtbaar op het dashboard onder "Vakantiesaldo" en ook op de Verlof pagina. U ziet daar uw totale dagen, opgenomen dagen en resterende dagen.',
    links: [
      { text: 'Naar dashboard', href: '/dashboard' },
      { text: 'Naar verlof', href: '/vacation' }
    ],
    category: 'vacation'
  },
  {
    keywords: ['ziek', 'ziekte', 'ziekmelding', 'sick'],
    question: 'Hoe meld ik me ziek?',
    answer: 'Ga naar Ziekmeldingen en klik op "Ziekmelden". Vul de verwachte einddatum in (indien bekend) en voeg eventueel opmerkingen toe. Uw manager wordt automatisch op de hoogte gesteld.',
    links: [{ text: 'Ziekmelding doen', href: '/sick-leave' }],
    category: 'vacation'
  },

  // Employee FAQ
  {
    keywords: ['medewerker', 'toevoegen', 'nieuw', 'aanmaken', 'onboarding'],
    question: 'Hoe voeg ik een nieuwe medewerker toe?',
    answer: 'Ga naar Werknemers en klik op "+ Nieuw". De onboarding wizard leidt u door 5 stappen: Account, Persoonlijke gegevens, Dienstverband, Voertuigen en Controle. Alleen admins en managers kunnen medewerkers toevoegen.',
    links: [{ text: 'Nieuwe medewerker', href: '/employees/new' }],
    category: 'employee'
  },
  {
    keywords: ['profiel', 'bewerken', 'gegevens', 'wijzigen', 'edit'],
    question: 'Hoe bewerk ik mijn profiel?',
    answer: 'Klik op uw naam in de sidebar of ga naar Mijn Profiel. Daar kunt u uw persoonlijke gegevens, contactinformatie en voorkeuren aanpassen.',
    links: [{ text: 'Naar profiel', href: '/profile' }],
    category: 'employee'
  },
  {
    keywords: ['wachtwoord', 'password', 'reset', 'vergeten'],
    question: 'Hoe wijzig ik mijn wachtwoord?',
    answer: 'Ga naar Mijn Profiel en scroll naar de beveiligingssectie. Daar kunt u uw wachtwoord wijzigen. Bij vergeten wachtwoord kunt u op het inlogscherm "Wachtwoord vergeten?" klikken.',
    links: [{ text: 'Naar profiel', href: '/profile' }],
    category: 'employee'
  },

  // Settings FAQ
  {
    keywords: ['instelling', 'settings', 'configuratie', 'theme', 'donker', 'dark'],
    question: 'Hoe wijzig ik de instellingen?',
    answer: 'Ga naar Instellingen voor persoonlijke voorkeuren (thema, taal, notificaties) en bedrijfsinstellingen (alleen voor admins). U kunt wisselen tussen licht en donker thema via het zonnetje/maan icoon.',
    links: [{ text: 'Naar instellingen', href: '/settings' }],
    category: 'settings'
  },
  {
    keywords: ['notificatie', 'melding', 'email', 'herinnering'],
    question: 'Hoe stel ik notificaties in?',
    answer: 'Ga naar Instellingen → Notificaties. U kunt e-mailmeldingen aan/uit zetten voor: goedkeuringsverzoeken, verlofaanvragen, ziekmeldingen en herinneringen voor urenregistratie.',
    links: [{ text: 'Naar instellingen', href: '/settings' }],
    category: 'settings'
  },

  // General FAQ
  {
    keywords: ['help', 'hulp', 'support', 'contact'],
    question: 'Waar kan ik hulp krijgen?',
    answer: 'Voor vragen kunt u: 1) Deze chatbot gebruiken, 2) De FAQ sectie op het dashboard bekijken, 3) Contact opnemen met uw bedrijfsbeheerder. Voor technische problemen: neem contact op met support.',
    category: 'general'
  },
  {
    keywords: ['export', 'rapport', 'download', 'pdf', 'excel'],
    question: 'Hoe exporteer ik gegevens?',
    answer: 'Op veel paginas (Urenregistratie, Verlof, etc.) vindt u een Export knop. U kunt exporteren naar PDF of Excel formaat. Managers kunnen teamrapporten genereren via de Rapporten sectie.',
    links: [{ text: 'Naar urenregistratie', href: '/timesheet' }],
    category: 'general'
  }
];

// Quick suggestion buttons
const quickSuggestions = [
  { text: 'Fleet tracking', query: 'fleet tracking instellen' },
  { text: 'Uren registreren', query: 'uren registreren' },
  { text: 'Verlof aanvragen', query: 'verlof aanvragen' },
  { text: 'Voertuig koppelen', query: 'voertuig koppelen' },
];

function generateId(): string {
  return Math.random().toString(36).substring(2, 11);
}

function findBestMatch(query: string): FAQItem | null {
  const queryLower = query.toLowerCase();
  const queryWords = queryLower.split(/\s+/);

  let bestMatch: FAQItem | null = null;
  let bestScore = 0;

  for (const faq of faqDatabase) {
    let score = 0;

    // Check keyword matches
    for (const keyword of faq.keywords) {
      if (queryLower.includes(keyword)) {
        score += 2;
      }
      // Partial match
      for (const word of queryWords) {
        if (keyword.includes(word) || word.includes(keyword)) {
          score += 1;
        }
      }
    }

    // Bonus for question match
    if (queryLower.includes(faq.question.toLowerCase().slice(0, 20))) {
      score += 3;
    }

    if (score > bestScore) {
      bestScore = score;
      bestMatch = faq;
    }
  }

  return bestScore >= 2 ? bestMatch : null;
}

export default function FAQChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: generateId(),
      type: 'bot',
      content: 'Hallo! Ik ben de FAQ assistent. Stel me een vraag over de applicatie, zoals fleet tracking, urenregistratie, verlof of medewerkersbeheer.',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isSendingSupport, setIsSendingSupport] = useState(false);
  const [noAnswerCount, setNoAnswerCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Function to send support email
  const handleSendToSupport = async () => {
    setIsSendingSupport(true);

    // Get the last user question (exclude bot messages)
    const userMessages = messages.filter(m => m.type === 'user');
    const lastUserQuestion = userMessages[userMessages.length - 1]?.content || 'Geen specifieke vraag';

    // Format chat history for API
    const chatHistory = messages.map(m => ({
      type: m.type,
      content: m.content,
      timestamp: m.timestamp.toISOString(),
    }));

    try {
      const response = await fetch('/api/support', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: lastUserQuestion,
          chatHistory,
        }),
      });

      const data = await response.json();

      // Add confirmation message
      const confirmMessage: Message = {
        id: generateId(),
        type: 'bot',
        content: data.success
          ? 'Uw vraag is verzonden naar ons support team op support@adspersoneelapp.nl. We nemen zo spoedig mogelijk contact met u op!'
          : `Er is iets misgegaan: ${data.error}`,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, confirmMessage]);
      setNoAnswerCount(0); // Reset counter after sending
    } catch {
      const errorMessage: Message = {
        id: generateId(),
        type: 'bot',
        content: 'Er is een fout opgetreden bij het verzenden. U kunt ook direct mailen naar support@adspersoneelapp.nl',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsSendingSupport(false);
    }
  };

  const handleSend = (query?: string) => {
    const messageText = query || input.trim();
    if (!messageText) return;

    // Add user message
    const userMessage: Message = {
      id: generateId(),
      type: 'user',
      content: messageText,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    // Simulate typing delay
    setTimeout(() => {
      const match = findBestMatch(messageText);

      let botResponse: Message;

      if (match) {
        setNoAnswerCount(0); // Reset counter on successful match
        botResponse = {
          id: generateId(),
          type: 'bot',
          content: match.answer,
          links: match.links,
          timestamp: new Date()
        };
      } else {
        const newNoAnswerCount = noAnswerCount + 1;
        setNoAnswerCount(newNoAnswerCount);

        // After 2 failed attempts, show support option more prominently
        const showSupportPrompt = newNoAnswerCount >= 2;

        botResponse = {
          id: generateId(),
          type: 'bot',
          content: showSupportPrompt
            ? 'Ik kon helaas geen antwoord vinden op uw vraag. Wilt u dat ik uw vraag samen met deze chatgeschiedenis doorstuur naar ons support team? Zij kunnen u verder helpen.'
            : 'Ik heb geen specifiek antwoord gevonden op uw vraag. Probeer het met andere zoekwoorden, of bekijk de veelgestelde vragen op het dashboard.',
          links: showSupportPrompt
            ? undefined
            : [
                { text: 'Naar dashboard', href: '/dashboard' },
                { text: 'Naar instellingen', href: '/settings' }
              ],
          timestamp: new Date(),
          showSupportButton: showSupportPrompt
        };
      }

      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
    }, 500 + Math.random() * 500);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Chat Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-20 md:bottom-6 right-4 md:right-6 z-50 w-14 h-14 rounded-full shadow-lg transition-all duration-300 flex items-center justify-center ${
          isOpen
            ? 'bg-gray-600 hover:bg-gray-700'
            : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700'
        }`}
        aria-label={isOpen ? 'Sluit chat' : 'Open FAQ chat'}
      >
        {isOpen ? (
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        )}

        {/* Notification badge */}
        {!isOpen && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center text-white text-xs font-bold animate-pulse">
            ?
          </span>
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-36 md:bottom-24 right-4 md:right-6 z-50 w-[calc(100vw-2rem)] md:w-96 max-h-[60vh] md:max-h-[500px] flex flex-col backdrop-blur-xl bg-white/95 dark:bg-slate-800/95 rounded-2xl shadow-2xl border border-white/20 dark:border-purple-500/20 overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-3 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-white">FAQ Assistent</h3>
              <p className="text-xs text-white/70">Altijd beschikbaar voor hulp</p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg hover:bg-white/20 transition-colors"
            >
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[200px]">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2.5 ${
                    message.type === 'user'
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-br-md'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-bl-md'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  {message.links && message.links.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {message.links.map((link, index) => (
                        <Link
                          key={index}
                          href={link.href}
                          onClick={() => setIsOpen(false)}
                          className="inline-flex items-center gap-1 text-xs font-medium text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/30 px-2.5 py-1 rounded-full hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors"
                        >
                          {link.text}
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </Link>
                      ))}
                    </div>
                  )}
                  {/* Support button when no answer found */}
                  {message.showSupportButton && (
                    <div className="mt-3 flex flex-col gap-2">
                      <button
                        type="button"
                        onClick={handleSendToSupport}
                        disabled={isSendingSupport}
                        className="inline-flex items-center justify-center gap-2 text-sm font-medium text-white bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 px-4 py-2 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isSendingSupport ? (
                          <>
                            <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            Verzenden...
                          </>
                        ) : (
                          <>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            Stuur naar Support
                          </>
                        )}
                      </button>
                      <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                        Uw vraag en chatgeschiedenis worden verzonden naar support@adspersoneelapp.nl
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-gray-100 dark:bg-gray-700 rounded-2xl rounded-bl-md px-4 py-3">
                  <div className="flex gap-1.5">
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestions */}
          {messages.length <= 2 && (
            <div className="px-4 pb-2">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Snelle vragen:</p>
              <div className="flex flex-wrap gap-2">
                {quickSuggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleSend(suggestion.query)}
                    className="text-xs px-3 py-1.5 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors"
                  >
                    {suggestion.text}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Stel een vraag..."
                className="flex-1 px-4 py-2.5 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
              />
              <button
                onClick={() => handleSend()}
                disabled={!input.trim() || isTyping}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:from-purple-700 hover:to-pink-700 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
