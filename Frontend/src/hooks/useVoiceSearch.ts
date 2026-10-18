import { useCallback, useEffect, useRef, useState } from 'react';

// Minimal type declarations for the Web Speech API (not in standard lib.dom)
interface SpeechRecognitionEvent extends Event {
  results: {
    length: number;
    [index: number]: { length: number; [index: number]: { transcript: string; confidence: number }; isFinal: boolean };
  };
  resultIndex: number;
}
interface SpeechRecognitionLike extends EventTarget {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((e: SpeechRecognitionEvent) => void) | null;
  onerror: ((e: Event) => void) | null;
  onend: (() => void) | null;
  onstart: (() => void) | null;
}
interface SpeechRecognitionCtor {
  new (): SpeechRecognitionLike;
}

function getRecognitionCtor(): SpeechRecognitionCtor | null {
  if (typeof window === 'undefined') return null;
  const w = window as unknown as { SpeechRecognition?: SpeechRecognitionCtor; webkitSpeechRecognition?: SpeechRecognitionCtor };
  return w.SpeechRecognition || w.webkitSpeechRecognition || null;
}

export function useVoiceSearch() {
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interim, setInterim] = useState('');
  const [supported, setSupported] = useState(true);
  const recRef = useRef<SpeechRecognitionLike | null>(null);

  useEffect(() => {
    const ctor = getRecognitionCtor();
    if (!ctor) { setSupported(false); return; }
    const rec = new ctor();
    rec.lang = 'en-US';
    rec.continuous = false;
    rec.interimResults = true;
    rec.maxAlternatives = 1;

    rec.onresult = (e: SpeechRecognitionEvent) => {
      let finalText = '';
      let interimText = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const r = e.results[i];
        if (r.isFinal) finalText += r[0].transcript;
        else interimText += r[0].transcript;
      }
      if (finalText) setTranscript((prev) => (prev + ' ' + finalText).trim());
      setInterim(interimText);
    };
    rec.onerror = () => { setListening(false); };
    rec.onend = () => { setListening(false); setInterim(''); };
    recRef.current = rec;

    return () => { try { rec.abort(); } catch { /* noop */ } };
  }, []);

  const start = useCallback(() => {
    if (!recRef.current) return;
    setTranscript('');
    setInterim('');
    try { recRef.current.start(); setListening(true); } catch { /* already started */ }
  }, []);

  const stop = useCallback(() => {
    if (!recRef.current) return;
    try { recRef.current.stop(); } catch { /* noop */ }
    setListening(false);
  }, []);

  const reset = useCallback(() => {
    setTranscript('');
    setInterim('');
  }, []);

  return { listening, transcript, interim, supported, start, stop, reset };
}
