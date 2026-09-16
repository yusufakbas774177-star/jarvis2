// Web Speech API Voice synthesis and recognition for J.A.R.V.I.S.

let isSpeaking = false;
let speechCallback: ((speaking: boolean) => void) | null = null;

export function registerSpeechStatusListener(cb: (speaking: boolean) => void) {
  speechCallback = cb;
}

export function speakText(text: string, lang = 'tr-TR', onDone?: () => void) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    if (onDone) onDone();
    return;
  }

  try {
    window.speechSynthesis.cancel(); // Stop any pending speech

    const cleanText = text
      .replace(/[*_#`]/g, '')
      .replace(/\{.*?\}/g, '')
      .trim();

    if (!cleanText) {
      if (onDone) onDone();
      return;
    }

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = lang;
    utterance.rate = 1.05;
    utterance.pitch = 0.95; // Slightly lower, poised British tone

    // Try to pick a suitable voice
    const voices = window.speechSynthesis.getVoices();
    const matchedVoice = voices.find(
      (v) => v.lang.startsWith(lang.split('-')[0]) || (lang.startsWith('tr') && v.name.toLowerCase().includes('turkish'))
    );
    if (matchedVoice) {
      utterance.voice = matchedVoice;
    }

    utterance.onstart = () => {
      isSpeaking = true;
      if (speechCallback) speechCallback(true);
    };

    utterance.onend = () => {
      isSpeaking = false;
      if (speechCallback) speechCallback(false);
      if (onDone) onDone();
    };

    utterance.onerror = () => {
      isSpeaking = false;
      if (speechCallback) speechCallback(false);
      if (onDone) onDone();
    };

    window.speechSynthesis.speak(utterance);
  } catch (e) {
    console.error('Speech synthesis error:', e);
    isSpeaking = false;
    if (speechCallback) speechCallback(false);
    if (onDone) onDone();
  }
}

export function stopSpeaking() {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    isSpeaking = false;
    if (speechCallback) speechCallback(false);
  }
}

export function isCurrentlySpeaking() {
  return isSpeaking;
}

// Voice Recognition
export function createSpeechRecognizer(
  lang = 'tr-TR',
  onResult: (transcript: string) => void,
  onError?: (err: any) => void
) {
  if (typeof window === 'undefined') return null;

  const SpeechRecognition =
    (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

  if (!SpeechRecognition) {
    return null;
  }

  const recognition = new SpeechRecognition();
  recognition.lang = lang;
  recognition.continuous = false;
  recognition.interimResults = false;

  recognition.onresult = (event: any) => {
    const transcript = event.results[0][0].transcript;
    onResult(transcript);
  };

  recognition.onerror = (event: any) => {
    if (onError) onError(event);
  };

  return recognition;
}
