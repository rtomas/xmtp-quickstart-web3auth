import React, { useState, useCallback, useRef, useEffect } from "react";
import { MessageInput } from "./MessageInput";
import {
  useMessages,
  useSendMessage,
  useStreamMessages,
} from "@xmtp/react-sdk";
import MessageItem from "./MessageItem";
import { Client,  } from "@xmtp/xmtp-js";
import { CachedConversation, DecodedMessage } from "@xmtp/react-sdk";


interface MessageContainerProps {
  conversation: CachedConversation;
  client: Client;
  isPWA?: boolean;
}

export const MessageContainer: React.FC<MessageContainerProps> = ({
  conversation,
  client,
  isPWA = false,
}) => {
  const messagesEndRef = useRef(null);
  const { messages, isLoading } = useMessages(conversation);
  const [streamedMessages, setStreamedMessages] = useState<DecodedMessage | undefined>();

  const styles = {
    messagesContainer: {
      display: "flex",
      justifyContent: "space-between",
      height: "100%",
      fontSize: isPWA == true ? "1.2em" : ".9em", // Increased font size
    },
    messagesList: {
      paddingLeft: "5px",
      paddingRight: "5px",
      margin: "0px",
      alignItems: "flex-start",
      flexGrow: 1,
      display: "flex",
    },
  };
   const onMessage =  useCallback(
    (message: DecodedMessage | undefined) => {
      setStreamedMessages(message);
    },
    [streamedMessages]
  );
   /* useCallback(
    (message: DecodedMessage | undefined) => {
      setStreamedMessages((prev) => [...prev, message]);
    },
    [streamedMessages]
  );  */

  useStreamMessages(conversation, { onMessage });
  const { sendMessage } = useSendMessage();

  useEffect(() => {
    //setStreamedMessages();
  }, [conversation]);

  const handleSendMessage = async (newMessage:any) => {
    if (!newMessage.trim()) {
      alert("empty message");
      return;
    }
    if (conversation && conversation.peerAddress) {
      await sendMessage(conversation, newMessage);
    }
  };

  useEffect(() => {
    //messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div style={styles.messagesContainer}>
      {isLoading ? (
        <small className="loading">Loading messages...</small>
      ) : (
        <>
          <ul style={styles.messagesList}>
            {messages.slice().map((message:any) => {
              return (
                <MessageItem
                  isPWA={isPWA}
                  key={message.id}
                  message={message}
                  senderAddress={message.senderAddress}
                  client={client}
                />
              );
            })}
            <div ref={messagesEndRef} />
          </ul>
          <MessageInput
            isPWA={isPWA}
            onSendMessage={(msg:any) => {
              handleSendMessage(msg);
            }}
          />
        </>
      )}
    </div>
  );
};
