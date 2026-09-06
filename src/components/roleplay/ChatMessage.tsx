"use client";

import { ArrowClockwise, ChatsTeardrop, ShieldCheck, User, WarningCircle } from "@phosphor-icons/react";
import type { RoleplayMessageItem } from "@/lib/types/roleplay";
import { DecisionEvaluation } from "./DecisionEvaluation";

interface ChatMessageProps {
  messageItem: RoleplayMessageItem;
  npcRoleName?: string;
  onRetrySend?: (failedMessageText: string) => void;
}

export function ChatMessage({
  messageItem,
  npcRoleName = "Karakter Skenario",
  onRetrySend,
}: ChatMessageProps) {
  const isNpc = messageItem.sender === "npc";
  const isUser = messageItem.sender === "user";

  if (isNpc) {
    return (
      <div className="chat-bubble-row is-npc">
        <article className="chat-bubble npc-bubble">
          <header className="npc-bubble-head">
            <span className="npc-icon-orb" aria-hidden="true">
              <ChatsTeardrop size={16} weight="duotone" />
            </span>
            <div className="npc-identity-text">
              <strong className="npc-role-title">{npcRoleName}</strong>
              <span className="npc-sender-tag">Pihak Luar</span>
            </div>
          </header>

          <div className="npc-dialogue-body">
            <blockquote className="npc-speech-quote">
              &ldquo;{messageItem.message}&rdquo;
            </blockquote>
          </div>
        </article>
      </div>
    );
  }

  if (isUser) {
    return (
      <div className="chat-bubble-row is-user">
        <article className={`chat-bubble user-bubble ${messageItem.isFailed ? "is-failed" : ""}`}>
          <header className="user-bubble-head">
            <div className="user-identity-text">
              <strong className="user-decision-tag">KEPUTUSANMU</strong>
              <span className="user-turn-marker font-mono">Giliran {messageItem.turn_number}</span>
            </div>
            <span className="user-icon-orb" aria-hidden="true">
              <User size={16} weight="bold" />
            </span>
          </header>

          <div className="user-dialogue-body">
            <p className="user-decision-text">{messageItem.message}</p>
          </div>

          {messageItem.isPending && (
            <div className="msg-pending-state" role="status">
              <span className="pending-dot pulse" />
              <span>Mengevaluasi keputusan...</span>
            </div>
          )}

          {messageItem.isFailed && (
            <div className="msg-failed-state" role="alert">
              <div className="failed-info">
                <WarningCircle size={16} weight="bold" />
                <span>Pesan belum terkirim.</span>
              </div>
              {onRetrySend && (
                <button
                  type="button"
                  className="failed-retry-btn"
                  onClick={() => onRetrySend(messageItem.message)}
                >
                  <ArrowClockwise size={14} weight="bold" />
                  Coba lagi
                </button>
              )}
            </div>
          )}
        </article>

        {/* Per-Turn Evaluation strictly attached directly below user decision */}
        {messageItem.evaluation && (
          <div className="evaluation-attach-wrap">
            <DecisionEvaluation evaluation={messageItem.evaluation} />
          </div>
        )}
      </div>
    );
  }

  // Fallback for system message
  return (
    <div className="chat-bubble-row is-system">
      <div className="system-bubble">
        <ShieldCheck size={16} weight="duotone" />
        <span>{messageItem.message}</span>
      </div>
    </div>
  );
}
