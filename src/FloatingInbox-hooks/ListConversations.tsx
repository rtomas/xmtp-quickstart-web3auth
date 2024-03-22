import React, { useState, useCallback, useEffect } from "react";
import { useConversations, useStreamConversations, ContentTypeMetadata, CachedConversation, Conversation } from "@xmtp/react-sdk";
import { Client, useClient } from "@xmtp/react-sdk";

interface ListConversationsProps {
  client: Client;
  searchTerm: string;
  selectConversation: (conversation: CachedConversation<ContentTypeMetadata>) => void;
  onConversationFound: (found: boolean) => void;
  isPWA?: boolean;
}

export const ListConversations: React.FC<ListConversationsProps> = ({
  client,
  searchTerm,
  selectConversation,
  onConversationFound,
  isPWA = false,
}) => {
  const { conversations } = useConversations();
    const [streamedConversations, setStreamedConversations] = useState<CachedConversation<ContentTypeMetadata>[]>([]);

  const styles = {
    conversationListItem: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      borderBottom: "1px solid #e0e0e0",
      cursor: "pointer",
      backgroundColor: "#f0f0f0",
      transition: "background-color 0.3s ease",
      ":hover": {
        backgroundColor: "lightblue",
      },
      padding: isPWA == true ? "15px" : "10px",
    },
    conversationDetails: {
      display: "flex",
      alignItems: "flex-start",
      width: "75%",
      marginLeft: isPWA == true ? "15px" : "10px",
      overflow: "hidden",
    },
    conversationName: {
      fontSize: isPWA == true ? "20px" : "16px",
      fontWeight: "bold",
    },
    messagePreview: {
      fontSize: isPWA == true ? "18px" : "14px",
      color: "#666",
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis",
    },
    conversationTimestamp: {
      fontSize: isPWA == true ? "16px" : "12px",
      color: "#999",
      width: "25%",
      display: "flex",
      alignItems: "flex-end",
      justifyContent: "space-between",
    },
  };

  const filteredConversations = conversations.filter(
    (conversation) =>
      conversation?.peerAddress
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) &&
      conversation?.peerAddress !== client.address
  );

  useEffect(() => {
    if (filteredConversations.length > 0) {
      onConversationFound(true);
    }
  }, [filteredConversations, onConversationFound]);


   const onConversation = useCallback((conversation: Conversation<any>) => {
    setStreamedConversations([]); // TODO: Fix this
  }, []); 
  const { error } = useStreamConversations( {onConversation });

  const getRelativeTimeLabel = (dateString:any) => {
    const date = new Date(dateString);
    const now = new Date();

    const diff = now.getTime() - date.getTime();
    const diffSeconds = Math.floor(diff / 1000);
    const diffMinutes = Math.floor(diff / 1000 / 60);
    const diffHours = Math.floor(diff / 1000 / 60 / 60);
    const diffDays = Math.floor(diff / 1000 / 60 / 60 / 24);
    const diffWeeks = Math.floor(diff / 1000 / 60 / 60 / 24 / 7);

    if (diffSeconds < 60) {
      return "now";
    } else if (diffMinutes < 60) {
      return `${diffMinutes} minute${diffMinutes > 1 ? "s" : ""} ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
    } else if (diffDays < 7) {
      return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
    } else {
      return `${diffWeeks} week${diffWeeks > 1 ? "s" : ""} ago`;
    }
  };

  return (
    <>
      {filteredConversations.map((conversation, index) => (
        <li
          key={index}
          style={styles.conversationListItem}
          onClick={() => {
            selectConversation(conversation as CachedConversation<ContentTypeMetadata>);
          }}
        >
          <div style={styles.conversationDetails}>
            <span style={styles.conversationName}>
              {conversation.peerAddress.substring(0, 6) +
                "..." +
                conversation.peerAddress.substring(
                  conversation.peerAddress.length - 4
                )}
            </span>
            <span style={styles.messagePreview}>...</span>
          </div>
          <div style={styles.conversationTimestamp}>
            {getRelativeTimeLabel(conversation.createdAt)}
          </div>
        </li>
      ))}
    </>
  );
};
