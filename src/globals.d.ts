interface Window {
    ethereum?: {
      request: (request: { method: string, params?: Array<any> }) => Promise<any>;
      enable: () => Promise<string[]>;
      FloatingInbox: {
        open: () => void;
        close: () => void;
      };
    };
    FloatingInbox: {
        open: () => void;
        close: () => void;
      };
  }