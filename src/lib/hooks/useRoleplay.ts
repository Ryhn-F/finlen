"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  completeRoleplaySession,
  createRoleplaySession,
  getRoleplayHistory,
  getRoleplayHistoryDetail,
  getRoleplayMessages,
  getRoleplayProgression,
  getRoleplaySession,
  sendRoleplayMessage,
} from "../api/roleplay";
import type {
  CompleteSessionResponse,
  CreateSessionResponse,
  RoleplayHistoryDetail,
  RoleplayHistoryOptions,
  RoleplayHistoryResponse,
  RoleplayMessageItem,
  RoleplayProgressionResponse,
  RoleplaySessionDetail,
  SendMessageResponse,
} from "../types/roleplay";
import { useAuth } from "../context/AuthContext";

export const ROLEPLAY_QUERY_KEYS = {
  session: (sessionId: string) => ["roleplay", "session", sessionId] as const,
  messages: (sessionId: string) => ["roleplay", "messages", sessionId] as const,
  historyRoot: ["roleplay", "history"] as const,
  history: (options: Required<RoleplayHistoryOptions>) =>
    ["roleplay", "history", "list", options] as const,
  historyDetail: (sessionId: string) =>
    ["roleplay", "history", "detail", sessionId] as const,
  progression: (limit: number) =>
    ["roleplay", "history", "progression", limit] as const,
};

export function useRoleplayHistory(
  options: RoleplayHistoryOptions = {},
  enabled = true,
) {
  const normalizedOptions = {
    limit: options.limit ?? 20,
    offset: options.offset ?? 0,
  };

  return useQuery<RoleplayHistoryResponse>({
    queryKey: ROLEPLAY_QUERY_KEYS.history(normalizedOptions),
    queryFn: () => getRoleplayHistory(normalizedOptions),
    enabled,
    placeholderData: (previousData) => previousData,
  });
}

export function useRoleplayHistoryDetail(
  sessionId: string | null,
  enabled = true,
) {
  return useQuery<RoleplayHistoryDetail>({
    queryKey: ROLEPLAY_QUERY_KEYS.historyDetail(sessionId || ""),
    queryFn: () => {
      if (!sessionId) throw new Error("Session ID is required");
      return getRoleplayHistoryDetail(sessionId);
    },
    enabled: enabled && !!sessionId,
  });
}

export function useRoleplayProgression(limit = 100, enabled = true) {
  return useQuery<RoleplayProgressionResponse>({
    queryKey: ROLEPLAY_QUERY_KEYS.progression(limit),
    queryFn: () => getRoleplayProgression(limit),
    enabled,
  });
}

export function useRoleplaySession(sessionId: string | null) {
  return useQuery<RoleplaySessionDetail>({
    queryKey: ROLEPLAY_QUERY_KEYS.session(sessionId || ""),
    queryFn: () => {
      if (!sessionId) throw new Error("Session ID is required");
      return getRoleplaySession(sessionId);
    },
    enabled: !!sessionId,
  });
}

export function useRoleplayMessages(sessionId: string | null) {
  return useQuery<RoleplayMessageItem[]>({
    queryKey: ROLEPLAY_QUERY_KEYS.messages(sessionId || ""),
    queryFn: () => {
      if (!sessionId) throw new Error("Session ID is required");
      return getRoleplayMessages(sessionId);
    },
    enabled: !!sessionId,
  });
}

export function useCreateRoleplaySession() {
  const queryClient = useQueryClient();

  return useMutation<CreateSessionResponse, Error, string>({
    mutationFn: (scenarioId: string) => createRoleplaySession(scenarioId),
    onSuccess: (data) => {
      // Seed the initial messages cache with the first NPC message
      const initialMessages: RoleplayMessageItem[] = [
        {
          id: `npc-opening-${data.session_id}`,
          sender: "npc",
          message: data.first_npc_message,
          turn_number: 1,
          created_at: data.created_at,
          evaluation: null,
        },
      ];
      queryClient.setQueryData(
        ROLEPLAY_QUERY_KEYS.messages(data.session_id),
        initialMessages,
      );

      // Seed initial session detail
      const initialSessionDetail: RoleplaySessionDetail = {
        session_id: data.session_id,
        scenario: data.scenario,
        scenario_title: data.scenario_title,
        status: data.status,
        turn_number: data.turn_number,
        scores: {
          critical_thinking: 50,
          risk_awareness: 50,
          impulse_control: 50,
          decision_making: 50,
          financial_instinct: 50,
        },
        current_state: data.initial_state,
        xp_earned: 0,
        created_at: data.created_at,
        completed_at: null,
        max_turns: data.max_turns || 10,
      };
      queryClient.setQueryData(
        ROLEPLAY_QUERY_KEYS.session(data.session_id),
        initialSessionDetail,
      );
    },
  });
}

export function useSendRoleplayMessage(sessionId: string) {
  const queryClient = useQueryClient();

  return useMutation<
    SendMessageResponse,
    Error,
    string,
    {
      tempId: string;
      previousMessages?: RoleplayMessageItem[];
      previousSession?: RoleplaySessionDetail;
    }
  >({
    mutationFn: (message: string) => sendRoleplayMessage(sessionId, message),
    onMutate: async (userMessageText) => {
      // Cancel any outgoing refetches so they don't overwrite optimistic update
      await queryClient.cancelQueries({
        queryKey: ROLEPLAY_QUERY_KEYS.messages(sessionId),
      });
      await queryClient.cancelQueries({
        queryKey: ROLEPLAY_QUERY_KEYS.session(sessionId),
      });

      const previousMessages = queryClient.getQueryData<RoleplayMessageItem[]>(
        ROLEPLAY_QUERY_KEYS.messages(sessionId),
      );
      const previousSession = queryClient.getQueryData<RoleplaySessionDetail>(
        ROLEPLAY_QUERY_KEYS.session(sessionId),
      );

      const currentTurn = previousSession?.turn_number || 1;
      const maxTurns = previousSession?.max_turns || 10;
      const nextTurnNumber = Math.min(maxTurns, currentTurn + 1);

      const tempId = `temp-user-${Date.now()}`;
      const optimisticUserMessage: RoleplayMessageItem = {
        id: tempId,
        sender: "user",
        message: userMessageText,
        turn_number: currentTurn,
        created_at: new Date().toISOString(),
        isPending: true,
      };

      queryClient.setQueryData<RoleplayMessageItem[]>(
        ROLEPLAY_QUERY_KEYS.messages(sessionId),
        (old = []) => [...old, optimisticUserMessage],
      );

      // Optimistically advance turn_number in realtime
      queryClient.setQueryData<RoleplaySessionDetail>(
        ROLEPLAY_QUERY_KEYS.session(sessionId),
        (old) => {
          if (!old) return old;
          return {
            ...old,
            turn_number: nextTurnNumber,
          };
        },
      );

      return { tempId, previousMessages, previousSession };
    },
    onSuccess: (data, _, context) => {
      // Replace optimistic message with evaluated message, then append NPC reply
      queryClient.setQueryData<RoleplayMessageItem[]>(
        ROLEPLAY_QUERY_KEYS.messages(sessionId),
        (old = []) => {
          const filtered = old.filter((m) => m.id !== context?.tempId);
          const evaluatedUserMessage: RoleplayMessageItem = {
            id: `user-evaluated-${data.turn_number}-${Date.now()}`,
            sender: "user",
            message: data.user_message,
            turn_number: data.turn_number,
            created_at: new Date().toISOString(),
            evaluation: data.evaluation,
          };
          const npcReplyMessage: RoleplayMessageItem = {
            id: `npc-reply-${data.turn_number}-${Date.now()}`,
            sender: "npc",
            message: data.npc_response,
            turn_number: data.turn_number,
            created_at: new Date().toISOString(),
            evaluation: null,
          };
          return [...filtered, evaluatedUserMessage, npcReplyMessage];
        },
      );

      // Update session detail cache directly with new scores and state
      queryClient.setQueryData<RoleplaySessionDetail>(
        ROLEPLAY_QUERY_KEYS.session(sessionId),
        (old) => {
          if (!old) return old;
          return {
            ...old,
            turn_number: data.turn_number,
            current_state: data.current_state,
            scores: data.session_scores,
            xp_earned: old.xp_earned + data.xp_earned_this_turn,
            max_turns: data.max_turns || old.max_turns || 10,
          };
        },
      );
    },
    onError: (_err, _variables, context) => {
      // Mark optimistic message as failed
      if (context?.tempId) {
        queryClient.setQueryData<RoleplayMessageItem[]>(
          ROLEPLAY_QUERY_KEYS.messages(sessionId),
          (old = []) =>
            old.map((m) => (m.id === context.tempId ? { ...m, isPending: false, isFailed: true } : m)),
        );
      }
      // Revert optimistic session update
      if (context?.previousSession) {
        queryClient.setQueryData<RoleplaySessionDetail>(
          ROLEPLAY_QUERY_KEYS.session(sessionId),
          context.previousSession,
        );
      }
    },
    onSettled: () => {
      // Background invalidate to keep perfectly in sync
      queryClient.invalidateQueries({
        queryKey: ROLEPLAY_QUERY_KEYS.messages(sessionId),
      });
      queryClient.invalidateQueries({
        queryKey: ROLEPLAY_QUERY_KEYS.session(sessionId),
      });
    },
  });
}

export function useCompleteRoleplaySession(sessionId: string) {
  const queryClient = useQueryClient();
  const { refreshUser } = useAuth();

  return useMutation<CompleteSessionResponse, Error, void>({
    mutationFn: () => completeRoleplaySession(sessionId),
    onSuccess: (data) => {
      // Update session query cache
      queryClient.setQueryData<RoleplaySessionDetail>(
        ROLEPLAY_QUERY_KEYS.session(sessionId),
        (old) => {
          if (!old) return old;
          return {
            ...old,
            status: "completed",
            scores: data.scores,
            xp_earned: data.xp_earned,
            completed_at: data.completed_at,
          };
        },
      );
      // Invalidate the live session and all durable history/progression views.
      queryClient.invalidateQueries({
        queryKey: ROLEPLAY_QUERY_KEYS.session(sessionId),
      });
      queryClient.invalidateQueries({
        queryKey: ROLEPLAY_QUERY_KEYS.historyRoot,
      });
      // Refresh user profile so level, XP, and financial_instinct reflect new stats
      refreshUser();
    },
  });
}
