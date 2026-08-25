/**
 * Voice Service: Speech-to-Text and Text-to-Speech integration
 */

class VoiceService {
  private recognition: any = null;
  private isListening = false;
  private synth = typeof window !== 'undefined' ? window.speechSynthesis : null;
  private voiceEnabled = true;

  constructor() {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = false;
        this.recognition.interimResults = false;
        this.recognition.lang = 'en-US';
      }
    }
  }

  public isSupported(): boolean {
    return !!this.recognition;
  }

  public startListening(onResult: (text: string) => void, onEnd: () => void, onError: (err: any) => void) {
    if (!this.recognition) {
      onError('Speech recognition not supported in this browser.');
      return;
    }

    if (this.isListening) {
      this.stopListening();
      return;
    }

    this.recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      onResult(transcript);
    };

    this.recognition.onerror = (event: any) => {
      this.isListening = false;
      onError(event.error);
    };

    this.recognition.onend = () => {
      this.isListening = false;
      onEnd();
    };

    try {
      this.recognition.start();
      this.isListening = true;
    } catch (e) {
      this.isListening = false;
      onError(e);
    }
  }

  public stopListening() {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
      this.isListening = false;
    }
  }

  public toggleVoiceOutput(enabled?: boolean): boolean {
    this.voiceEnabled = enabled !== undefined ? enabled : !this.voiceEnabled;
    return this.voiceEnabled;
  }

  public isVoiceOutputEnabled(): boolean {
    return this.voiceEnabled;
  }

  public speak(text: string) {
    if (!this.voiceEnabled || !this.synth) return;

    // Clean markdown and emojis for speech
    const cleanText = text
      .replace(/[*_#`~\[\]\(\)]/g, '')
      .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '')
      .slice(0, 200);

    this.synth.cancel(); // Stop ongoing speech
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.05;
    utterance.pitch = 1.0;
    
    // Pick natural English voice if available
    const voices = this.synth.getVoices();
    const naturalVoice = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha')));
    if (naturalVoice) utterance.voice = naturalVoice;

    this.synth.speak(utterance);
  }
}

export const voiceService = new VoiceService();
