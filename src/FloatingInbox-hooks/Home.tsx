import React, { useState, useEffect } from "react";
import { ethers, JsonRpcSigner } from "ethers";
import { Client, useClient } from "@xmtp/react-sdk";
import { ConversationContainer } from "./ConversationContainer";
import { ApiClient, ClientOptions, NetworkOptions, XmtpEnv } from "@xmtp/xmtp-js";

interface HomeProps {
  address: string;
  wallet?: JsonRpcSigner | null; // Define a more specific type if possible, e.g., ethers.Wallet
  env: XmtpEnv;
  isPWA?: boolean;
  onLogout?: () => void;
}


const Home: React.FC<HomeProps> = ({ address, wallet, env, isPWA = false, onLogout }) => {
  const initialIsOpen =
    isPWA || localStorage.getItem("isWidgetOpen") === "true" || false;

  const initialIsOnNetwork =
    localStorage.getItem("isOnNetwork") === "true" || false;
  const initialIsConnected =
    (localStorage.getItem("isConnected") && wallet != null) || false;

  const { client, initialize } = useClient();
  const [loading, setLoading] = useState(false);

  const [isOpen, setIsOpen] = useState(initialIsOpen);
  const [isOnNetwork, setIsOnNetwork] = useState(initialIsOnNetwork);
  const [isConnected, setIsConnected] = useState(initialIsConnected);

  const [selectedConversation, setSelectedConversation] = useState(null);
  const [signer, setSigner] = useState<JsonRpcSigner | null>(null);

  const styles = {
    floatingLogo: {

      bottom: "20px",
      right: "20px",
      width: "30px",
      height: "30px",
      borderRadius: "50%",
      backgroundColor: "white",
      display: "flex",
      alignItems: "center",
      border: "1px solid #ccc",
      justifyContent: "center",
      boxShadow: "0 2px 10px #ccc",
      cursor: "pointer",
      transition: "transform 0.3s ease",
      padding: "5px",
    },
    uContainer: {
      bottom: isPWA  ? "0px" : "70px",
      right: isPWA ? "0px" : "20px",
      width: isPWA  ? "100%" : "300px",
      height: isPWA ? "100vh" : "400px",
      border: isPWA  ? "0px" : "1px solid #ccc",
      backgroundColor: "#f9f9f9",
      borderRadius: isPWA ? "0px" : "10px",
      boxShadow: "0 0 10px rgba(0, 0, 0, 0.1)",
      zIndex: "1000",
      overflow: "hidden",
      
    },
    logoutBtn: {
      top: "10px",
      textDecoration: "none",
      color: "#000",
      left: "5px",
      background: "transparent",
      border: "none",
      fontSize: isPWA ? "12px" : "10px",
      cursor: "pointer",
    },
    widgetHeader: {
      padding: "5px",
    },
    conversationHeader: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      background: "none",
      border: "none",
      width: "auto",
      margin: "0px",
    },
    conversationHeaderH4: {
      margin: "0px",
      padding: "4px",
      fontSize: isPWA ? "20px" : "14px", // Increased font size
    },
    backButton: {
      border: "0px",
      background: "transparent",
      cursor: "pointer",
      fontSize: isPWA ? "20px" : "14px", // Increased font size
    },
    widgetContent: {
      flexGrow: 1,
    },
    xmtpContainer: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      height: "100%",
    },
    btnXmtp: {
      backgroundColor: "#f0f0f0",
      display: "flex",
      alignItems: "center",
      textDecoration: "none",
      color: "#000",
      justifyContent: "center",
      border: "1px solid grey",
      padding: isPWA ? "20px" : "10px",
      borderRadius: "5px",
      fontSize: isPWA ? "20px" : "14px",
    },
  };

  useEffect(() => {
    localStorage.setItem("isOnNetwork", isOnNetwork.toString());
    localStorage.setItem("isWidgetOpen", isOpen.toString());
    localStorage.setItem("isConnected", isConnected.toString());
  }, [isOpen, isConnected, isOnNetwork]);

  useEffect(() => {
    if (wallet) {
      setSigner(wallet);
      setIsConnected(true);
    }
    if (client && !isOnNetwork) {
      setIsOnNetwork(true);
    }
    if (signer && isOnNetwork) {
      initXmtpWithKeys();
    }
  }, [wallet, signer, client]);



  const getAddress = async (signer:JsonRpcSigner) : Promise<string | undefined> => {
    try {
      if (signer && typeof signer.getAddress === "function") {
        return await signer.getAddress();
      }
      return undefined;
    } catch (e) {
      console.log(e);
    }
  };

  const initXmtpWithKeys = async () => {
 
    const address = await getAddress(signer!);
    if (!address) return;
    let keys: Uint8Array | null = loadKeys(signer!);
    if (!keys) {
      keys = await Client.getKeys(signer!);
      storeKeys(signer!, keys);
    }
    setLoading(true);
    await initialize({ keys, signer });
  };

  const openWidget = () => {
    setIsOpen(true);
  };

  const closeWidget = () => {
    setIsOpen(false);
  };
  window.FloatingInbox = {
    open: openWidget,
    close: closeWidget,
  };
  const handleLogout = async () => {
    setIsConnected(false);
    const address = await getAddress(signer!);
    wipeKeys(signer!);
    setSigner(null);
    setIsOnNetwork(false);
    setSelectedConversation(null);
    localStorage.removeItem("isOnNetwork");
    localStorage.removeItem("isConnected");
    if (typeof onLogout === "function") {
      onLogout();
    }
  };

  return (
    <>
      {!isPWA && (
        <div
          style={styles.floatingLogo}
          onClick={isOpen ? closeWidget : openWidget}
          className={
            "FloatingInbox " +
            (isOpen ? "spin-clockwise" : "spin-counter-clockwise")
          }
        >
          aa
        </div>
      )}
      {isOpen && (
        <div
          style={styles.uContainer}
          className={"FloatingInbox" + (isOnNetwork ? "expanded" : "")}
        >
          <div style={{ marginBottom: '40px',width:'100%' }}>my address: {address} {isConnected && (
            <button style={styles.logoutBtn} onClick={handleLogout}>
              <b>Logout</b>
            </button>
          )}</div>
          
          {isConnected && isOnNetwork && (
            <div style={styles.widgetHeader}>
              <div style={styles.conversationHeader}>
                {isOnNetwork && selectedConversation && (
                  <button
                    style={styles.backButton}
                    onClick={() => {
                      setSelectedConversation(null);
                    }}
                  >
                    ←
                  </button>
                )}
                <h4 style={styles.conversationHeaderH4}>Conversations</h4>
              </div>
            </div>
          )}
          {isConnected}
          <div style={styles.widgetContent}>
            {isConnected && !isOnNetwork && (
              <div style={styles.xmtpContainer}>
                <button style={styles.btnXmtp} onClick={initXmtpWithKeys}>
                  Connect to XMTP
                </button>
              </div>
            )}
            {isConnected && isOnNetwork && client && (
              <ConversationContainer
                isPWA={isPWA}
                client={client}
                selectedConversation={selectedConversation}
                setSelectedConversation={setSelectedConversation}
              />
            )}
          </div>
        </div>
      )}
    </>
  );
}

const ENCODING = "binary";

export const getEnv = (): XmtpEnv => {
  // "dev" | "production" | "local"
  return typeof process !== undefined && process.env.REACT_APP_XMTP_ENV as XmtpEnv
    ? process.env.REACT_APP_XMTP_ENV as XmtpEnv
    : "production";
};
export const buildLocalStorageKey = (walletAddress:JsonRpcSigner) => {
  return walletAddress ? `xmtp:${getEnv()}:keys:${walletAddress}` : "";
};

export const loadKeys = (walletAddress: JsonRpcSigner): Uint8Array | null => {
  const val = localStorage.getItem(buildLocalStorageKey(walletAddress));
  return val ? Buffer.from(val, ENCODING) : null;
};

export const storeKeys = (walletAddress :JsonRpcSigner, keys :Uint8Array) => {
  localStorage.setItem(
    buildLocalStorageKey(walletAddress),
    Buffer.from(keys).toString(ENCODING)
  );
};

export const wipeKeys = (walletAddress: JsonRpcSigner) => {
  localStorage.removeItem(buildLocalStorageKey(walletAddress));
};

export default Home