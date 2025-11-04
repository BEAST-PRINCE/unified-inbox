// app/(protected)/inbox/page.tsx
"use client";

import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

// --- Types ---
// (We've added a new 'Message' type)

type Conversation = {
  id: string;
  phone: string;
  firstName: string | null;
  lastName: string | null;
  lastMessage: string;
  lastMessageAt: string;
};

type User = {
  name: string | null;
  email: string;
};

type Message = {
  id: string;
  content: string;
  direction: "INBOUND" | "OUTBOUND";
  createdAt: string;
  user: User | null; // The team member who sent it
};

// --- Styles (unchanged) ---
const styles = {
  // ... (all your existing styles, no changes)
  inboxContainer: {
    display: "flex",
    height: "calc(100vh - 4rem)",
  },
  conversationList: {
    width: "300px",
    borderRight: "1px solid #e5e7eb",
    backgroundColor: "white",
    padding: "1rem",
    overflowY: "auto" as "auto",
  },
  convoItem: {
    padding: "0.75rem 0.5rem",
    borderRadius: "4px",
    cursor: "pointer",
  },
  convoItemActive: {
    padding: "0.75rem 0.5rem",
    borderRadius: "4px",
    cursor: "pointer",
    backgroundColor: "#eef2ff", // Light indigo
  },
  convoName: {
    fontWeight: "600",
  },
  convoPreview: {
    fontSize: "0.875rem",
    color: "#6b7280",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  messageView: {
    flex: 1,
    padding: "1rem",
    backgroundColor: "white",
    marginLeft: "1rem",
    display: "flex",
    flexDirection: "column" as "column",
    height: "100%",
  },
  messageHistory: {
    flex: 1,
    overflowY: "auto" as "auto",
    marginBottom: "1rem",
  },
  // New styles for message bubbles
  msgBubble: {
    maxWidth: "70%",
    padding: "0.5rem 0.75rem",
    borderRadius: "8px",
    marginBottom: "0.5rem",
  },
  msgInbound: {
    backgroundColor: "#f3f4f6", // Gray
    alignSelf: "flex-start",
  },
  msgOutbound: {
    backgroundColor: "#dbeafe", // Blue
    alignSelf: "flex-end",
  },
  msgSender: {
    fontSize: "0.75rem",
    color: "#4b5563",
    fontWeight: "500",
  },
  composer: {
    borderTop: "1px solid #e5e7eb",
    paddingTop: "1rem",
  },
  textarea: {
    width: "100%",
    minHeight: "100px",
    padding: "0.5rem",
    marginBottom: "0.5rem",
  },
  sendButton: {
    padding: "0.5rem 1rem",
    backgroundColor: "#3b82f6",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
  },
  error: {
    color: "red",
    fontSize: "0.875rem",
  },
};

// --- Fetcher Functions ---

const fetchConversations = async (): Promise<Conversation[]> => {
  const response = await fetch("/api/contacts");
  if (!response.ok) {
    throw new Error("Failed to fetch conversations");
  }
  return response.json();
};

// NEW: Fetcher for message history
const fetchMessages = async (contactId: string): Promise<Message[]> => {
  const response = await fetch(`/api/messages/${contactId}`);
  if (!response.ok) {
    throw new Error("Failed to fetch messages");
  }
  return response.json();
};

export default function InboxPage() {
  const queryClient = useQueryClient();
  const [messageBody, setMessageBody] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeContact, setActiveContact] = useState<Conversation | null>(null);

  // Query 1: Fetch conversation list
  const {
    data: conversations,
    isLoading: isLoadingConversations,
    isError: isErrorConversations,
  } = useQuery<Conversation[]>({
    queryKey: ["conversations"],
    queryFn: fetchConversations,
  });

  // NEW: Query 2: Fetch messages for the active contact
  const {
    data: messages,
    isLoading: isLoadingMessages,
    isError: isErrorMessages,
  } = useQuery<Message[]>({
    // The queryKey is an array. When activeContact.id changes,
    // React Query will automatically refetch.
    queryKey: ["messages", activeContact?.id],
    queryFn: () => fetchMessages(activeContact!.id),
    // 'enabled' ensures this query only runs when activeContact is not null
    enabled: !!activeContact,
  });

  const handleSend = async () => {
    if (!messageBody.trim() || !activeContact) return;
    setIsLoading(true);
    setError(null);

    try {
      // (Handler logic is unchanged...)
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contactId: activeContact.id,
          messageBody: messageBody,
        }),
      });

      if (!response.ok) throw new Error("Failed to send message");

      setMessageBody("");

      // Invalidate both queries!
      // This will update the "last message" preview
      await queryClient.invalidateQueries({ queryKey: ["conversations"] });
      // This will refetch the message history to show the new message
      await queryClient.invalidateQueries({
        queryKey: ["messages", activeContact.id],
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h1>Inbox</h1>
      <div style={styles.inboxContainer}>
        {/*
          Column 1: Conversation List
        */}
        <aside style={styles.conversationList}>
          <h3>Conversations</h3>
          {isLoadingConversations ? (
            <p>Loading...</p>
          ) : isErrorConversations ? (
            <p style={styles.error}>Failed to load conversations</p>
          ) : (
            conversations?.map((convo) => (
              <div
                key={convo.id}
                style={
                  activeContact?.id === convo.id
                    ? styles.convoItemActive
                    : styles.convoItem
                }
                onClick={() => setActiveContact(convo)}
              >
                <p style={styles.convoName}>
                  {convo.firstName || convo.phone}
                </p>
                <p style={styles.convoPreview}>{convo.lastMessage}</p>
              </div>
            ))
          )}
        </aside>

        {/*
          Column 2: Message View & Composer
        */}
        <section style={styles.messageView}>
          {activeContact ? (
            <>
              <h3>Messages with {activeContact.firstName || activeContact.phone}</h3>

              <div style={styles.messageHistory}>
                {/* NEW: Real Message History */}
                {isLoadingMessages ? (
                  <p>Loading messages...</p>
                ) : isErrorMessages ? (
                  <p style={styles.error}>Failed to load messages</p>
                ) : (
                  messages?.map((msg) => (
                    <div
                      key={msg.id}
                      style={{
                        ...styles.msgBubble,
                        ...(msg.direction === "INBOUND"
                          ? styles.msgInbound
                          : styles.msgOutbound),
                      }}
                    >
                      {msg.direction === "OUTBOUND" && (
                        <p style={styles.msgSender}>
                          {msg.user?.name || "You"}
                        </p>
                      )}
                      {msg.content}
                    </div>
                  ))
                )}
              </div>

              {/* Composer (unchanged) */}
              <div style={styles.composer}>
                <textarea
                  style={styles.textarea}
                  placeholder="Write a reply..."
                  value={messageBody}
                  onChange={(e) => setMessageBody(e.target.value)}
                  disabled={isLoading}
                />
                <button
                  onClick={handleSend}
                  style={styles.sendButton}
                  disabled={isLoading}
                >
                  {isLoading ? "Sending..." : "Send"}
                </button>
                {error && <p style={styles.error}>{error}</p>}
              </div>
            </>
          ) : (
            <p>Select a conversation to start messaging</p>
          )}
        </section>
      </div>
    </div>
  );
}