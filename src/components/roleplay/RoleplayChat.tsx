"use client";

import { useCallback, useEffect, useRef } from "react";
import { Sparkle } from "@phosphor-icons/react";
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
  answerChoices: string[];
  onSendMessage: (messageText: string) => void;
  onRetrySend?: (failedMessageText: string) => void;
}

export function RoleplayChat({
  messages,
  npcRoleName = "Karakter Skenario",
  isNpcResponding,
  isCompleted,
  isCompleting = false,
  isMaxTurn = false,
  maxTurns = 10,
  answerChoices,
  onSendMessage,
  onRetrySend,
}: RoleplayChatProps) {
  const transcriptRef = useRef<HTMLDivElement>(null);
  const isChoiceSelectionDisabled =
    isNpcResponding || isCompleted || isCompleting || isMaxTurn;

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

  function handleChoiceSelect(choice: string) {
    if (isChoiceSelectionDisabled) return;
    onSendMessage(choice);
  }

  return (
    <section className="roleplay-chat-area" aria-label="Ruang Keputusan Roleplay">
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
              <strong>Giliran maksimum tercapai ({maxTurns}/{maxTurns}).</strong>{" "}
              Menyelesaikan simulasi dan menghitung evaluasi akhir Naluri Finansial...
            </p>
          </div>
        ) : answerChoices.length > 0 ? (
          <div className="answer-choice-panel" aria-label="Pilihan jawaban">
            <p className="answer-choice-prompt">
              {isMaxTurn
                ? `Pilih keputusan terakhir (${maxTurns}/${maxTurns})`
                : "Pilih jawabanmu"}
            </p>
            <div className="answer-choice-list">
              {answerChoices.map((choice, index) => (
                <button
                  className="answer-choice-button"
                  disabled={isChoiceSelectionDisabled}
                  key={`${index}-${choice}`}
                  onClick={() => handleChoiceSelect(choice)}
                  type="button"
                >
                  <span className="answer-choice-index" aria-hidden="true">
                    {index + 1}
                  </span>
                  <span>{choice}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="answer-choice-loading" role="status" aria-live="polite">
            Menyiapkan pilihan jawaban...
          </div>
        )}
      </footer>
    </section>
  );
}
