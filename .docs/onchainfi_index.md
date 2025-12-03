'use strict';

var react = require('react');
var reactQuery = require('@tanstack/react-query');
var wagmi = require('wagmi');
var reactAuth = require('@privy-io/react-auth');
var walletAdapterReact = require('@solana/wallet-adapter-react');
var walletAdapterWallets = require('@solana/wallet-adapter-wallets');
var chains = require('wagmi/chains');
var jsxRuntime = require('react/jsx-runtime');
var lucideReact = require('lucide-react');
var web3_js = require('@solana/web3.js');
var splToken = require('@solana/spl-token');

var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// src/config/chains.ts
var chains_exports = {};
__export(chains_exports, {
  SUPPORTED_CHAINS: () => exports.SUPPORTED_CHAINS,
  getChainConfig: () => getChainConfig,
  getChainConfigByName: () => getChainConfigByName,
  getExplorerUrl: () => getExplorerUrl,
  getTokenAddress: () => getTokenAddress,
  getTokenConfig: () => getTokenConfig,
  isSolanaNetwork: () => isSolanaNetwork
});
function getTokenAddress(chainId, tokenSymbol = "usdc") {
  const chain = Object.values(exports.SUPPORTED_CHAINS).find((c) => c.id === chainId);
  return chain?.tokens[tokenSymbol.toLowerCase()]?.address;
}
function getTokenConfig(chainId, tokenSymbol = "usdc") {
  const chain = Object.values(exports.SUPPORTED_CHAINS).find((c) => c.id === chainId);
  return chain?.tokens[tokenSymbol.toLowerCase()];
}
function getChainConfig(chainId) {
  return Object.values(exports.SUPPORTED_CHAINS).find((c) => c.id === chainId);
}
function getChainConfigByName(networkName) {
  return exports.SUPPORTED_CHAINS[networkName.toLowerCase()];
}
function isSolanaNetwork(network) {
  if (typeof network === "number") {
    return network === 1399811149 || network === 1399811150;
  }
  return network.toLowerCase().startsWith("solana");
}
function getExplorerUrl(network, txHash) {
  if (isSolanaNetwork(network)) {
    const isDevnet = network.toLowerCase().includes("devnet");
    return `https://solscan.io/tx/${txHash}${isDevnet ? "?cluster=devnet" : ""}`;
  }
  const chain = getChainConfigByName(network);
  if (chain?.blockExplorers?.default) {
    return `${chain.blockExplorers.default.url}/tx/${txHash}`;
  }
  return "";
}
exports.SUPPORTED_CHAINS = void 0;
var init_chains = __esm({
  "src/config/chains.ts"() {
    exports.SUPPORTED_CHAINS = {
      base: {
        id: 8453,
        name: "Base",
        nativeCurrency: {
          name: "Ether",
          symbol: "ETH",
          decimals: 18
        },
        rpcUrls: {
          default: { http: ["https://mainnet.base.org"] },
          public: { http: ["https://mainnet.base.org"] }
        },
        blockExplorers: {
          default: { name: "BaseScan", url: "https://basescan.org" }
        },
        tokens: {
          usdc: {
            address: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
            symbol: "USDC",
            decimals: 6,
            name: "USD Coin"
          }
        },
        samechainIntermediateWallet: process.env.NEXT_PUBLIC_SAMECHAIN_BASE_WALLET || "0xfeb1F8F7F9ff37B94D14c88DE9282DA56b3B1Cb1"
      },
      optimism: {
        id: 10,
        name: "Optimism",
        nativeCurrency: {
          name: "Ether",
          symbol: "ETH",
          decimals: 18
        },
        rpcUrls: {
          default: { http: ["https://mainnet.optimism.io"] },
          public: { http: ["https://mainnet.optimism.io"] }
        },
        blockExplorers: {
          default: { name: "Optimistic Etherscan", url: "https://optimistic.etherscan.io" }
        },
        tokens: {
          usdc: {
            address: "0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85",
            symbol: "USDC",
            decimals: 6,
            name: "USD Coin"
          }
        }
      },
      arbitrum: {
        id: 42161,
        name: "Arbitrum One",
        nativeCurrency: {
          name: "Ether",
          symbol: "ETH",
          decimals: 18
        },
        rpcUrls: {
          default: { http: ["https://arb1.arbitrum.io/rpc"] },
          public: { http: ["https://arb1.arbitrum.io/rpc"] }
        },
        blockExplorers: {
          default: { name: "Arbiscan", url: "https://arbiscan.io" }
        },
        tokens: {
          usdc: {
            address: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831",
            symbol: "USDC",
            decimals: 6,
            name: "USD Coin"
          }
        }
      },
      baseSepolia: {
        id: 84532,
        name: "Base Sepolia",
        nativeCurrency: {
          name: "Ether",
          symbol: "ETH",
          decimals: 18
        },
        rpcUrls: {
          default: { http: ["https://sepolia.base.org"] },
          public: { http: ["https://sepolia.base.org"] }
        },
        blockExplorers: {
          default: { name: "BaseScan", url: "https://sepolia.basescan.org" }
        },
        tokens: {
          usdc: {
            address: "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
            symbol: "USDC",
            decimals: 6,
            name: "USD Coin"
          }
        }
      },
      // Solana chains
      solana: {
        id: 1399811149,
        // Custom ID for Solana mainnet
        name: "Solana",
        nativeCurrency: {
          name: "SOL",
          symbol: "SOL",
          decimals: 9
        },
        rpcUrls: {
          default: { http: ["https://api.mainnet-beta.solana.com"] },
          public: { http: ["https://api.mainnet-beta.solana.com"] }
        },
        blockExplorers: {
          default: { name: "Solscan", url: "https://solscan.io" }
        },
        tokens: {
          usdc: {
            address: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
            symbol: "USDC",
            decimals: 6,
            name: "USD Coin"
          }
        },
        samechainIntermediateWallet: process.env.NEXT_PUBLIC_SAMECHAIN_SOLANA_WALLET || "DoVABZK8r9793SuR3powWCTdr2wVqwhueV9DuZu97n2L"
      },
      solanaDevnet: {
        id: 1399811150,
        // Custom ID for Solana devnet
        name: "Solana Devnet",
        nativeCurrency: {
          name: "SOL",
          symbol: "SOL",
          decimals: 9
        },
        rpcUrls: {
          default: { http: ["https://api.devnet.solana.com"] },
          public: { http: ["https://api.devnet.solana.com"] }
        },
        blockExplorers: {
          default: { name: "Solscan Devnet", url: "https://solscan.io" }
        },
        tokens: {
          usdc: {
            address: "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU",
            symbol: "USDC",
            decimals: 6,
            name: "USD Coin"
          }
        }
      }
    };
  }
});

// src/config/solana.ts
var solana_exports = {};
__export(solana_exports, {
  SOLANA_FEE_PAYERS: () => SOLANA_FEE_PAYERS,
  getSolanaFeePayer: () => getSolanaFeePayer
});
function getSolanaFeePayer(facilitatorName) {
  const feePayer = SOLANA_FEE_PAYERS[facilitatorName];
  if (!feePayer) {
    throw new Error(`Solana fee payer not configured for facilitator: ${facilitatorName}`);
  }
  return feePayer;
}
var SOLANA_FEE_PAYERS;
var init_solana = __esm({
  "src/config/solana.ts"() {
    SOLANA_FEE_PAYERS = {
      "PayAI": "2wKupLR9q6wXYppw8Gr2NvWxKBUqm4PPJKkQfoxHDBg4",
      "Anyspend": "34DmdeSbEnng2bmbSj9ActckY49km2HdhiyAwyXZucqP",
      "OctonetAI": "39uhTfNLqBiPvNQXeK1baNcScaVTCEj4iTxQwbEJukU1",
      "Aurracloud": "8x8CzkTHTYkW18frrTR7HdCV6fsjenvcykJAXWvoPQW"
    };
  }
});

// src/config/defaults.ts
init_chains();
var DEFAULT_API_URL = "https://api.onchain.fi";
var DEFAULT_CHAIN = chains.base;
var DEFAULT_TOKEN = exports.SUPPORTED_CHAINS.base.tokens.usdc;
var DEFAULT_NETWORK = "base";
var DEFAULT_PRIORITY = "balanced";
var DEFAULT_APPEARANCE = {
  theme: "dark",
  accentColor: "#7C3AED",
  landingHeader: "Connect to Continue",
  showWalletLoginFirst: false
};
var DEFAULT_LOGIN_METHODS = ["email", "twitter", "github", "wallet"];
var OnchainConfigContext = react.createContext(null);
function OnchainConfigProvider({
  apiKey,
  apiUrl = DEFAULT_API_URL,
  defaultChain = DEFAULT_CHAIN,
  defaultToken = DEFAULT_TOKEN,
  chains = [DEFAULT_CHAIN],
  children
}) {
  const config = {
    apiKey,
    apiUrl,
    defaultChain,
    defaultToken,
    chains
  };
  return /* @__PURE__ */ jsxRuntime.jsx(OnchainConfigContext.Provider, { value: config, children });
}
function useOnchainConfig() {
  const config = react.useContext(OnchainConfigContext);
  if (!config) {
    throw new Error(
      "useOnchainConfig must be used within OnchainConnect provider. Wrap your app with <OnchainConnect> to use Onchain hooks and components."
    );
  }
  return config;
}
function useOnchainConfigSafe() {
  return react.useContext(OnchainConfigContext);
}
function OnchainConnect({
  privyAppId,
  onchainApiKey,
  onchainApiUrl = DEFAULT_API_URL,
  chains,
  transports,
  connectors,
  wagmiConfig,
  solanaRpcUrl,
  appearance = {},
  loginMethods = DEFAULT_LOGIN_METHODS,
  privyConfig,
  defaultChain = DEFAULT_CHAIN,
  defaultToken = DEFAULT_TOKEN,
  children
}) {
  const [queryClient] = react.useState(() => new reactQuery.QueryClient());
  const finalWagmiConfig = react.useMemo(() => {
    if (wagmiConfig) {
      return wagmiConfig;
    }
    const configChains = chains || [defaultChain];
    const configTransports = transports || {
      [defaultChain.id]: wagmi.http()
    };
    return wagmi.createConfig({
      chains: configChains,
      transports: configTransports,
      connectors
    });
  }, [wagmiConfig, chains, transports, connectors, defaultChain]);
  const finalAppearance = {
    theme: appearance.theme || DEFAULT_APPEARANCE.theme,
    accentColor: appearance.accentColor || DEFAULT_APPEARANCE.accentColor,
    logo: appearance.logo,
    landingHeader: appearance.landingHeader || DEFAULT_APPEARANCE.landingHeader,
    showWalletLoginFirst: appearance.showWalletLoginFirst ?? DEFAULT_APPEARANCE.showWalletLoginFirst,
    walletChainType: "ethereum-and-solana"
    // Support both chains
  };
  const solanaEndpoint = react.useMemo(
    () => {
      if (solanaRpcUrl) {
        return solanaRpcUrl;
      }
      return "https://api.mainnet-beta.solana.com";
    },
    [solanaRpcUrl]
  );
  const solanaWallets = react.useMemo(
    () => [
      new walletAdapterWallets.PhantomWalletAdapter(),
      new walletAdapterWallets.SolflareWalletAdapter()
    ],
    []
  );
  const finalPrivyConfig = react.useMemo(() => {
    if (privyConfig) {
      return privyConfig;
    }
    return {
      appearance: finalAppearance,
      loginMethods,
      embeddedWallets: {
        ethereum: {
          createOnLogin: "users-without-wallets"
        },
        solana: {
          createOnLogin: "users-without-wallets"
          // NEW: Auto-create Solana wallets
        }
      },
      defaultChain,
      supportedChains: chains || [defaultChain]
    };
  }, [privyConfig, finalAppearance, loginMethods, defaultChain, chains]);
  return /* @__PURE__ */ jsxRuntime.jsx(walletAdapterReact.ConnectionProvider, { endpoint: solanaEndpoint, children: /* @__PURE__ */ jsxRuntime.jsx(walletAdapterReact.WalletProvider, { wallets: solanaWallets, autoConnect: false, children: /* @__PURE__ */ jsxRuntime.jsx(reactAuth.PrivyProvider, { appId: privyAppId, config: finalPrivyConfig, children: /* @__PURE__ */ jsxRuntime.jsx(reactQuery.QueryClientProvider, { client: queryClient, children: /* @__PURE__ */ jsxRuntime.jsx(wagmi.WagmiProvider, { config: finalWagmiConfig, children: /* @__PURE__ */ jsxRuntime.jsx(
    OnchainConfigProvider,
    {
      apiKey: onchainApiKey,
      apiUrl: onchainApiUrl,
      defaultChain,
      defaultToken,
      chains: chains || [defaultChain],
      children
    }
  ) }) }) }) }) });
}
function WalletButton({
  className,
  position = "fixed-bottom-left",
  showCopy = true
}) {
  const [showModal, setShowModal] = react.useState(false);
  const [mounted, setMounted] = react.useState(false);
  const [copied, setCopied] = react.useState(false);
  const { address, isConnected } = wagmi.useAccount();
  const { connect, connectors, isPending } = wagmi.useConnect();
  const { disconnect } = wagmi.useDisconnect();
  const { authenticated, user, logout } = reactAuth.usePrivy();
  const { login } = reactAuth.useLogin();
  react.useEffect(() => {
    setMounted(true);
  }, []);
  const handleConnect = (connector) => {
    connect({ connector });
    setShowModal(false);
  };
  const handlePrivyLogin = (method) => {
    login({
      loginMethods: [method]
    });
    setShowModal(false);
  };
  const handleDisconnect = () => {
    if (authenticated) {
      logout();
    }
    if (isConnected) {
      disconnect();
    }
  };
  const copyAddress = async (e) => {
    e.stopPropagation();
    if (displayAddress) {
      await navigator.clipboard.writeText(displayAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2e3);
    }
  };
  const displayAddress = user?.wallet?.address || address;
  const isAnyConnected = authenticated || isConnected;
  const positionClasses = {
    "fixed-bottom-left": "fixed bottom-16 left-8 z-50",
    "fixed-top-left": "fixed top-6 left-6 z-50",
    "inline": "relative"
  };
  return /* @__PURE__ */ jsxRuntime.jsxs(jsxRuntime.Fragment, { children: [
    /* @__PURE__ */ jsxRuntime.jsx("div", { className: className || positionClasses[position], children: /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex items-center gap-3", children: [
      /* @__PURE__ */ jsxRuntime.jsxs(
        "button",
        {
          onClick: () => isAnyConnected ? handleDisconnect() : setShowModal(true),
          className: "backdrop-blur-md bg-black/40 border border-purple-500/30 rounded-full px-6 py-3 shadow-lg shadow-purple-500/20 hover:border-purple-400/50 transition-all duration-300 flex items-center gap-2",
          children: [
            /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Wallet, { className: "text-purple-300", size: 18 }),
            /* @__PURE__ */ jsxRuntime.jsx("span", { className: "text-sm font-medium text-purple-300", children: mounted && isAnyConnected && displayAddress ? `${displayAddress.slice(0, 6)}...${displayAddress.slice(-4)}` : "Connect" })
          ]
        }
      ),
      showCopy && mounted && isAnyConnected && displayAddress && /* @__PURE__ */ jsxRuntime.jsx(
        "button",
        {
          onClick: copyAddress,
          className: "backdrop-blur-md bg-black/40 border border-purple-500/30 rounded-full p-3 shadow-lg shadow-purple-500/20 hover:border-purple-400/50 transition-all duration-300",
          title: "Copy wallet address",
          children: copied ? /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Check, { className: "text-green-400", size: 18 }) : /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Copy, { className: "text-purple-300", size: 18 })
        }
      )
    ] }) }),
    showModal && /* @__PURE__ */ jsxRuntime.jsxs(
      "div",
      {
        className: "fixed inset-0 z-[100] flex items-center justify-center",
        onClick: () => setShowModal(false),
        children: [
          /* @__PURE__ */ jsxRuntime.jsx("div", { className: "absolute inset-0 bg-black/80 backdrop-blur-sm" }),
          /* @__PURE__ */ jsxRuntime.jsxs(
            "div",
            {
              className: "relative bg-black/90 backdrop-blur-md border border-purple-500/30 rounded-2xl p-8 shadow-2xl shadow-purple-500/20 max-w-md w-full mx-4",
              onClick: (e) => e.stopPropagation(),
              children: [
                /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex items-center justify-between mb-6", children: [
                  /* @__PURE__ */ jsxRuntime.jsx("h2", { className: "text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-purple-600", children: isAnyConnected ? "Connected" : "Connect Wallet" }),
                  /* @__PURE__ */ jsxRuntime.jsx(
                    "button",
                    {
                      onClick: () => setShowModal(false),
                      className: "text-purple-400 hover:text-purple-300 transition-colors",
                      children: /* @__PURE__ */ jsxRuntime.jsx(lucideReact.X, { size: 24 })
                    }
                  )
                ] }),
                isAnyConnected && displayAddress && /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "mb-6 bg-purple-900/20 border border-purple-500/30 rounded-lg p-4", children: [
                  /* @__PURE__ */ jsxRuntime.jsx("p", { className: "text-xs text-purple-300/60 mb-2 uppercase tracking-wider", children: "Your Wallet Address" }),
                  /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex items-center justify-between gap-2", children: [
                    /* @__PURE__ */ jsxRuntime.jsx("code", { className: "text-sm text-purple-200 font-mono break-all", children: displayAddress }),
                    /* @__PURE__ */ jsxRuntime.jsx(
                      "button",
                      {
                        onClick: copyAddress,
                        className: "flex-shrink-0 p-2 hover:bg-purple-500/20 rounded transition-colors",
                        title: "Copy address",
                        children: copied ? /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Check, { className: "text-green-400", size: 16 }) : /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Copy, { className: "text-purple-400", size: 16 })
                      }
                    )
                  ] }),
                  authenticated && /* @__PURE__ */ jsxRuntime.jsx("p", { className: "text-xs text-purple-300/60 mt-3", children: "\u{1F4A1} Send USDC to this address to fund your embedded wallet" })
                ] }),
                !isAnyConnected && /* @__PURE__ */ jsxRuntime.jsx("p", { className: "text-purple-200/80 text-sm mb-6", children: "Sign in with email, X, or GitHub to get started" }),
                isAnyConnected && /* @__PURE__ */ jsxRuntime.jsxs(
                  "button",
                  {
                    onClick: handleDisconnect,
                    className: "w-full bg-red-900/30 hover:bg-red-900/50 border border-red-500/30 hover:border-red-400/50 rounded-lg px-6 py-4 transition-all duration-200 flex items-center justify-center gap-2 text-red-300 font-medium mb-4",
                    children: [
                      /* @__PURE__ */ jsxRuntime.jsx(lucideReact.X, { size: 18 }),
                      "Disconnect"
                    ]
                  }
                ),
                !isAnyConnected && /* @__PURE__ */ jsxRuntime.jsxs(jsxRuntime.Fragment, { children: [
                  /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "space-y-3 mb-4", children: [
                    /* @__PURE__ */ jsxRuntime.jsxs(
                      "button",
                      {
                        onClick: () => handlePrivyLogin("email"),
                        className: "w-full bg-black/40 hover:bg-black/60 border border-purple-500/30 hover:border-purple-400/50 rounded-lg px-6 py-4 transition-all duration-200 flex items-center justify-between group",
                        children: [
                          /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex items-center gap-3", children: [
                            /* @__PURE__ */ jsxRuntime.jsx("div", { className: "w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center", children: /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Mail, { className: "text-purple-400", size: 18 }) }),
                            /* @__PURE__ */ jsxRuntime.jsx("span", { className: "text-purple-200 font-medium group-hover:text-purple-100 transition-colors", children: "Continue with Email" })
                          ] }),
                          /* @__PURE__ */ jsxRuntime.jsx(lucideReact.ChevronRight, { className: "text-purple-400 group-hover:text-purple-300 transition-colors", size: 20 })
                        ]
                      }
                    ),
                    /* @__PURE__ */ jsxRuntime.jsxs(
                      "button",
                      {
                        onClick: () => handlePrivyLogin("twitter"),
                        className: "w-full bg-black/40 hover:bg-black/60 border border-purple-500/30 hover:border-purple-400/50 rounded-lg px-6 py-4 transition-all duration-200 flex items-center justify-between group",
                        children: [
                          /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex items-center gap-3", children: [
                            /* @__PURE__ */ jsxRuntime.jsx("div", { className: "w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center", children: /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Twitter, { className: "text-purple-400", size: 18 }) }),
                            /* @__PURE__ */ jsxRuntime.jsx("span", { className: "text-purple-200 font-medium group-hover:text-purple-100 transition-colors", children: "Continue with X" })
                          ] }),
                          /* @__PURE__ */ jsxRuntime.jsx(lucideReact.ChevronRight, { className: "text-purple-400 group-hover:text-purple-300 transition-colors", size: 20 })
                        ]
                      }
                    ),
                    /* @__PURE__ */ jsxRuntime.jsxs(
                      "button",
                      {
                        onClick: () => handlePrivyLogin("github"),
                        className: "w-full bg-black/40 hover:bg-black/60 border border-purple-500/30 hover:border-purple-400/50 rounded-lg px-6 py-4 transition-all duration-200 flex items-center justify-between group",
                        children: [
                          /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex items-center gap-3", children: [
                            /* @__PURE__ */ jsxRuntime.jsx("div", { className: "w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center", children: /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Github, { className: "text-purple-400", size: 18 }) }),
                            /* @__PURE__ */ jsxRuntime.jsx("span", { className: "text-purple-200 font-medium group-hover:text-purple-100 transition-colors", children: "Continue with GitHub" })
                          ] }),
                          /* @__PURE__ */ jsxRuntime.jsx(lucideReact.ChevronRight, { className: "text-purple-400 group-hover:text-purple-300 transition-colors", size: 20 })
                        ]
                      }
                    )
                  ] }),
                  /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "relative my-6", children: [
                    /* @__PURE__ */ jsxRuntime.jsx("div", { className: "absolute inset-0 flex items-center", children: /* @__PURE__ */ jsxRuntime.jsx("div", { className: "w-full border-t border-purple-500/20" }) }),
                    /* @__PURE__ */ jsxRuntime.jsx("div", { className: "relative flex justify-center text-xs uppercase", children: /* @__PURE__ */ jsxRuntime.jsx("span", { className: "bg-black/90 px-2 text-purple-400/60", children: "Or connect wallet" }) })
                  ] }),
                  /* @__PURE__ */ jsxRuntime.jsx("div", { className: "space-y-3", children: connectors.map((connector) => /* @__PURE__ */ jsxRuntime.jsxs(
                    "button",
                    {
                      onClick: () => handleConnect(connector),
                      disabled: isPending,
                      className: "w-full bg-black/40 hover:bg-black/60 border border-purple-500/30 hover:border-purple-400/50 rounded-lg px-6 py-4 transition-all duration-200 flex items-center justify-between group disabled:opacity-50 disabled:cursor-not-allowed",
                      children: [
                        /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex items-center gap-3", children: [
                          /* @__PURE__ */ jsxRuntime.jsx("div", { className: "w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center", children: /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Wallet, { className: "text-purple-400", size: 18 }) }),
                          /* @__PURE__ */ jsxRuntime.jsx("span", { className: "text-purple-200 font-medium group-hover:text-purple-100 transition-colors", children: connector.name })
                        ] }),
                        isPending ? /* @__PURE__ */ jsxRuntime.jsx("div", { className: "w-4 h-4 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" }) : /* @__PURE__ */ jsxRuntime.jsx(lucideReact.ChevronRight, { className: "text-purple-400 group-hover:text-purple-300 transition-colors", size: 20 })
                      ]
                    },
                    connector.id
                  )) })
                ] }),
                /* @__PURE__ */ jsxRuntime.jsx("div", { className: "mt-6 bg-purple-900/20 border border-purple-500/30 rounded-lg p-4", children: /* @__PURE__ */ jsxRuntime.jsxs("p", { className: "text-purple-200/90 text-xs leading-relaxed", children: [
                  "\u{1F4A1} ",
                  /* @__PURE__ */ jsxRuntime.jsx("strong", { children: "New to crypto?" }),
                  " Sign in with email, X, or GitHub to get an instant embedded wallet. Advanced users can connect their existing wallet (MetaMask, Coinbase Wallet, etc)."
                ] }) })
              ]
            }
          )
        ]
      }
    )
  ] });
}
function useOnchainWallet() {
  const { address: wagmiAddress, isConnected: wagmiConnected, chainId: wagmiChainId } = wagmi.useAccount();
  const { authenticated, user, login, logout } = reactAuth.usePrivy();
  const solanaWallet = walletAdapterReact.useWallet();
  const hasSolanaWallet = solanaWallet.connected && !!solanaWallet.publicKey;
  const hasPrivySolanaWallet = authenticated && user?.wallet?.chainType === "solana";
  let address;
  let chainType;
  let network;
  let isExternalWallet;
  let chainId;
  if (hasSolanaWallet) {
    address = solanaWallet.publicKey?.toBase58();
    chainType = "solana";
    network = "solana";
    isExternalWallet = true;
    chainId = void 0;
  } else if (hasPrivySolanaWallet) {
    address = user?.wallet?.address;
    chainType = "solana";
    network = "solana";
    isExternalWallet = false;
    chainId = void 0;
  } else {
    address = user?.wallet?.address || wagmiAddress;
    chainType = "evm";
    chainId = wagmiChainId;
    if (chainId === 8453) {
      network = "base";
    } else if (chainId === 1) {
      network = "ethereum";
    } else if (chainId === 10) {
      network = "optimism";
    } else if (chainId === 42161) {
      network = "arbitrum";
    } else {
      network = chainId ? `chain-${chainId}` : "unknown";
    }
    isExternalWallet = wagmiConnected && !authenticated;
    if (chainId) {
      console.log("[useOnchainWallet] EVM wallet detected:", {
        address: address?.slice(0, 6) + "..." + address?.slice(-4),
        chainId,
        network,
        isExternalWallet
      });
    }
  }
  const isConnected = hasSolanaWallet || authenticated || wagmiConnected;
  return {
    address,
    isConnected,
    isPrivyUser: authenticated,
    isExternalWallet,
    chainType,
    network,
    chainId,
    user,
    login,
    logout: hasSolanaWallet ? () => solanaWallet.disconnect() : logout
  };
}

// src/hooks/shared/api.ts
async function verifyPayment(params) {
  const response = await fetch(`${params.apiUrl}/v1/verify`, {
    method: "POST",
    headers: {
      "X-API-Key": params.apiKey,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      paymentHeader: params.paymentHeader,
      sourceNetwork: params.sourceNetwork,
      destinationNetwork: params.destinationNetwork,
      expectedAmount: params.expectedAmount,
      expectedToken: params.expectedToken,
      recipientAddress: params.recipientAddress,
      ...params.finalRecipient && { finalRecipient: params.finalRecipient },
      priority: params.priority,
      ...params.bridgeOrderId && { bridgeOrderId: params.bridgeOrderId },
      ...params.expectedFees && { expectedFees: params.expectedFees },
      ...params.needsATACreation !== void 0 && { needsATACreation: params.needsATACreation }
    })
  });
  const data = await response.json();
  if (!response.ok || data.status !== "success" || !data.data?.valid) {
    const errorMessage = data.error?.message || data.message || data.data?.reason || "Payment verification failed";
    const errorHint = data.error?.hint || "";
    const fullMessage = errorHint ? `${errorMessage} ${errorHint}` : errorMessage;
    throw new Error(fullMessage);
  }
  return data;
}
async function settlePayment(params) {
  const response = await fetch(`${params.apiUrl}/v1/settle`, {
    method: "POST",
    headers: {
      "X-API-Key": params.apiKey,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      paymentId: params.paymentId,
      // REQUIRED: Unique payment ID from verify
      paymentHeader: params.paymentHeader,
      sourceNetwork: params.sourceNetwork,
      destinationNetwork: params.destinationNetwork,
      priority: params.priority
    })
  });
  const data = await response.json();
  if (!response.ok || data.status !== "success" || !data.data?.settled) {
    const errorMessage = data.error?.message || data.message || data.data?.reason || "Payment settlement failed";
    const errorHint = data.error?.hint || "";
    const fullMessage = errorHint ? `${errorMessage} ${errorHint}` : errorMessage;
    throw new Error(fullMessage);
  }
  return data;
}
async function getRankedFacilitators(params) {
  const response = await fetch(
    `${params.apiUrl}/v1/facilitators/ranked?network=${params.network}&priority=${params.priority}`,
    {
      headers: {
        "X-API-Key": params.apiKey,
        "Content-Type": "application/json"
      }
    }
  );
  if (!response.ok) {
    throw new Error(`Failed to get facilitator rankings: ${response.status}`);
  }
  const data = await response.json();
  const topFacilitatorName = data.data?.facilitators?.[0]?.facilitatorName;
  if (!topFacilitatorName) {
    throw new Error("No facilitators available");
  }
  return topFacilitatorName;
}
async function prepareBridge(params) {
  console.log("[Bridge Prepare] Calling /bridge/prepare:", {
    sourceNetwork: params.sourceNetwork,
    destinationNetwork: params.destinationNetwork,
    amount: params.amount,
    recipientAddress: params.recipientAddress
  });
  const response = await fetch(`${params.apiUrl}/v1/bridge/prepare`, {
    method: "POST",
    headers: {
      "X-API-Key": params.apiKey,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      sourceNetwork: params.sourceNetwork,
      destinationNetwork: params.destinationNetwork,
      amount: params.amount,
      recipientAddress: params.recipientAddress
    })
  });
  const data = await response.json();
  console.log("[Bridge Prepare] Response:", data);
  if (!response.ok || data.status !== "success") {
    const errorMessage = data.error?.message || data.message || "Crosschain bridge preparation failed";
    const errorHint = data.error?.hint || "";
    const fullMessage = errorHint ? `${errorMessage} ${errorHint}` : errorMessage;
    throw new Error(fullMessage);
  }
  return {
    depositAddress: data.data.depositAddress,
    orderId: data.data.orderId
  };
}

// src/config/tokens.ts
var COMMON_TOKENS = {
  usdc: {
    symbol: "USDC",
    decimals: 6,
    name: "USD Coin"
  },
  usdt: {
    symbol: "USDT",
    decimals: 6,
    name: "Tether USD"
  },
  dai: {
    symbol: "DAI",
    decimals: 18,
    name: "Dai Stablecoin"
  }
};
function formatTokenAmount(amount, decimals) {
  const divisor = BigInt(10 ** decimals);
  const whole = amount / divisor;
  const remainder = amount % divisor;
  if (remainder === 0n) {
    return whole.toString();
  }
  const remainderStr = remainder.toString().padStart(decimals, "0");
  const trimmed = remainderStr.replace(/0+$/, "");
  return `${whole}.${trimmed}`;
}
function parseTokenAmount(amount, decimals) {
  const [whole, fraction = ""] = amount.split(".");
  const paddedFraction = fraction.padEnd(decimals, "0").slice(0, decimals);
  const combined = whole + paddedFraction;
  return BigInt(combined);
}

// src/hooks/shared/validation.ts
function validateAmount(amount, decimals) {
  return parseTokenAmount(amount, decimals);
}
function generateNonce() {
  const nonceArray = new Uint8Array(32);
  crypto.getRandomValues(nonceArray);
  return "0x" + Array.from(nonceArray).map((b) => b.toString(16).padStart(2, "0")).join("");
}
function getValidityTimestamps() {
  return {
    validAfter: 0,
    validBefore: Math.floor(Date.now() / 1e3) + 3600
    // 1 hour
  };
}

// src/hooks/shared/feeConfig.ts
var DEFAULT_FEE_CONFIG = {
  samechain: {
    standard: 0.1,
    // 0.1%
    reduced: 0.05,
    // 0.05%
    complimentary: 0,
    // 0%
    merchantTier: "STANDARD",
    currentFee: 0.1
  },
  crosschain: {
    feePercent: 1,
    // 1% (was incorrectly 0.1% before)
    minimumFeeBase: 0.01,
    // $0.01 minimum
    minimumFeeSolana: 0.01
    // $0.01 minimum
  },
  ata: {
    creationFee: 0.4,
    // ~0.002 SOL in USDC
    description: "One-time Solana rent-exempt fee for creating ATA account"
  }
};
var cachedFeeConfig = null;
var cacheTimestamp = 0;
var CACHE_DURATION = 5 * 60 * 1e3;
async function getFeeConfig(apiUrl, apiKey) {
  if (cachedFeeConfig && Date.now() - cacheTimestamp < CACHE_DURATION) {
    return cachedFeeConfig;
  }
  if (!apiKey) {
    console.warn("[FeeConfig] No API key provided, using defaults");
    return DEFAULT_FEE_CONFIG;
  }
  try {
    const response = await fetch(`${apiUrl}/v1/fee-config`, {
      method: "GET",
      headers: {
        "X-API-Key": apiKey,
        "Content-Type": "application/json"
      }
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch fee config: ${response.status} ${response.statusText}`);
    }
    const result = await response.json();
    if (result.status !== "success" || !result.data) {
      throw new Error("Invalid fee config response format");
    }
    cachedFeeConfig = result.data;
    cacheTimestamp = Date.now();
    console.log("[FeeConfig] \u2705 Fetched from API:", {
      merchantTier: result.data.samechain.merchantTier,
      currentFee: result.data.samechain.currentFee,
      crosschainFee: result.data.crosschain.feePercent
    });
    return result.data;
  } catch (error) {
    console.warn("[FeeConfig] Failed to fetch from API, using defaults:", error);
    return DEFAULT_FEE_CONFIG;
  }
}

// src/hooks/useEvmPay.ts
function useEvmPay(config) {
  const globalConfig = useOnchainConfig();
  const { address, isConnected, isPrivyUser } = useOnchainWallet();
  const { signTypedData: privySignTypedData } = reactAuth.usePrivy();
  const { signTypedDataAsync } = wagmi.useSignTypedData();
  const currentChainId = wagmi.useChainId();
  const [isPaying, setIsPaying] = react.useState(false);
  const [isVerifying, setIsVerifying] = react.useState(false);
  const [isSettling, setIsSettling] = react.useState(false);
  const [lastTxHash, setLastTxHash] = react.useState();
  const [error, setError] = react.useState();
  const [paymentState, setPaymentState] = react.useState({});
  const [feeConfig, setFeeConfig] = react.useState(DEFAULT_FEE_CONFIG);
  const finalConfig = {
    apiKey: config?.apiKey || globalConfig.apiKey,
    apiUrl: config?.apiUrl || globalConfig.apiUrl,
    network: config?.network,
    chainId: config?.chainId || currentChainId,
    token: config?.token || globalConfig.defaultToken,
    autoVerify: config?.autoVerify ?? true,
    autoSettle: config?.autoSettle ?? true,
    retryOnFail: config?.retryOnFail ?? false,
    maxRetries: config?.maxRetries ?? 0,
    callbacks: config?.callbacks || {}
  };
  react.useEffect(() => {
    if (finalConfig.apiKey && finalConfig.apiUrl) {
      getFeeConfig(finalConfig.apiUrl, finalConfig.apiKey).then((config2) => {
        setFeeConfig(config2);
        console.log("[useEvmPay] \u2705 Fee config loaded:", {
          merchantTier: config2.samechain.merchantTier,
          currentFee: config2.samechain.currentFee,
          crosschainFee: config2.crosschain.feePercent
        });
      }).catch((err) => {
        console.warn("[useEvmPay] Failed to fetch fee config, using defaults:", err);
      });
    }
  }, [finalConfig.apiKey, finalConfig.apiUrl]);
  const reset = react.useCallback(() => {
    setIsPaying(false);
    setIsVerifying(false);
    setIsSettling(false);
    setLastTxHash(void 0);
    setError(void 0);
    setPaymentState({});
  }, []);
  const signPayment = react.useCallback(async (params) => {
    if (!isConnected || !address) {
      throw new Error("Wallet not connected");
    }
    const { to, amount, chainId: paramChainId, token: paramToken, sourceNetwork } = params;
    const useChainId2 = paramChainId || finalConfig.chainId;
    const useToken = paramToken || finalConfig.token;
    if (sourceNetwork) {
      const expectedChainId = sourceNetwork === "base" ? 8453 : void 0;
      if (expectedChainId && currentChainId !== expectedChainId) {
        const errorMsg = `Chain mismatch: Wallet is on chain ${currentChainId}, but payment requires chain ${expectedChainId} (${sourceNetwork}). Please switch networks in your wallet.`;
        console.error("[useEvmPay] \u274C Pre-flight validation failed:", {
          currentChainId,
          expectedChainId,
          sourceNetwork
        });
        throw new Error(errorMsg);
      }
    }
    finalConfig.callbacks.onSigningStart?.();
    const amountBigInt = validateAmount(amount, useToken.decimals);
    const { validAfter, validBefore } = getValidityTimestamps();
    const nonce = generateNonce();
    console.log("[useEvmPay] \u{1F4B3} Constructing EIP-712 signature:", {
      chainId: useChainId2,
      sourceNetwork: sourceNetwork || "not specified",
      token: useToken.symbol,
      amount,
      to: to.slice(0, 6) + "..." + to.slice(-4)
    });
    const domain = {
      name: useToken.name || "USD Coin",
      version: "2",
      chainId: useChainId2,
      verifyingContract: useToken.address
    };
    const types = {
      TransferWithAuthorization: [
        { name: "from", type: "address" },
        { name: "to", type: "address" },
        { name: "value", type: "uint256" },
        { name: "validAfter", type: "uint256" },
        { name: "validBefore", type: "uint256" },
        { name: "nonce", type: "bytes32" }
      ]
    };
    let signature;
    if (isPrivyUser && privySignTypedData) {
      const privyMessage = {
        from: address,
        to,
        value: amountBigInt.toString(),
        validAfter: validAfter.toString(),
        validBefore: validBefore.toString(),
        nonce
      };
      const result = await privySignTypedData({
        domain,
        types,
        primaryType: "TransferWithAuthorization",
        message: privyMessage
      });
      signature = result.signature;
    } else {
      const value = {
        from: address,
        to,
        value: amountBigInt,
        validAfter: BigInt(validAfter),
        validBefore: BigInt(validBefore),
        nonce
      };
      signature = await signTypedDataAsync({
        domain,
        types,
        primaryType: "TransferWithAuthorization",
        message: value
      });
    }
    finalConfig.callbacks.onSigningComplete?.();
    const x402Header = btoa(JSON.stringify({
      x402Version: 1,
      scheme: "exact",
      network: params.sourceNetwork || params.network || finalConfig.network || "base",
      payload: {
        signature,
        authorization: {
          from: address,
          to,
          value: amountBigInt.toString(),
          validAfter: validAfter.toString(),
          validBefore: validBefore.toString(),
          nonce
        }
      }
    }));
    return { signature, x402Header };
  }, [address, isConnected, isPrivyUser, privySignTypedData, signTypedDataAsync, finalConfig]);
  const verify = react.useCallback(async (params) => {
    if (!finalConfig.apiKey) {
      const error2 = new Error("Onchain API key not provided");
      params.onError?.(error2);
      setError(error2);
      return { success: false, error: error2.message };
    }
    setIsVerifying(true);
    setError(void 0);
    try {
      finalConfig.callbacks.onVerificationStart?.();
      const sourceNetwork = params.sourceNetwork || params.network || finalConfig.network || "base";
      const destinationNetwork = params.destinationNetwork || params.network || finalConfig.network || "base";
      const priority = params.priority || DEFAULT_PRIORITY;
      const isCrossChain = sourceNetwork !== destinationNetwork;
      const isSameChain = !isCrossChain;
      let recipientAddress = params.to;
      let bridgeOrderId;
      const amountValue = parseFloat(params.amount);
      const feePercent = isCrossChain ? feeConfig.crosschain.feePercent : feeConfig.samechain.currentFee;
      let processingFee = amountValue * feePercent / 100;
      if (isCrossChain) {
        const minFee = destinationNetwork.toLowerCase().includes("solana") ? feeConfig.crosschain.minimumFeeSolana : feeConfig.crosschain.minimumFeeBase;
        processingFee = Math.max(processingFee, minFee);
      }
      const expectedFees = {
        processingFee: processingFee.toFixed(6),
        totalFees: processingFee.toFixed(6)
      };
      console.log("[Verify] Calculated fees:", expectedFees);
      if (isCrossChain) {
        const bridgeData = await prepareBridge({
          apiUrl: finalConfig.apiUrl,
          apiKey: finalConfig.apiKey,
          sourceNetwork,
          destinationNetwork,
          amount: params.amount,
          recipientAddress: params.to
        });
        recipientAddress = bridgeData.depositAddress;
        bridgeOrderId = bridgeData.orderId;
        console.log("\u{1F309} Cross-chain payment detected:", {
          originalRecipient: params.to,
          adapterAddress: recipientAddress,
          bridgeOrderId,
          sourceNetwork,
          destinationNetwork
        });
      }
      let originalRecipient;
      if (isSameChain) {
        const { SUPPORTED_CHAINS: SUPPORTED_CHAINS2 } = await Promise.resolve().then(() => (init_chains(), chains_exports));
        const baseChain = SUPPORTED_CHAINS2.base;
        const intermediateWallet = baseChain.samechainIntermediateWallet;
        if (intermediateWallet) {
          originalRecipient = recipientAddress;
          recipientAddress = intermediateWallet;
          console.log("\u{1F4B0} Same-chain two-hop payment:", {
            originalRecipient,
            intermediateWallet: recipientAddress,
            network: sourceNetwork
          });
        } else {
          console.warn("\u26A0\uFE0F No intermediate wallet configured for Base - payment will fail");
        }
      }
      console.log("[Verify] Calling signPayment (EVM) with:", {
        to: recipientAddress,
        amount: params.amount
      });
      const { x402Header, signature } = await signPayment({ ...params, to: recipientAddress });
      console.log("[Verify] EVM signing successful");
      const verifyResponse = await verifyPayment({
        apiUrl: finalConfig.apiUrl,
        apiKey: finalConfig.apiKey,
        paymentHeader: x402Header,
        sourceNetwork,
        destinationNetwork,
        expectedAmount: params.amount,
        expectedToken: params.token?.symbol || finalConfig.token.symbol,
        recipientAddress,
        // For crosschain: adapter address, for samechain: intermediate wallet
        finalRecipient: originalRecipient,
        // For samechain two-hop: original recipient
        priority,
        bridgeOrderId,
        expectedFees,
        needsATACreation: false
        // Backend will handle ATA detection
      });
      const paymentId = verifyResponse.data?.paymentId;
      if (!paymentId) {
        console.error("[Verify] \u274C No paymentId returned from API:", verifyResponse);
        throw new Error("Payment verification succeeded but no payment ID was returned. This is a server error.");
      }
      console.log("[Verify] \u2705 Payment verified with ID:", paymentId);
      setPaymentState({ signature, x402Header, sourceNetwork, destinationNetwork, priority, paymentId });
      finalConfig.callbacks.onVerificationComplete?.();
      return { success: true, verified: true, x402Header, sourceNetwork, destinationNetwork, priority, paymentId };
    } catch (error2) {
      const err = error2 instanceof Error ? error2 : new Error("Unknown error");
      params.onError?.(err);
      setError(err);
      return { success: false, error: err.message };
    } finally {
      setIsVerifying(false);
    }
  }, [finalConfig, signPayment]);
  const settleInternal = react.useCallback(async (paymentId, x402Header, sourceNetwork, destinationNetwork, priority, params) => {
    if (!finalConfig.apiKey) {
      const error2 = new Error("Onchain API key not provided");
      setError(error2);
      return { success: false, error: error2.message };
    }
    setIsSettling(true);
    setError(void 0);
    try {
      finalConfig.callbacks.onSettlementStart?.();
      const data = await settlePayment({
        apiUrl: finalConfig.apiUrl,
        apiKey: finalConfig.apiKey,
        paymentId,
        // REQUIRED: Payment ID from verify
        paymentHeader: x402Header,
        sourceNetwork,
        destinationNetwork,
        priority
      });
      const txHash = data.data.txHash || "";
      setLastTxHash(txHash);
      finalConfig.callbacks.onSettlementComplete?.();
      params?.onSuccess?.(txHash);
      return { success: true, txHash, settled: true };
    } catch (error2) {
      const err = error2 instanceof Error ? error2 : new Error("Unknown error");
      params?.onError?.(err);
      setError(err);
      return { success: false, error: err.message };
    } finally {
      setIsSettling(false);
    }
  }, [finalConfig]);
  const settle = react.useCallback(async (params) => {
    if (!finalConfig.apiKey) {
      const error2 = new Error("Onchain API key not provided");
      setError(error2);
      return { success: false, error: error2.message };
    }
    if (!paymentState.x402Header) {
      const error2 = new Error("No payment to settle. Call verify() first.");
      setError(error2);
      return { success: false, error: error2.message };
    }
    if (!paymentState.paymentId) {
      const error2 = new Error("No payment ID available. Verify did not return a payment ID.");
      setError(error2);
      return { success: false, error: error2.message };
    }
    return settleInternal(
      paymentState.paymentId,
      paymentState.x402Header,
      paymentState.sourceNetwork,
      paymentState.destinationNetwork,
      paymentState.priority,
      params
    );
  }, [finalConfig, paymentState, settleInternal]);
  const pay = react.useCallback(async (params) => {
    setIsPaying(true);
    setError(void 0);
    try {
      const verifyResult = await verify(params);
      if (!verifyResult.success) {
        return verifyResult;
      }
      if (finalConfig.autoSettle) {
        if (!verifyResult.paymentId) {
          const error2 = new Error("Payment verification succeeded but no payment ID was returned");
          setError(error2);
          return { success: false, error: error2.message };
        }
        const settleResult = await settleInternal(
          verifyResult.paymentId,
          verifyResult.x402Header,
          verifyResult.sourceNetwork,
          verifyResult.destinationNetwork,
          verifyResult.priority,
          params
        );
        return settleResult;
      }
      return verifyResult;
    } catch (error2) {
      const err = error2 instanceof Error ? error2 : new Error("Unknown error");
      params.onError?.(err);
      setError(err);
      return { success: false, error: err.message };
    } finally {
      setIsPaying(false);
    }
  }, [verify, finalConfig.autoSettle, settleInternal]);
  return {
    pay,
    verify,
    settle,
    isPaying,
    isVerifying,
    isSettling,
    isReady: isConnected && !!finalConfig.apiKey,
    lastTxHash,
    error,
    reset
  };
}
function useSolanaPay(config) {
  const globalConfig = useOnchainConfig();
  const { address, isConnected, isPrivyUser } = useOnchainWallet();
  const { user } = reactAuth.usePrivy();
  const solanaWallet = walletAdapterReact.useWallet();
  const { connection } = walletAdapterReact.useConnection();
  const [isPaying, setIsPaying] = react.useState(false);
  const [isVerifying, setIsVerifying] = react.useState(false);
  const [isSettling, setIsSettling] = react.useState(false);
  const [lastTxHash, setLastTxHash] = react.useState();
  const [error, setError] = react.useState();
  const [paymentState, setPaymentState] = react.useState({});
  const [feeConfig, setFeeConfig] = react.useState(DEFAULT_FEE_CONFIG);
  const finalConfig = {
    apiKey: config?.apiKey || globalConfig.apiKey,
    apiUrl: config?.apiUrl || globalConfig.apiUrl,
    network: config?.network,
    token: config?.token || globalConfig.defaultToken,
    autoVerify: config?.autoVerify ?? true,
    autoSettle: config?.autoSettle ?? true,
    retryOnFail: config?.retryOnFail ?? false,
    maxRetries: config?.maxRetries ?? 0,
    callbacks: config?.callbacks || {}
  };
  react.useEffect(() => {
    if (finalConfig.apiKey && finalConfig.apiUrl) {
      getFeeConfig(finalConfig.apiUrl, finalConfig.apiKey).then((config2) => {
        setFeeConfig(config2);
        console.log("[useSolanaPay] \u2705 Fee config loaded:", {
          merchantTier: config2.samechain.merchantTier,
          currentFee: config2.samechain.currentFee,
          crosschainFee: config2.crosschain.feePercent
        });
      }).catch((err) => {
        console.warn("[useSolanaPay] Failed to fetch fee config, using defaults:", err);
      });
    }
  }, [finalConfig.apiKey, finalConfig.apiUrl]);
  const reset = react.useCallback(() => {
    setIsPaying(false);
    setIsVerifying(false);
    setIsSettling(false);
    setLastTxHash(void 0);
    setError(void 0);
    setPaymentState({});
  }, []);
  const signSolanaPayment = react.useCallback(async (params) => {
    if (!isConnected || !address) {
      throw new Error("Solana wallet not connected");
    }
    const { to, amount, token: paramToken, sourceNetwork, destinationNetwork } = params;
    const isCrossChain = sourceNetwork && destinationNetwork && sourceNetwork !== destinationNetwork;
    const { SUPPORTED_CHAINS: SUPPORTED_CHAINS2 } = await Promise.resolve().then(() => (init_chains(), chains_exports));
    const solanaChain = sourceNetwork?.includes("devnet") ? SUPPORTED_CHAINS2.solanaDevnet : SUPPORTED_CHAINS2.solana;
    const useToken = paramToken || solanaChain.tokens.usdc;
    finalConfig.callbacks.onSigningStart?.();
    const amountBigInt = validateAmount(amount, useToken.decimals);
    try {
      console.log("[Solana x402] Starting payment construction", {
        to,
        amount,
        isCrossChain,
        sourceNetwork,
        destinationNetwork
      });
      let userPubkey;
      try {
        userPubkey = new web3_js.PublicKey(address);
        console.log("[Solana x402] User pubkey created:", userPubkey.toBase58());
      } catch (error2) {
        throw new Error(`Invalid user address: ${address} - ${error2.message}`);
      }
      let destination;
      let actualRecipient;
      if (isCrossChain) {
        try {
          destination = new web3_js.PublicKey(to);
          console.log("[Solana x402] Cross-chain destination (adapter PDA):", destination.toBase58());
        } catch (error2) {
          throw new Error(`Invalid adapter PDA address from API: ${to} - ${error2.message}`);
        }
        actualRecipient = params.to;
      } else {
        try {
          destination = new web3_js.PublicKey(to);
          console.log("[Solana x402] Same-chain destination:", destination.toBase58());
        } catch (error2) {
          throw new Error(`Invalid recipient address: ${to} - ${error2.message}`);
        }
        actualRecipient = to;
      }
      let mintPubkey;
      try {
        mintPubkey = new web3_js.PublicKey(useToken.address);
        console.log("[Solana x402] Mint pubkey:", mintPubkey.toBase58());
      } catch (error2) {
        throw new Error(`Invalid token mint address: ${useToken.address} - ${error2.message}`);
      }
      let blockhash;
      try {
        const blockh = await connection.getLatestBlockhash("confirmed");
        blockhash = blockh.blockhash;
        console.log("[Solana x402] Got latest blockhash:", blockhash.slice(0, 8) + "...");
      } catch (error2) {
        throw new Error(`Failed to get blockhash from Solana: ${error2.message}`);
      }
      let programId;
      try {
        const mintInfo = await connection.getAccountInfo(mintPubkey, "confirmed");
        programId = mintInfo?.owner?.toBase58() === splToken.TOKEN_2022_PROGRAM_ID.toBase58() ? splToken.TOKEN_2022_PROGRAM_ID : splToken.TOKEN_PROGRAM_ID;
        console.log("[Solana x402] Token program:", programId.toBase58());
      } catch (error2) {
        throw new Error(`Failed to fetch mint info: ${error2.message}`);
      }
      let mint;
      try {
        mint = await splToken.getMint(connection, mintPubkey, void 0, programId);
        console.log("[Solana x402] Mint decimals:", mint.decimals);
      } catch (error2) {
        throw new Error(`Failed to fetch mint: ${error2.message}`);
      }
      let sourceAta;
      let destinationAta;
      try {
        sourceAta = await splToken.getAssociatedTokenAddress(mintPubkey, userPubkey, false, programId);
        console.log("[Solana x402] Source ATA:", sourceAta.toBase58());
        destinationAta = await splToken.getAssociatedTokenAddress(mintPubkey, destination, true, programId);
        console.log("[Solana x402] Destination ATA:", destinationAta.toBase58());
      } catch (error2) {
        const errorMsg = error2?.message || error2?.toString?.() || JSON.stringify(error2);
        console.error("[Solana x402] getAssociatedTokenAddress failed:", {
          error: error2,
          errorType: typeof error2,
          errorMessage: errorMsg,
          mintPubkey: mintPubkey.toBase58(),
          userPubkey: userPubkey.toBase58(),
          destination: destination.toBase58(),
          programId: programId.toBase58()
        });
        throw new Error(`Failed to derive token accounts: ${errorMsg}`);
      }
      try {
        const sourceAtaInfo = await connection.getAccountInfo(sourceAta, "confirmed");
        if (!sourceAtaInfo) {
          throw new Error(`You don't have a ${useToken.symbol} token account. Please fund your Solana wallet with ${useToken.symbol} first.`);
        }
        console.log("[Solana x402] Source ATA exists, balance check passed");
      } catch (error2) {
        if (error2.message.includes("don't have")) throw error2;
        throw new Error(`Failed to check source token account: ${error2.message}`);
      }
      const instructions = [];
      instructions.push(
        web3_js.ComputeBudgetProgram.setComputeUnitLimit({
          units: 4e4
        })
      );
      instructions.push(
        web3_js.ComputeBudgetProgram.setComputeUnitPrice({
          microLamports: 1
        })
      );
      console.log("[Solana x402] Added ComputeBudget instructions");
      let destAtaInfo;
      try {
        destAtaInfo = await connection.getAccountInfo(destinationAta, "confirmed");
        console.log("[Solana x402] Destination ATA check:", destAtaInfo ? "exists" : "does not exist");
      } catch (error2) {
        throw new Error(`Failed to check destination token account: ${error2.message}`);
      }
      if (!destAtaInfo) {
        console.log("[Solana x402] Creating ATA instruction for destination");
        const ASSOCIATED_TOKEN_PROGRAM_ID = new web3_js.PublicKey("ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL");
        try {
          const createAtaInstruction = new web3_js.TransactionInstruction({
            keys: [
              { pubkey: userPubkey, isSigner: false, isWritable: true },
              { pubkey: destinationAta, isSigner: false, isWritable: true },
              { pubkey: destination, isSigner: false, isWritable: false },
              { pubkey: mintPubkey, isSigner: false, isWritable: false },
              { pubkey: web3_js.SystemProgram.programId, isSigner: false, isWritable: false },
              { pubkey: programId, isSigner: false, isWritable: false }
            ],
            programId: ASSOCIATED_TOKEN_PROGRAM_ID,
            data: Buffer.from([0])
          });
          instructions.push(createAtaInstruction);
          console.log("[Solana x402] CreateATA instruction added");
        } catch (error2) {
          throw new Error(`Failed to create ATA instruction: ${error2.message}`);
        }
      }
      try {
        const transferIx = splToken.createTransferCheckedInstruction(
          sourceAta,
          mintPubkey,
          destinationAta,
          userPubkey,
          BigInt(amountBigInt.toString()),
          mint.decimals,
          [],
          programId
        );
        instructions.push(transferIx);
        console.log("[Solana x402] Transfer instruction added:", {
          from: sourceAta.toBase58(),
          to: destinationAta.toBase58(),
          amount: amountBigInt.toString(),
          decimals: mint.decimals
        });
      } catch (error2) {
        throw new Error(`Failed to create transfer instruction: ${error2.message}`);
      }
      const priority = params.priority || "balanced";
      let topFacilitatorName;
      try {
        topFacilitatorName = await getRankedFacilitators({
          apiUrl: globalConfig.apiUrl,
          apiKey: globalConfig.apiKey || "",
          network: "solana",
          priority
        });
        console.log("[Solana x402] Top ranked facilitator:", topFacilitatorName);
      } catch (error2) {
        throw new Error(`Facilitator selection failed: ${error2.message}`);
      }
      const { getSolanaFeePayer: getSolanaFeePayer2 } = await Promise.resolve().then(() => (init_solana(), solana_exports));
      const feePayerAddress = getSolanaFeePayer2(topFacilitatorName);
      const feePayer = new web3_js.PublicKey(feePayerAddress);
      console.log("[Solana x402] Using fee payer:", feePayerAddress);
      let transaction;
      try {
        const message = new web3_js.TransactionMessage({
          payerKey: feePayer,
          recentBlockhash: blockhash,
          instructions
        }).compileToV0Message();
        transaction = new web3_js.VersionedTransaction(message);
        console.log("[Solana x402] Transaction created with", instructions.length, "instructions");
      } catch (error2) {
        throw new Error(`Failed to build transaction: ${error2.message}`);
      }
      let signedTransaction;
      try {
        console.log("[Solana x402] Requesting wallet signature...");
        if (isPrivyUser && user?.wallet?.chainType === "solana") {
          signedTransaction = await user.wallet.signTransaction(transaction);
          console.log("[Solana x402] Signed with Privy Solana wallet");
        } else if (solanaWallet.signTransaction) {
          signedTransaction = await solanaWallet.signTransaction(transaction);
          console.log("[Solana x402] Signed with external Solana wallet");
        } else {
          throw new Error("Solana wallet does not support transaction signing");
        }
      } catch (error2) {
        const errorMsg = error2.message || error2.toString?.() || "Unknown signing error";
        throw new Error(`Wallet signing failed: ${errorMsg}`);
      }
      finalConfig.callbacks.onSigningComplete?.();
      let serializedTransaction;
      try {
        serializedTransaction = Buffer.from(signedTransaction.serialize()).toString("base64");
        console.log("[Solana x402] Transaction serialized, length:", serializedTransaction.length);
      } catch (error2) {
        throw new Error(`Failed to serialize transaction: ${error2.message}`);
      }
      const payloadData = {
        transaction: serializedTransaction
      };
      if (isCrossChain) {
        payloadData.destinationNetwork = destinationNetwork;
        payloadData.destinationAddress = actualRecipient;
        console.log("[Solana x402] Cross-chain metadata added:", {
          destinationNetwork,
          destinationAddress: actualRecipient
        });
      }
      const x402Header = btoa(JSON.stringify({
        x402Version: 1,
        scheme: "exact",
        network: params.sourceNetwork || "solana",
        payload: payloadData
      }));
      console.log("[Solana x402] x402 header created successfully");
      return { x402Header };
    } catch (error2) {
      console.error("[Solana x402] ERROR:", error2);
      console.error("[Solana x402] Error details:", {
        message: error2.message,
        stack: error2.stack?.split("\n").slice(0, 3).join("\n"),
        name: error2.name,
        code: error2.code
      });
      throw new Error(`Solana payment failed: ${error2.message || error2.toString?.() || "Unknown error"}`);
    }
  }, [address, isConnected, isPrivyUser, user, solanaWallet, connection, finalConfig, globalConfig]);
  const verify = react.useCallback(async (params) => {
    if (!finalConfig.apiKey) {
      const error2 = new Error("Onchain API key not provided");
      params.onError?.(error2);
      setError(error2);
      return { success: false, error: error2.message };
    }
    setIsVerifying(true);
    setError(void 0);
    try {
      finalConfig.callbacks.onVerificationStart?.();
      const sourceNetwork = params.sourceNetwork || params.network || finalConfig.network || "solana";
      const destinationNetwork = params.destinationNetwork || params.network || finalConfig.network || "solana";
      const priority = params.priority || DEFAULT_PRIORITY;
      const isCrossChain = sourceNetwork !== destinationNetwork;
      const isSameChain = !isCrossChain;
      let recipientAddress = params.to;
      let bridgeOrderId;
      const amountValue = parseFloat(params.amount);
      const feePercent = isCrossChain ? feeConfig.crosschain.feePercent : feeConfig.samechain.currentFee;
      let processingFee = amountValue * feePercent / 100;
      if (isCrossChain) {
        const minFee = destinationNetwork.toLowerCase().includes("solana") ? feeConfig.crosschain.minimumFeeSolana : feeConfig.crosschain.minimumFeeBase;
        processingFee = Math.max(processingFee, minFee);
      }
      const expectedFees = {
        processingFee: processingFee.toFixed(6),
        totalFees: processingFee.toFixed(6)
      };
      console.log("[Verify] Calculated fees using API config:", expectedFees);
      if (isCrossChain) {
        const bridgeData = await prepareBridge({
          apiUrl: finalConfig.apiUrl,
          apiKey: finalConfig.apiKey,
          sourceNetwork,
          destinationNetwork,
          amount: params.amount,
          recipientAddress: params.to
        });
        recipientAddress = bridgeData.depositAddress;
        bridgeOrderId = bridgeData.orderId;
        console.log("\u{1F309} Cross-chain payment detected:", {
          originalRecipient: params.to,
          adapterAddress: recipientAddress,
          bridgeOrderId,
          sourceNetwork,
          destinationNetwork
        });
      }
      let originalRecipient;
      if (isSameChain) {
        const { SUPPORTED_CHAINS: SUPPORTED_CHAINS2 } = await Promise.resolve().then(() => (init_chains(), chains_exports));
        const solanaChain = sourceNetwork?.includes("devnet") ? SUPPORTED_CHAINS2.solanaDevnet : SUPPORTED_CHAINS2.solana;
        const intermediateWallet = solanaChain.samechainIntermediateWallet;
        if (intermediateWallet) {
          originalRecipient = recipientAddress;
          recipientAddress = intermediateWallet;
          console.log("\u{1F4B0} Same-chain two-hop payment:", {
            originalRecipient,
            intermediateWallet: recipientAddress,
            network: sourceNetwork
          });
        } else {
          console.warn("\u26A0\uFE0F No intermediate wallet configured for Solana - payment will fail");
        }
      }
      console.log("[Verify] Calling signSolanaPayment with:", {
        to: recipientAddress,
        amount: params.amount,
        sourceNetwork,
        destinationNetwork
      });
      let x402Header;
      try {
        const result = await signSolanaPayment({ ...params, to: recipientAddress, sourceNetwork, destinationNetwork });
        x402Header = result.x402Header;
        console.log("[Verify] Solana signing successful, header length:", x402Header.length);
      } catch (error2) {
        console.error("[Verify] Solana signing failed:", error2);
        throw error2;
      }
      const verifyResponse = await verifyPayment({
        apiUrl: finalConfig.apiUrl,
        apiKey: finalConfig.apiKey,
        paymentHeader: x402Header,
        sourceNetwork,
        destinationNetwork,
        expectedAmount: params.amount,
        expectedToken: params.token?.symbol || finalConfig.token.symbol,
        recipientAddress,
        // For crosschain: adapter address, for samechain: intermediate wallet
        finalRecipient: originalRecipient,
        // For samechain two-hop: original recipient
        priority,
        bridgeOrderId,
        expectedFees,
        needsATACreation: false
        // Backend will handle ATA detection
      });
      const paymentId = verifyResponse.data?.paymentId;
      if (!paymentId) {
        console.error("[Verify] \u274C No paymentId returned from API:", verifyResponse);
        throw new Error("Payment verification succeeded but no payment ID was returned. This is a server error.");
      }
      console.log("[Verify] \u2705 Payment verified with ID:", paymentId);
      setPaymentState({ x402Header, sourceNetwork, destinationNetwork, priority, paymentId });
      finalConfig.callbacks.onVerificationComplete?.();
      return { success: true, verified: true, x402Header, sourceNetwork, destinationNetwork, priority, paymentId };
    } catch (error2) {
      const err = error2 instanceof Error ? error2 : new Error("Unknown error");
      params.onError?.(err);
      setError(err);
      return { success: false, error: err.message };
    } finally {
      setIsVerifying(false);
    }
  }, [finalConfig, signSolanaPayment]);
  const settleInternal = react.useCallback(async (paymentId, x402Header, sourceNetwork, destinationNetwork, priority, params) => {
    if (!finalConfig.apiKey) {
      const error2 = new Error("Onchain API key not provided");
      setError(error2);
      return { success: false, error: error2.message };
    }
    setIsSettling(true);
    setError(void 0);
    try {
      finalConfig.callbacks.onSettlementStart?.();
      const data = await settlePayment({
        apiUrl: finalConfig.apiUrl,
        apiKey: finalConfig.apiKey,
        paymentId,
        // REQUIRED: Payment ID from verify
        paymentHeader: x402Header,
        sourceNetwork,
        destinationNetwork,
        priority
      });
      const txHash = data.data.txHash || "";
      setLastTxHash(txHash);
      finalConfig.callbacks.onSettlementComplete?.();
      params?.onSuccess?.(txHash);
      return { success: true, txHash, settled: true };
    } catch (error2) {
      const err = error2 instanceof Error ? error2 : new Error("Unknown error");
      params?.onError?.(err);
      setError(err);
      return { success: false, error: err.message };
    } finally {
      setIsSettling(false);
    }
  }, [finalConfig]);
  const settle = react.useCallback(async (params) => {
    if (!finalConfig.apiKey) {
      const error2 = new Error("Onchain API key not provided");
      setError(error2);
      return { success: false, error: error2.message };
    }
    if (!paymentState.x402Header) {
      const error2 = new Error("No payment to settle. Call verify() first.");
      setError(error2);
      return { success: false, error: error2.message };
    }
    if (!paymentState.paymentId) {
      const error2 = new Error("No payment ID available. Verify did not return a payment ID.");
      setError(error2);
      return { success: false, error: error2.message };
    }
    return settleInternal(
      paymentState.paymentId,
      paymentState.x402Header,
      paymentState.sourceNetwork,
      paymentState.destinationNetwork,
      paymentState.priority,
      params
    );
  }, [finalConfig, paymentState, settleInternal]);
  const pay = react.useCallback(async (params) => {
    setIsPaying(true);
    setError(void 0);
    try {
      const verifyResult = await verify(params);
      if (!verifyResult.success) {
        return verifyResult;
      }
      if (finalConfig.autoSettle) {
        if (!verifyResult.paymentId) {
          const error2 = new Error("Payment verification succeeded but no payment ID was returned");
          setError(error2);
          return { success: false, error: error2.message };
        }
        const settleResult = await settleInternal(
          verifyResult.paymentId,
          verifyResult.x402Header,
          verifyResult.sourceNetwork,
          verifyResult.destinationNetwork,
          verifyResult.priority,
          params
        );
        return settleResult;
      }
      return verifyResult;
    } catch (error2) {
      const err = error2 instanceof Error ? error2 : new Error("Unknown error");
      params.onError?.(err);
      setError(err);
      return { success: false, error: err.message };
    } finally {
      setIsPaying(false);
    }
  }, [verify, finalConfig.autoSettle, settleInternal]);
  return {
    pay,
    verify,
    settle,
    isPaying,
    isVerifying,
    isSettling,
    isReady: isConnected && !!finalConfig.apiKey,
    lastTxHash,
    error,
    reset
  };
}

// src/hooks/useOnchainPay.ts
function useOnchainPay(config) {
  const { chainType } = useOnchainWallet();
  const evmPay = useEvmPay(config);
  const solanaPay = useSolanaPay(config);
  return chainType === "solana" ? solanaPay : evmPay;
}
function PaymentForm({
  recipientAddress: initialRecipient = "",
  recipientLabel = "Recipient Address",
  recipientPlaceholder = "0x...",
  allowRecipientEdit = true,
  defaultAmount = "",
  amountLabel = "Amount",
  amountPlaceholder = "0.01",
  minAmount = "0.01",
  maxAmount,
  token,
  showTokenSelector: _showTokenSelector = false,
  network,
  showNetworkSelector: _showNetworkSelector = false,
  priority = "balanced",
  showPrioritySelector = false,
  onSuccess,
  onError,
  onSubmit,
  className = "",
  buttonText = "Send Payment",
  theme = "default"
}) {
  const { isConnected } = useOnchainWallet();
  const { pay, isPaying } = useOnchainPay({ network, token });
  const [recipient, setRecipient] = react.useState(initialRecipient);
  const [amount, setAmount] = react.useState(defaultAmount);
  const [selectedPriority, setSelectedPriority] = react.useState(priority);
  const [success, setSuccess] = react.useState(false);
  const [error, setError] = react.useState("");
  const [txHash, setTxHash] = react.useState("");
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isConnected) {
      setError("Please connect your wallet first");
      return;
    }
    const amountValue = parseFloat(amount);
    const minAmountValue = parseFloat(minAmount);
    if (isNaN(amountValue) || amountValue < minAmountValue) {
      setError(`Minimum payment amount is ${minAmount} ${token?.symbol || "USDC"}`);
      return;
    }
    if (maxAmount) {
      const maxAmountValue = parseFloat(maxAmount);
      if (amountValue > maxAmountValue) {
        setError(`Maximum payment amount is ${maxAmount} ${token?.symbol || "USDC"}`);
        return;
      }
    }
    setSuccess(false);
    setError("");
    setTxHash("");
    const params = {
      to: recipient,
      amount,
      network,
      token,
      priority: selectedPriority,
      onSuccess: (hash) => {
        setSuccess(true);
        setTxHash(hash);
        onSuccess?.({ txHash: hash });
      },
      onError: (err) => {
        setError(err.message);
        onError?.(err);
      }
    };
    onSubmit?.(params);
    await pay(params);
  };
  const baseInputClass = theme === "minimal" ? "w-full bg-transparent border-b border-gray-300 px-2 py-2 text-gray-900 focus:outline-none focus:border-purple-500 transition-colors" : "w-full bg-black/40 border border-purple-500/30 rounded-lg px-4 py-3 text-purple-100 placeholder-purple-400/50 focus:outline-none focus:border-purple-400 transition-colors";
  const buttonClass = theme === "minimal" ? "w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded transition-all duration-200 flex items-center justify-center gap-2 disabled:cursor-not-allowed" : "w-full bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 disabled:from-purple-900/50 disabled:to-purple-800/50 text-white font-semibold py-4 px-6 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 disabled:cursor-not-allowed";
  return /* @__PURE__ */ jsxRuntime.jsxs("div", { className, children: [
    /* @__PURE__ */ jsxRuntime.jsxs("form", { onSubmit: handleSubmit, className: "space-y-6", children: [
      /* @__PURE__ */ jsxRuntime.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntime.jsx("label", { htmlFor: "recipient", className: "block text-sm font-medium text-purple-300 mb-2", children: recipientLabel }),
        /* @__PURE__ */ jsxRuntime.jsx(
          "input",
          {
            type: "text",
            id: "recipient",
            value: recipient,
            onChange: (e) => setRecipient(e.target.value),
            placeholder: recipientPlaceholder,
            className: baseInputClass,
            required: true,
            disabled: isPaying || !allowRecipientEdit
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntime.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntime.jsxs("label", { htmlFor: "amount", className: "block text-sm font-medium text-purple-300 mb-2", children: [
          amountLabel,
          " ",
          token ? `(${token.symbol})` : ""
        ] }),
        /* @__PURE__ */ jsxRuntime.jsx(
          "input",
          {
            type: "number",
            id: "amount",
            value: amount,
            onChange: (e) => setAmount(e.target.value),
            placeholder: amountPlaceholder,
            step: "0.01",
            min: minAmount,
            max: maxAmount,
            className: baseInputClass,
            required: true,
            disabled: isPaying
          }
        )
      ] }),
      showPrioritySelector && /* @__PURE__ */ jsxRuntime.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntime.jsx("label", { htmlFor: "priority", className: "block text-sm font-medium text-purple-300 mb-2", children: "Priority" }),
        /* @__PURE__ */ jsxRuntime.jsxs(
          "select",
          {
            id: "priority",
            value: selectedPriority,
            onChange: (e) => setSelectedPriority(e.target.value),
            className: baseInputClass,
            disabled: isPaying,
            children: [
              /* @__PURE__ */ jsxRuntime.jsx("option", { value: "balanced", children: "Balanced" }),
              /* @__PURE__ */ jsxRuntime.jsx("option", { value: "speed", children: "Speed" }),
              /* @__PURE__ */ jsxRuntime.jsx("option", { value: "cost", children: "Cost" }),
              /* @__PURE__ */ jsxRuntime.jsx("option", { value: "reliability", children: "Reliability" })
            ]
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntime.jsx(
        "button",
        {
          type: "submit",
          disabled: !isConnected || isPaying,
          className: buttonClass,
          children: isPaying ? /* @__PURE__ */ jsxRuntime.jsxs(jsxRuntime.Fragment, { children: [
            /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Loader2, { className: "animate-spin", size: 20 }),
            "Processing..."
          ] }) : /* @__PURE__ */ jsxRuntime.jsxs(jsxRuntime.Fragment, { children: [
            /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Send, { size: 20 }),
            buttonText
          ] })
        }
      )
    ] }),
    success && /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "mt-6 bg-green-900/20 border border-green-500/30 rounded-lg p-4", children: [
      /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex items-center gap-3 mb-2", children: [
        /* @__PURE__ */ jsxRuntime.jsx(lucideReact.CheckCircle, { className: "text-green-400 flex-shrink-0", size: 24 }),
        /* @__PURE__ */ jsxRuntime.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntime.jsx("p", { className: "text-green-200 font-semibold text-sm", children: "Payment Successful!" }),
          /* @__PURE__ */ jsxRuntime.jsx("p", { className: "text-green-200/80 text-xs mt-1", children: "Verified and settled through the x402 network." })
        ] })
      ] }),
      txHash && /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "mt-3 pt-3 border-t border-green-500/20", children: [
        /* @__PURE__ */ jsxRuntime.jsx("p", { className: "text-green-200/60 text-xs mb-1", children: "Transaction Hash:" }),
        /* @__PURE__ */ jsxRuntime.jsx(
          "a",
          {
            href: `https://basescan.org/tx/${txHash}`,
            target: "_blank",
            rel: "noopener noreferrer",
            className: "text-green-300 hover:text-green-200 text-xs font-mono break-all underline",
            children: txHash
          }
        )
      ] })
    ] }),
    error && /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "mt-6 bg-red-900/20 border border-red-500/30 rounded-lg p-4 flex items-center gap-3", children: [
      /* @__PURE__ */ jsxRuntime.jsx(lucideReact.AlertCircle, { className: "text-red-400 flex-shrink-0", size: 24 }),
      /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex-1 min-w-0", children: [
        /* @__PURE__ */ jsxRuntime.jsx("p", { className: "text-red-200 font-semibold text-sm", children: "Payment Failed" }),
        /* @__PURE__ */ jsxRuntime.jsx("p", { className: "text-red-200/80 text-xs mt-1 break-words", children: error })
      ] })
    ] }),
    !isConnected && /* @__PURE__ */ jsxRuntime.jsx("div", { className: "mt-6 bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4", children: /* @__PURE__ */ jsxRuntime.jsx("p", { className: "text-yellow-200/90 text-xs text-center", children: "\u26A0\uFE0F Please connect your wallet to send payments" }) })
  ] });
}
function PaymentButton({
  to,
  amount,
  token,
  network,
  priority = "balanced",
  children,
  className,
  onSuccess,
  onError,
  disabled = false,
  showSuccess = true
}) {
  const { isConnected } = useOnchainWallet();
  const { pay, isPaying } = useOnchainPay({ network, token });
  const [success, setSuccess] = react.useState(false);
  const handleClick = async () => {
    setSuccess(false);
    await pay({
      to,
      amount,
      token,
      network,
      priority,
      onSuccess: (txHash) => {
        if (showSuccess) {
          setSuccess(true);
          setTimeout(() => setSuccess(false), 3e3);
        }
        onSuccess?.(txHash);
      },
      onError: (error) => {
        onError?.(error);
      }
    });
  };
  const defaultClass = "bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 disabled:from-purple-900/50 disabled:to-purple-800/50 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 disabled:cursor-not-allowed";
  return /* @__PURE__ */ jsxRuntime.jsx(
    "button",
    {
      onClick: handleClick,
      disabled: !isConnected || isPaying || disabled || success,
      className: className || defaultClass,
      children: isPaying ? /* @__PURE__ */ jsxRuntime.jsxs(jsxRuntime.Fragment, { children: [
        /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Loader2, { className: "animate-spin", size: 18 }),
        "Processing..."
      ] }) : success ? /* @__PURE__ */ jsxRuntime.jsxs(jsxRuntime.Fragment, { children: [
        /* @__PURE__ */ jsxRuntime.jsx(lucideReact.CheckCircle, { size: 18 }),
        "Success!"
      ] }) : children || `Pay ${amount} ${token?.symbol || "USDC"}`
    }
  );
}
function useBalance(config) {
  const { address: walletAddress } = useOnchainWallet();
  const globalConfig = useOnchainConfig();
  const token = config?.token || globalConfig.defaultToken;
  const address = config?.address || walletAddress;
  const { data, isLoading, isError, refetch } = wagmi.useBalance({
    address,
    token: token.address
  });
  const value = data?.value ?? 0n;
  const formatted = data ? formatTokenAmount(data.value, token.decimals) : "0";
  return {
    value,
    formatted,
    symbol: token.symbol,
    decimals: token.decimals,
    isLoading,
    isError,
    refetch
  };
}
function BalanceDisplay({
  token,
  address,
  format = "full",
  showRefresh = false,
  className = "",
  label,
  watch = true
}) {
  const { formatted, symbol, isLoading, refetch } = useBalance({
    token,
    address});
  if (isLoading && !formatted) {
    return /* @__PURE__ */ jsxRuntime.jsxs("div", { className: className || "flex items-center gap-2 text-purple-300", children: [
      /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Loader2, { className: "animate-spin", size: 16 }),
      /* @__PURE__ */ jsxRuntime.jsx("span", { className: "text-sm", children: "Loading..." })
    ] });
  }
  const getDisplayText = () => {
    switch (format) {
      case "compact":
        return `${formatted} ${symbol}`;
      case "symbol-only":
        return formatted;
      case "full":
      default:
        return label ? `${label}: ${formatted} ${symbol}` : `${formatted} ${symbol}`;
    }
  };
  return /* @__PURE__ */ jsxRuntime.jsxs("div", { className: className || "flex items-center gap-2", children: [
    /* @__PURE__ */ jsxRuntime.jsx("span", { className: "text-purple-100 font-medium", children: getDisplayText() }),
    showRefresh && /* @__PURE__ */ jsxRuntime.jsx(
      "button",
      {
        onClick: () => refetch(),
        className: "text-purple-400 hover:text-purple-300 transition-colors",
        title: "Refresh balance",
        children: /* @__PURE__ */ jsxRuntime.jsx(lucideReact.RefreshCw, { size: 14 })
      }
    )
  ] });
}
function usePaymentHistory(config) {
  const globalConfig = useOnchainConfig();
  const { address: walletAddress } = useOnchainWallet();
  const [payments, setPayments] = react.useState([]);
  const [isLoading, setIsLoading] = react.useState(false);
  const [isError, setIsError] = react.useState(false);
  const [error, setError] = react.useState();
  const [hasMore, setHasMore] = react.useState(false);
  const [offset, setOffset] = react.useState(0);
  const limit = config?.limit ?? 10;
  const address = config?.address || walletAddress;
  const autoRefresh = config?.autoRefresh ?? false;
  const refreshInterval = config?.refreshInterval ?? 3e4;
  const fetchPayments = react.useCallback(async (reset = false) => {
    if (!globalConfig.apiKey || !address) {
      return;
    }
    setIsLoading(true);
    setIsError(false);
    setError(void 0);
    try {
      const currentOffset = reset ? 0 : offset;
      const response = await fetch(
        `${globalConfig.apiUrl}/v1/payments?address=${address}&limit=${limit}&offset=${currentOffset}`,
        {
          headers: {
            "X-API-Key": globalConfig.apiKey
          }
        }
      );
      if (!response.ok) {
        throw new Error("Failed to fetch payment history");
      }
      const data = await response.json();
      if (reset) {
        setPayments(data.data.payments || []);
        setOffset(limit);
      } else {
        setPayments((prev) => [...prev, ...data.data.payments || []]);
        setOffset((prev) => prev + limit);
      }
      setHasMore(data.data.hasMore ?? false);
    } catch (err) {
      setIsError(true);
      setError(err instanceof Error ? err : new Error("Unknown error"));
    } finally {
      setIsLoading(false);
    }
  }, [globalConfig, address, limit, offset]);
  const refetch = react.useCallback(async () => {
    await fetchPayments(true);
  }, [fetchPayments]);
  const loadMore = react.useCallback(async () => {
    if (!isLoading && hasMore) {
      await fetchPayments(false);
    }
  }, [isLoading, hasMore, fetchPayments]);
  react.useEffect(() => {
    if (address && globalConfig.apiKey) {
      fetchPayments(true);
    }
  }, [address, globalConfig.apiKey]);
  react.useEffect(() => {
    if (!autoRefresh || !address || !globalConfig.apiKey) {
      return;
    }
    const interval = setInterval(() => {
      refetch();
    }, refreshInterval);
    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, address, globalConfig.apiKey, refetch]);
  return {
    payments,
    isLoading,
    isError,
    error,
    refetch,
    hasMore,
    loadMore
  };
}
function TransactionHistory({
  limit = 10,
  address,
  autoRefresh = false,
  refreshInterval = 3e4,
  className = "",
  showLoadMore = true,
  explorerUrl = "https://basescan.org"
}) {
  const { payments, isLoading, hasMore, loadMore } = usePaymentHistory({
    limit,
    address,
    autoRefresh,
    refreshInterval
  });
  if (isLoading && payments.length === 0) {
    return /* @__PURE__ */ jsxRuntime.jsx("div", { className: className || "flex items-center justify-center py-12", children: /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Loader2, { className: "animate-spin text-purple-400", size: 32 }) });
  }
  if (payments.length === 0) {
    return /* @__PURE__ */ jsxRuntime.jsx("div", { className: className || "text-center py-12", children: /* @__PURE__ */ jsxRuntime.jsx("p", { className: "text-purple-300/60", children: "No transactions yet" }) });
  }
  const getStatusIcon = (status) => {
    switch (status) {
      case "success":
        return /* @__PURE__ */ jsxRuntime.jsx(lucideReact.CheckCircle, { className: "text-green-400", size: 18 });
      case "failed":
        return /* @__PURE__ */ jsxRuntime.jsx(lucideReact.XCircle, { className: "text-red-400", size: 18 });
      case "pending":
      default:
        return /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Clock, { className: "text-yellow-400", size: 18 });
    }
  };
  const getStatusColor = (status) => {
    switch (status) {
      case "success":
        return "text-green-400";
      case "failed":
        return "text-red-400";
      case "pending":
      default:
        return "text-yellow-400";
    }
  };
  return /* @__PURE__ */ jsxRuntime.jsxs("div", { className, children: [
    /* @__PURE__ */ jsxRuntime.jsx("div", { className: "space-y-3", children: payments.map((payment) => /* @__PURE__ */ jsxRuntime.jsxs(
      "div",
      {
        className: "bg-black/40 border border-purple-500/30 rounded-lg p-4 hover:border-purple-400/50 transition-colors",
        children: [
          /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex items-start justify-between mb-2", children: [
            /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex items-center gap-2", children: [
              getStatusIcon(payment.status),
              /* @__PURE__ */ jsxRuntime.jsx("span", { className: `text-sm font-medium ${getStatusColor(payment.status)}`, children: payment.status.charAt(0).toUpperCase() + payment.status.slice(1) })
            ] }),
            /* @__PURE__ */ jsxRuntime.jsx("span", { className: "text-xs text-purple-300/60", children: new Date(payment.createdAt).toLocaleDateString() })
          ] }),
          /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex items-center justify-between", children: [
              /* @__PURE__ */ jsxRuntime.jsx("span", { className: "text-sm text-purple-300", children: "Amount:" }),
              /* @__PURE__ */ jsxRuntime.jsxs("span", { className: "text-sm font-mono text-purple-100", children: [
                payment.amount,
                " ",
                payment.token
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex items-center justify-between", children: [
              /* @__PURE__ */ jsxRuntime.jsx("span", { className: "text-sm text-purple-300", children: "To:" }),
              /* @__PURE__ */ jsxRuntime.jsxs("span", { className: "text-xs font-mono text-purple-100", children: [
                payment.to.slice(0, 6),
                "...",
                payment.to.slice(-4)
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex items-center justify-between", children: [
              /* @__PURE__ */ jsxRuntime.jsx("span", { className: "text-sm text-purple-300", children: "Network:" }),
              /* @__PURE__ */ jsxRuntime.jsx("span", { className: "text-xs text-purple-100 capitalize", children: payment.network })
            ] }),
            payment.facilitator && /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex items-center justify-between", children: [
              /* @__PURE__ */ jsxRuntime.jsx("span", { className: "text-sm text-purple-300", children: "Facilitator:" }),
              /* @__PURE__ */ jsxRuntime.jsx("span", { className: "text-xs text-purple-100", children: payment.facilitator })
            ] }),
            payment.txHash && /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex items-center justify-between mt-2 pt-2 border-t border-purple-500/20", children: [
              /* @__PURE__ */ jsxRuntime.jsx("span", { className: "text-xs text-purple-300", children: "Transaction:" }),
              /* @__PURE__ */ jsxRuntime.jsxs(
                "a",
                {
                  href: `${explorerUrl}/tx/${payment.txHash}`,
                  target: "_blank",
                  rel: "noopener noreferrer",
                  className: "text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1",
                  children: [
                    "View ",
                    /* @__PURE__ */ jsxRuntime.jsx(lucideReact.ExternalLink, { size: 12 })
                  ]
                }
              )
            ] })
          ] })
        ]
      },
      payment.id
    )) }),
    showLoadMore && hasMore && /* @__PURE__ */ jsxRuntime.jsx(
      "button",
      {
        onClick: loadMore,
        disabled: isLoading,
        className: "w-full mt-4 bg-purple-900/30 hover:bg-purple-900/50 border border-purple-500/30 hover:border-purple-400/50 rounded-lg py-3 text-purple-300 font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed",
        children: isLoading ? /* @__PURE__ */ jsxRuntime.jsxs("span", { className: "flex items-center justify-center gap-2", children: [
          /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Loader2, { className: "animate-spin", size: 16 }),
          "Loading..."
        ] }) : "Load More"
      }
    )
  ] });
}

// src/config/chainNames.ts
var CHAIN_ID_TO_NAME = {
  0: "Kardia",
  1: "Ethereum",
  8: "Ubiq",
  10: "Optimism",
  14: "Flare",
  19: "Songbird",
  20: "Elastos",
  24: "Kardia",
  25: "Cronos",
  30: "RSK",
  40: "Telos",
  42: "Lukso",
  44: "Crab",
  46: "Darwinia",
  50: "XDC",
  52: "CSC",
  55: "ZYX",
  56: "BNB Chain",
  57: "Syscoin",
  58: "Ontology EVM",
  60: "GoChain",
  61: "Ethereum Classic",
  66: "OKX Chain",
  70: "Hoo",
  82: "Meter",
  87: "Nova Network",
  88: "TomoChain",
  96: "Bitkub",
  100: "Gnosis",
  106: "Velas",
  108: "ThunderCore",
  119: "ENULS",
  122: "Fuse",
  128: "HECO",
  130: "Unichain",
  137: "Polygon",
  140: "Eteria",
  146: "Sonic",
  148: "Shimmer EVM",
  151: "RBN",
  166: "Nomina",
  169: "Manta",
  173: "ENI",
  177: "HSK",
  181: "Water",
  185: "Mint",
  196: "X Layer",
  199: "BitTorrent",
  200: "xDai Arb",
  204: "opBNB",
  207: "Vinu Chain",
  225: "LaChain",
  228: "Mind Network",
  232: "Lens",
  239: "TAC",
  246: "Energy Web",
  248: "Oasys",
  250: "Fantom",
  252: "Fraxtal",
  254: "Swan",
  255: "Kroma",
  269: "HPB",
  274: "LaChain Network",
  277: "Prom",
  288: "Boba",
  291: "Orderly",
  295: "Hedera",
  311: "OMAX",
  314: "Filecoin",
  321: "KuCoin",
  324: "zkSync Era",
  336: "Shiden",
  360: "Shape",
  361: "Theta",
  369: "Pulse",
  388: "Cronos zkEVM",
  416: "SX",
  463: "Areum",
  478: "Form Network",
  480: "WC",
  510: "Syndicate",
  529: "Firechain",
  534: "Candle",
  570: "Rollux",
  576: "Mawari",
  592: "Astar",
  648: "Endurance",
  690: "Redstone",
  698: "Matchain",
  747: "Flow",
  820: "Callisto",
  841: "Tara",
  888: "Wanchain",
  957: "Lyra",
  996: "Bifrost",
  999: "Hyperliquid",
  1024: "CLV",
  1030: "Conflux",
  1088: "Metis",
  1100: "Dymension",
  1101: "Polygon zkEVM",
  1116: "Core",
  1124: "ECM",
  1130: "DeFiChain EVM",
  1135: "Lisk",
  1231: "Ultron",
  1234: "Step",
  1284: "Moonbeam",
  1285: "Moonriver",
  1329: "Sei",
  1424: "Perennial",
  1514: "STY",
  1559: "Tenet",
  1625: "Gravity",
  1729: "Reya Network",
  1818: "Cube",
  1868: "Soneium",
  1890: "Lightlink",
  1907: "Bitci Chain",
  1923: "Swell Chain",
  1975: "ONUS",
  1992: "Hubblenet",
  1996: "Sanko",
  2e3: "Dogechain",
  2001: "Milkomeda",
  2002: "Milkomeda A1",
  2020: "Ronin",
  2152: "Findora",
  2222: "Kava",
  2332: "Soma",
  2345: "GOAT",
  2355: "Silicon zkEVM",
  2410: "Karak",
  2525: "inEVM",
  2649: "AILayer",
  2741: "Abstract",
  2818: "Morph",
  3073: "Move",
  3338: "Peaq",
  3637: "Botanix",
  3721: "Xone Chain",
  3776: "Astar zkEVM",
  4158: "CrossFi",
  4337: "Beam",
  4442: "Denergy Testnet",
  4488: "Hydra Chain",
  4689: "IoTeX",
  5e3: "Mantle",
  5031: "Somnia",
  5050: "Skate",
  5112: "Ham",
  5330: "Superseed",
  5432: "Yeying",
  5464: "Saga",
  5551: "Nahmii",
  6001: "BounceBit",
  6699: "OX",
  6880: "MTT Network",
  6900: "Nibiru",
  6969: "Tombchain",
  7e3: "ZetaChain",
  7070: "Planq",
  7171: "Bitrock",
  7200: "XSAT",
  7332: "Horizen EON",
  7560: "Cyeth",
  7700: "Canto",
  7887: "Kinto",
  8008: "Polynomial",
  8217: "Klaytn",
  8428: "THAT",
  8453: "Base",
  8668: "Hela",
  8811: "Haven1",
  8822: "IOTA EVM",
  8899: "JBC",
  9001: "Evmos",
  9745: "Plasma",
  9790: "Carbon",
  1e4: "SmartBCH",
  10088: "Gatelayer",
  10507: "Numbers",
  11820: "Artela",
  13371: "Immutable zkEVM",
  15551: "Loop",
  16116: "DeFiVerse",
  16507: "Genesys",
  16718: "AirDAO",
  17777: "EOS EVM",
  18686: "Moonchain",
  18888: "Titan",
  20402: "Muuchain",
  22776: "MAP Protocol",
  23294: "Sapphire",
  31612: "Mezo",
  32380: "Paix",
  32520: "Bitgert",
  32659: "Fusion",
  32769: "Zilliqa",
  33139: "ApeChain",
  34443: "Mode",
  35441: "Q Protocol",
  39797: "Energi",
  41455: "Aleph Zero EVM",
  41923: "Edu Chain",
  42161: "Arbitrum",
  42170: "Arbitrum Nova",
  42220: "Celo",
  42262: "Oasis",
  42420: "AssetChain",
  42766: "ZKFair",
  42793: "Etherlink",
  43111: "Hemi",
  43114: "Avalanche",
  47763: "Neo X",
  47805: "REI",
  48900: "Zircuit",
  50104: "Sophon",
  52014: "ETN",
  53935: "DFK",
  55244: "Superposition",
  55555: "REI Chain",
  55930: "DataHaven",
  55931: "DataHaven Testnet",
  56288: "Boba BNB",
  57073: "Ink",
  59144: "Linea",
  60808: "BOB",
  71394: "Godwoken",
  71402: "Godwoken",
  78887: "Lung",
  80094: "Berachain",
  81457: "Blast",
  84532: "Base Sepolia",
  88888: "Chiliz",
  98865: "Plume (Deprecated)",
  98866: "Plume",
  105105: "Stratis",
  111188: "Real",
  153153: "Odyssey",
  167e3: "Taiko",
  200901: "Bitlayer",
  222222: "HydraDX",
  256256: "CMP",
  322202: "Parex",
  333999: "Polis",
  369369: "Denergy",
  420420: "Kekchain",
  432204: "Dexalot",
  510003: "Commons",
  534352: "Scroll",
  543210: "Zero Network",
  747474: "Katana",
  777777: "Winr",
  810180: "zkLink Nova",
  888888: "Vision",
  9e5: "Posichain",
  144e4: "XRPL EVM",
  7000700: "JMDT",
  7225878: "Saakuru",
  7777777: "Zora",
  9999999: "Fluence",
  20250217: "Xphere",
  21e6: "Corn",
  245022934: "Neon",
  253368190: "Flame",
  666666666: "Degen",
  888888888: "Ancient8",
  994873017: "Lumia",
  1313161554: "Aurora",
  1380012617: "Rari",
  16666e5: "Harmony",
  11297108109: "Palm",
  123420001114: "Basecamp",
  383414847825: "Zeniq",
  836542336838601: "Curio",
  2716446429837e3: "DChain"
};
function getChainName(chainId) {
  return CHAIN_ID_TO_NAME[chainId] || `Chain ${chainId}`;
}
function isKnownChain(chainId) {
  return chainId in CHAIN_ID_TO_NAME;
}

// src/hooks/useChainAlignment.ts
var NETWORK_TO_CHAIN_ID = {
  "base": 8453,
  "solana": void 0
  // Solana doesn't use EVM chain IDs
};
function useChainAlignment(sourceNetwork) {
  const { chainId, isConnected, chainType } = useOnchainWallet();
  const { switchChainAsync, isPending: isSwitchingChain } = wagmi.useSwitchChain();
  const [isSwitching, setIsSwitching] = react.useState(false);
  const [switchError, setSwitchError] = react.useState();
  const expectedChainId = NETWORK_TO_CHAIN_ID[sourceNetwork];
  const chainTypeMatches = react.useMemo(() => {
    if (sourceNetwork === "solana") {
      return chainType === "solana";
    }
    return chainType === "evm";
  }, [sourceNetwork, chainType]);
  const chainIdMatches = react.useMemo(() => {
    if (sourceNetwork === "solana") {
      return true;
    }
    return chainId === expectedChainId;
  }, [chainId, expectedChainId, sourceNetwork]);
  const isAligned = react.useMemo(() => {
    if (!isConnected) return false;
    return chainTypeMatches && chainIdMatches;
  }, [isConnected, chainTypeMatches, chainIdMatches]);
  const needsSwitch = isConnected && !isAligned;
  const walletNetworkName = react.useMemo(() => {
    if (chainType === "solana") return "Solana";
    if (chainId) return getChainName(chainId);
    return "Unknown";
  }, [chainType, chainId]);
  react.useEffect(() => {
    if (isConnected) {
      console.log("[useChainAlignment] Alignment check:", {
        sourceNetwork,
        walletChainType: chainType,
        walletChainId: chainId,
        walletNetworkName,
        expectedChainId,
        isAligned,
        needsSwitch,
        chainTypeMatches,
        chainIdMatches
      });
    }
  }, [
    isConnected,
    sourceNetwork,
    chainType,
    chainId,
    walletNetworkName,
    expectedChainId,
    isAligned,
    needsSwitch,
    chainTypeMatches,
    chainIdMatches
  ]);
  react.useEffect(() => {
    if (needsSwitch) {
      console.log("[useChainAlignment] \u26A0\uFE0F Misalignment detected:", {
        reason: !chainTypeMatches ? `Wrong wallet type: ${chainType} (expected ${sourceNetwork === "solana" ? "solana" : "evm"})` : `Wrong chain: ${chainId} (expected ${expectedChainId})`,
        action: "User needs to switch"
      });
    }
  }, [needsSwitch, chainTypeMatches, chainType, sourceNetwork, chainId, expectedChainId]);
  const promptSwitch = react.useCallback(async () => {
    if (!expectedChainId) {
      const error = new Error("Cannot switch to Solana from EVM wallet. Please use a Solana wallet.");
      setSwitchError(error);
      console.error("[useChainAlignment] Switch error:", error.message);
      return;
    }
    if (!isConnected) {
      const error = new Error("Wallet not connected");
      setSwitchError(error);
      console.error("[useChainAlignment] Switch error:", error.message);
      return;
    }
    setIsSwitching(true);
    setSwitchError(void 0);
    try {
      console.log("[useChainAlignment] \u{1F504} Requesting chain switch to:", {
        chainId: expectedChainId,
        network: sourceNetwork
      });
      await switchChainAsync({ chainId: expectedChainId });
      console.log("[useChainAlignment] \u2705 Chain switch successful:", {
        newChainId: expectedChainId,
        network: sourceNetwork
      });
    } catch (error) {
      const err = error instanceof Error ? error : new Error("Chain switch failed");
      setSwitchError(err);
      if (err.message.includes("User rejected") || err.message.includes("denied")) {
        console.log("[useChainAlignment] \u274C User rejected chain switch");
      } else {
        console.error("[useChainAlignment] \u274C Chain switch error:", err);
      }
    } finally {
      setIsSwitching(false);
    }
  }, [expectedChainId, sourceNetwork, isConnected, switchChainAsync]);
  const clearError = react.useCallback(() => {
    setSwitchError(void 0);
  }, []);
  return {
    isAligned,
    walletChainId: chainId,
    expectedChainId,
    needsSwitch,
    walletChainType: chainType,
    walletNetworkName,
    isSwitching: isSwitching || isSwitchingChain,
    switchError,
    promptSwitch,
    clearError
  };
}
function useNetworkStatus(config) {
  const globalConfig = useOnchainConfig();
  const [facilitators, setFacilitators] = react.useState([]);
  const [isLoading, setIsLoading] = react.useState(false);
  const [isError, setIsError] = react.useState(false);
  const [error, setError] = react.useState();
  const autoRefresh = config?.autoRefresh ?? true;
  const refreshInterval = config?.refreshInterval ?? 3e4;
  const network = config?.network || "base";
  const fetchStatus = react.useCallback(async () => {
    setIsLoading(true);
    setIsError(false);
    setError(void 0);
    try {
      const response = await fetch(
        `${globalConfig.apiUrl}/v1/facilitators?network=${network}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch network status");
      }
      const data = await response.json();
      setFacilitators(data.data.facilitators || []);
    } catch (err) {
      setIsError(true);
      setError(err instanceof Error ? err : new Error("Unknown error"));
      setFacilitators([]);
    } finally {
      setIsLoading(false);
    }
  }, [globalConfig.apiUrl, network]);
  const refetch = react.useCallback(async () => {
    await fetchStatus();
  }, [fetchStatus]);
  react.useEffect(() => {
    fetchStatus();
  }, [network]);
  react.useEffect(() => {
    if (!autoRefresh) {
      return;
    }
    const interval = setInterval(() => {
      fetchStatus();
    }, refreshInterval);
    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, fetchStatus]);
  const isHealthy = facilitators.length > 0 && facilitators.some((f) => f.isHealthy);
  return {
    facilitators,
    isHealthy,
    isLoading,
    isError,
    error,
    refetch
  };
}

// src/index.tsx
init_chains();

Object.defineProperty(exports, "useSolanaConnection", {
  enumerable: true,
  get: function () { return walletAdapterReact.useConnection; }
});
Object.defineProperty(exports, "useSolanaWallet", {
  enumerable: true,
  get: function () { return walletAdapterReact.useWallet; }
});
exports.BalanceDisplay = BalanceDisplay;
exports.CHAIN_ID_TO_NAME = CHAIN_ID_TO_NAME;
exports.COMMON_TOKENS = COMMON_TOKENS;
exports.DEFAULT_API_URL = DEFAULT_API_URL;
exports.DEFAULT_APPEARANCE = DEFAULT_APPEARANCE;
exports.DEFAULT_CHAIN = DEFAULT_CHAIN;
exports.DEFAULT_LOGIN_METHODS = DEFAULT_LOGIN_METHODS;
exports.DEFAULT_NETWORK = DEFAULT_NETWORK;
exports.DEFAULT_PRIORITY = DEFAULT_PRIORITY;
exports.DEFAULT_TOKEN = DEFAULT_TOKEN;
exports.OnchainConnect = OnchainConnect;
exports.PaymentButton = PaymentButton;
exports.PaymentForm = PaymentForm;
exports.TransactionHistory = TransactionHistory;
exports.WalletButton = WalletButton;
exports.formatTokenAmount = formatTokenAmount;
exports.getChainConfig = getChainConfig;
exports.getChainConfigByName = getChainConfigByName;
exports.getChainName = getChainName;
exports.getExplorerUrl = getExplorerUrl;
exports.getTokenAddress = getTokenAddress;
exports.getTokenConfig = getTokenConfig;
exports.isKnownChain = isKnownChain;
exports.isSolanaNetwork = isSolanaNetwork;
exports.parseTokenAmount = parseTokenAmount;
exports.useBalance = useBalance;
exports.useChainAlignment = useChainAlignment;
exports.useEvmPay = useEvmPay;
exports.useNetworkStatus = useNetworkStatus;
exports.useOnchainConfig = useOnchainConfig;
exports.useOnchainConfigSafe = useOnchainConfigSafe;
exports.useOnchainPay = useOnchainPay;
exports.useOnchainWallet = useOnchainWallet;
exports.usePaymentHistory = usePaymentHistory;
exports.useSolanaPay = useSolanaPay;
//# sourceMappingURL=index.js.map
//# sourceMappingURL=index.js.map