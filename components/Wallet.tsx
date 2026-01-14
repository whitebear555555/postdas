"use client";

import React, { useState, useEffect } from 'react';
import { InterchainWalletModal, useChain, useChainWallet, useWalletModal } from "@interchain-kit/react";
import { Wallet as WalletIcon, ChevronDown, Loader2 } from 'lucide-react';
import { WalletState } from '@interchain-kit/core';
import { CosmWasmClient } from "@cosmjs/cosmwasm-stargate";

import "@interchain-ui/react/styles";

export const CHAIN_NAME = "juno";
export const RPC_URL = "https://juno-rpc.publicnode.com:443";
export const CORE_ADDRESS = "juno1h5ex5dn62arjwvwkh88r475dap8qppmmec4sgxzmtdn5tnmke3lqwpplgg";
export const PROPOSAL_MODULE_ADDRESS = "juno1mf3wshvp2vr7kuqrjk4le33l4seeltwara9nm3m2xt8kckg7kekset6njw";

export function Wallet() {
    const { address, status, connect } = useChain(CHAIN_NAME);
    const { modalIsOpen, open, close } = useWalletModal();
    const [votingPower, setVotingPower] = useState<string>("0");

    // Получаем voting power при подключении кошелька
    useEffect(() => {
        if (status === 'Connected' && address) {
            const fetchVotingPower = async () => {
                try {
                    //TODO: vote power
                    // const client = await CosmWasmClient.connect(RPC_URL);
                    // const daoInfo = await client.queryContractSmart(CORE_ADDRESS, {
                    //     get_item: {
                    //         key: "total_power"
                    //     }
                    // });
                    setVotingPower("0");
                } catch (error) {
                    console.log("Error fetching voting power");
                    setVotingPower("0");
                }
            };
            fetchVotingPower();
        } else {
            setVotingPower("0");
        }
    }, [address, status]);

    const truncate = (str: string) => {
        if (!str) return '';
        return str.slice(0, 6) + '...' + str.slice(-4);
    };

    const handleClick = async () => {
        if (status === WalletState.Connected && address) {
            open();
        } else {
            connect();
        }
    };

    return (
        <div className="flex items-center gap-3">
            {/* //TODO: vote power*/}
            {/* {status === WalletState.Connected && address && (
                <div className="flex items-center gap-1 bg-zinc-800 text-zinc-300 text-xs px-2 py-1 rounded border border-zinc-700">
                    <span>VP:</span>
                    <span className="font-mono font-bold text-cyan-400">{votingPower}</span>
                </div>
            )} */}

            {/* Wallet Button */}
            <button
                className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-3 py-1.5 rounded-md transition-all shadow-lg shadow-slate-900/20 h-8"
                onClick={handleClick}
            >
                {status === WalletState.Connected && address ? (
                    <>
                        <WalletIcon size={14} className="text-cyan-400" />
                        <span>{truncate(address)}</span>
                        <ChevronDown size={12} className="opacity-50" />
                    </>
                ) : status === 'Connecting' ? (
                    <>
                        <Loader2 size={14} className="animate-spin" />
                        <span>Connecting...</span>
                    </>
                ) : (
                    <span>Connect Wallet</span>
                )}
            </button>
            <InterchainWalletModal />
        </div>
    );
};
