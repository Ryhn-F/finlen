"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
} from "react";
import { PaperPlaneRight, Sparkle } from "@phosphor-icons/react";
import type { RoleplayMessageItem } from "@/lib/types/roleplay";
import { ChatMessage } from "./ChatMessage";

interface RoleplayChatProps {
  messages: RoleplayMessageItem[];
  npcRoleName?: string;
  isNpcResponding: boolean;
  isCompleted: boolean;
  isCompleting?: boolean;
  isMaxTurn?: boolean;
  maxTurns?: number;
  onSendMessage: (messageText: string) => void;
  onRetrySend?: (failedMessageText: string) => void;
}

const MAX_CHAR_LIMIT = 2000;

export function RoleplayChat({
  messages,
  npcRoleName = "Karakter Skenario",
  isNpcResponding,
  isCompleted,
  isCompleting = false,
  isMaxTurn = false,
  maxTurns = 10,
  onSendMessage,
  onRetrySend,
}: RoleplayChatProps) {
  const [inputText, setInputText] = useState("");
  const transcriptRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom on message list change or typing state
  const scrollToBottom = useCallback(() => {
    if (transcriptRef.current) {
      transcriptRef.current.scrollTo({
        top: transcriptRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isNpcResponding, scrollToBottom]);

  function handleSubmit(e?: FormEvent) {
    if (e) e.preventDefault();
    const cleanText = inputText.trim();
    if (!cleanText || isNpcResponding || isCompleted || isCompleting) return;

    onSendMessage(cleanText);
    setInputText("");

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  }

  function handleInputChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const val = e.target.value;
    if (val.length <= MAX_CHAR_LIMIT) {
      setInputText(val);
      // Auto expand textarea
      e.target.style.height = "auto";
      e.target.style.height = `${Math.min(e.target.scrollHeight, 180)}px`;
    }
  }

  return (
    <section className="roleplay-chat-area" aria-label="Ruang Keputusan Roleplay">
      {/* Scrollable Transcript */}
      <div className="chat-transcript-scroll" ref={transcriptRef}>
        <div className="chat-intro-callout">
          <span className="intro-badge">Ruang Pengambilan Keputusan</span>
          <p>
            Tanggapi setiap situasi dengan cermat. Amati apakah keputusanmu
            memperkuat posisi tawarmu atau justru meningkatkan risiko finansial.
          </p>
        </div>

        {messages.map((item) => (
          <ChatMessage
            key={item.id}
            messageItem={item}
            npcRoleName={npcRoleName}
            onRetrySend={onRetrySend}
          />
        ))}

        {/* AI Thinking Indicator */}
        {isNpcResponding && (
          <div className="npc-thinking-row" role="status" aria-live="polite">
            <div className="thinking-bubble">
              <span className="thinking-sparkle" aria-hidden="true">
                <Sparkle size={16} weight="fill" />
              </span>
              <span className="thinking-label">
                {npcRoleName} sedang merespons keputusanmu...
              </span>
              <span className="thinking-dots">
                <span className="dot" />
                <span className="dot" />
                <span className="dot" />
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Decision Input Box */}
      <footer className="chat-decision-dock">
        {isCompleted ? (
          <div className="session-completed-dock-banner">
            <p>
              <strong>Roleplay telah selesai.</strong> Kamu dapat meninjau seluruh
              rangkaian keputusan di atas atau melihat evaluasi akhir Naluri Finansial.
            </p>
          </div>
        ) : isCompleting ? (
          <div className="session-autocompleting-dock-banner">
            <div className="autocompleting-spinner" aria-hidden="true" />
            <p>
              <strong>Giliran maksimum tercapai ({maxTurns}/{maxTurns}).</strong> Menyelesaikan simulasi dan menghitung evaluasi akhir Naluri Finansial...
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="decision-form">
            <div className="decision-prompt-bar">
              <label htmlFor="user-decision-input" className="decision-prompt-label">
                {isMaxTurn ? (
                  <span className="max-turn-prompt-label">
                    Keputusan Terakhir (Giliran {maxTurns}/{maxTurns}):
                  </span>
                ) : (
                  "Apa yang akan kamu lakukan?"
                )}
              </label>
              <span className="decision-char-counter font-mono">
                {inputText.length} / {MAX_CHAR_LIMIT}
              </span>
            </div>

            <div className="decision-input-wrap">
              <textarea
                id="user-decision-input"
                ref={textareaRef}
                className="decision-textarea"
                rows={2}
                placeholder={
                  isMaxTurn
                    ? "Tulis keputusan akhirmu untuk menyelesaikan simulasi ini..."
                    : "Tulis keputusan, pertanyaan pembuktian, atau tawaran negosiasimu..."
                }
                value={inputText}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                disabled={isNpcResponding || isCompleting}
                aria-label="Tulis keputusan atau responsmu"
              />

              <button
                type="submit"
                className="button button-primary decision-submit-btn"
                disabled={isNpcResponding || isCompleting || !inputText.trim()}
                aria-label="Kirim keputusan"
                title="Tekan Enter untuk mengirim, Shift + Enter untuk baris baru"
              >
                <span>{isNpcResponding ? "Mengevaluasi..." : isMaxTurn ? "Kirim Akhir" : "Kirim"}</span>
                <span className="button-orb" aria-hidden="true">
                  <PaperPlaneRight size={16} weight="bold" />
                </span>
              </button>
            </div>

            <p className="input-shortcut-hint">
              Tekan <kbd>Enter</kbd> untuk mengirim, <kbd>Shift + Enter</kbd> untuk baris baru.
            </p>
          </form>
        )}
      </footer>
    </section>
  );
}
