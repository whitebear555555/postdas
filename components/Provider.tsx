'use client'

import { useState, ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ChainProvider, useChains } from "@interchain-kit/react";
import ReactDOM from 'react-dom/client';

import { keplrWallet } from "@interchain-kit/keplr-extension";
import { leapWallet } from "@interchain-kit/leap-extension";
import { chains, assetLists } from "chain-registry";
import axios from 'axios';
import { CHAIN_NAME } from "./Wallet";

const filteredChains = chains.find(c => c.chainName === CHAIN_NAME);
const filteredAssets = assetLists.find(a => a.chainName === CHAIN_NAME);

export default function Providers({ children }: { children: ReactNode }) {
    const [queryClient] = useState(() => new QueryClient({
        defaultOptions: {
            queries: {
                // Опционально: отключаем повторные запросы при потере фокуса окна
                refetchOnWindowFocus: false,
            },
        },
    }))

    return (
        <QueryClientProvider client={queryClient}>
            <ChainProvider
                wallets={[keplrWallet, leapWallet]}
                chains={filteredChains ? [filteredChains] : []}
                assetLists={filteredAssets ? [filteredAssets] : []}

                signerOptions={{}}
                endpointOptions={{}}
            // Опции для WalletConnect (QR-код для мобилок)
            // walletConnectOptions={{
            //     signClient: {
            //         projectId: "a8510432ebb71e6948cfd6cde54b70f7", // Замени на свой ID с cloud.walletconnect.com (бесплатно)
            //         relayUrl: "wss://relay.walletconnect.org",
            //         metadata: {
            //             name: "My NFT Market",
            //             description: "Cool NFT Marketplace",
            //             url: "https://myapp.com",
            //             icons: [],
            //         },
            //     },
            // }}
            // // Кастомные RPC (если публичные лагают)
            // endpointOptions={{
            //     stargaze: {
            //         rpc: ["https://rpc.stargaze-apis.com/"],
            //         rest: ["https://rest.stargaze-apis.com/"]
            //     }
            // }}
            >
                {children}
            </ChainProvider >
        </QueryClientProvider>
    )
}
