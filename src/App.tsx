import { useEffect, useState } from "react";
import { CHAIN_NAMESPACES, IProvider, WEB3AUTH_NETWORK } from "@web3auth/base";
import { Web3Auth, Web3AuthOptions } from "@web3auth/modal";
import { OpenloginAdapter } from "@web3auth/openlogin-adapter";
import { FloatingInbox } from "./FloatingInbox-hooks";
import React from 'react';
import { JsonRpcSigner } from "ethers";

import { web3AuthOptions, openLoginAdapterOptions } from "./config/web3auth";

// Adapters
import { getDefaultExternalAdapters } from "@web3auth/default-evm-adapter";

import RPC from "./ethersRPC";

import './App.css';

function App() {
  const [web3auth, setWeb3auth] = useState<Web3Auth | null>(null);
  const [loggedIn, setLoggedIn] = useState(false);
  const [signer, setSigner] = useState<JsonRpcSigner | null>(null);
  const [address, setAddress] = useState<string>("");

  useEffect(() => {
    const init = async () => {
      try {
        const web3auth = new Web3Auth(web3AuthOptions);

        const openloginAdapter = new OpenloginAdapter(openLoginAdapterOptions);
        web3auth.configureAdapter(openloginAdapter);

        // read more about adapters here: https://web3auth.io/docs/sdk/pnp/web/adapters/
        // Only when you want to add External default adapters, which includes WalletConnect, Metamask, Torus EVM Wallet
        const adapters = await getDefaultExternalAdapters({ options: web3AuthOptions });
        adapters.forEach((adapter) => {
          web3auth.configureAdapter(adapter);
        });

        setWeb3auth(web3auth);

        await web3auth.initModal();

        if (web3auth.connected) {
          setLoggedIn(true);
          const rpc = new RPC(web3auth.provider as IProvider);
          const sign = await rpc.getSigner()
          setSigner(sign);
          setAddress(await sign.getAddress());
          console.log(sign);
        }
      } catch (error) {
        console.error(error);
      }
    };

    init();
  }, []);

  const getAccounts = async () => {
    if (!web3auth?.provider) {
      console.log("provider not initialized yet");
      return;
    }
    const rpc = new RPC(web3auth.provider as IProvider);
    const address = await rpc.getAccounts();
    console.log(address);
  };

  const signMessage = async () => {
    if (!web3auth?.provider) {
      console.log("provider not initialized yet");
      return;
    }
    const rpc = new RPC(web3auth.provider as IProvider);
    const signedMessage = await rpc.signMessage("msg");
    console.log(signedMessage);
  };

  const login = async () => {
    if (!web3auth) {
      console.log("web3auth not initialized yet");
      return;
    }
    await web3auth.connect();
  };

  const logout = async () => {
    if (!web3auth) {
      return;
    }
    await web3auth.logout();
    setLoggedIn(false);
  };

  const isPWA = true;
  const loggedInView = (
    <div>
      {signer && <FloatingInbox isPWA={isPWA} address={address} wallet={signer!} onLogout={logout} ></FloatingInbox>}
      {!signer && <div>no signer! please, refresh.</div>}
    </div>
  );

  const unloggedInView = (
    <button onClick={login} className="card">
      Login
    </button>
  );

  return (
    <div className="container">
    <h1 className="title">
      <a target="_blank" href="https://web3auth.io/docs/sdk/pnp/web/modal" rel="noreferrer">
        Web3Auth
      </a> XMTP Example
       
    </h1>

    <div className="grid">{loggedIn ? loggedInView : unloggedInView}</div>

    <footer className="footer" style={{"margin": '20px', "textAlign": 'center'}}>
      <a
        href="https://github.com/rtomas/xmtp-quickstart-web3auth"
        target="_blank"
        rel="noopener noreferrer"
      >
        Source code
      </a>
    </footer>
  </div>
  );
}

export default App;
