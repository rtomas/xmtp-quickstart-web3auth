import React from "react";
import Home from "./Home";
import { XMTPProvider } from "@xmtp/react-sdk";
import { ApiClient, ClientOptions, NetworkOptions, XmtpEnv } from "@xmtp/xmtp-js";
import {  JsonRpcSigner } from "ethers";

export const getEnv = () : XmtpEnv => {
  return typeof process !== undefined && process.env.REACT_APP_XMTP_ENV
    ? process.env.REACT_APP_XMTP_ENV as XmtpEnv
    : "production" as XmtpEnv;
};
interface FloatingInboxProps {
  isPWA?: boolean;
  wallet: JsonRpcSigner;
  onLogout: () => void;
}
export const FloatingInbox: React.FC<FloatingInboxProps> = ({ wallet, isPWA = false, onLogout }) => {
  //
  return (
    <XMTPProvider>
      <Home isPWA={isPWA} env={getEnv()} wallet={wallet} onLogout={onLogout} />
    </XMTPProvider>
  );
}
