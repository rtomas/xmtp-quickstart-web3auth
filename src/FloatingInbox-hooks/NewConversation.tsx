import React, { useCallback } from "react";
import { MessageInput } from "./MessageInput";
import { useStartConversation } from "@xmtp/react-sdk"; // import the required SDK hooks

const styles = {
  messagesContainer: {
    display: "flex",
    justifyContent: "flex-end",
    height: "100%",
  },
};

// Define an interface for the component props
interface NewConversationProps {
  selectConversation: (conversation: any) => void; // Use a more specific type if available
  peerAddress: string;
}

export const NewConversation: React.FC<NewConversationProps> = ({ selectConversation, peerAddress }) => {

  const { startConversation } = useStartConversation();

  const handleSendMessage = useCallback(
    async (message:string) => {
      if (!message.trim()) {
        alert("Empty message");
        return;
      }
      if (!peerAddress) {
        alert("No peer address provided");
        return;
      }
      const newConversation = await startConversation(peerAddress, message);
      selectConversation(newConversation?.cachedConversation);
    },
    [peerAddress, startConversation, selectConversation]
  );

  return (
    <div style={styles.messagesContainer}>
      <MessageInput onSendMessage={handleSendMessage} />
    </div>
  );
};
