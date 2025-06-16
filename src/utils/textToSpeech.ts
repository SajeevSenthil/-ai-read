
// Text-to-Speech utility functions

let currentUtterance: SpeechSynthesisUtterance | null = null;

export const speakText = (text: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (!('speechSynthesis' in window)) {
      reject(new Error('Speech synthesis not supported'));
      return;
    }

    // Stop any current speech
    stopSpeaking();

    // Clean the text for better speech
    const cleanText = text
      .replace(/\*\*(.*?)\*\*/g, '$1') // Remove markdown bold
      .replace(/\*(.*?)\*/g, '$1') // Remove markdown italic
      .replace(/#{1,6}\s/g, '') // Remove markdown headers
      .replace(/```[\s\S]*?```/g, 'code block') // Replace code blocks
      .replace(/`([^`]*)`/g, '$1') // Remove inline code backticks
      .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1') // Replace markdown links with text
      .replace(/📄|📝|•/g, '') // Remove emojis and bullets
      .trim();

    currentUtterance = new SpeechSynthesisUtterance(cleanText);
    
    // Configure voice settings
    currentUtterance.rate = 0.9;
    currentUtterance.pitch = 1;
    currentUtterance.volume = 1;
    
    // Try to use a natural-sounding voice
    const voices = speechSynthesis.getVoices();
    const preferredVoice = voices.find(voice => 
      voice.lang.startsWith('en') && 
      (voice.name.includes('Natural') || voice.name.includes('Enhanced') || voice.localService)
    ) || voices.find(voice => voice.lang.startsWith('en')) || voices[0];
    
    if (preferredVoice) {
      currentUtterance.voice = preferredVoice;
    }

    currentUtterance.onend = () => {
      currentUtterance = null;
      resolve();
    };

    currentUtterance.onerror = (event) => {
      currentUtterance = null;
      reject(new Error(`Speech synthesis error: ${event.error}`));
    };

    speechSynthesis.speak(currentUtterance);
  });
};

export const stopSpeaking = () => {
  if (speechSynthesis.speaking) {
    speechSynthesis.cancel();
  }
  currentUtterance = null;
};

export const isSpeaking = (): boolean => {
  return speechSynthesis.speaking;
};

// Initialize voices (needed for some browsers)
export const initializeVoices = (): Promise<SpeechSynthesisVoice[]> => {
  return new Promise((resolve) => {
    let voices = speechSynthesis.getVoices();
    
    if (voices.length > 0) {
      resolve(voices);
      return;
    }

    const voicesChanged = () => {
      voices = speechSynthesis.getVoices();
      if (voices.length > 0) {
        speechSynthesis.removeEventListener('voiceschanged', voicesChanged);
        resolve(voices);
      }
    };

    speechSynthesis.addEventListener('voiceschanged', voicesChanged);
  });
};
