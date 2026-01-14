'use client'

import { useEffect, useState } from "react";
import { CosmWasmClient, SigningCosmWasmClient } from "@cosmjs/cosmwasm-stargate";
import { OfflineDirectSigner } from "@cosmjs/proto-signing";
import ReactMarkdown from 'react-markdown';
import toast from 'react-hot-toast';
import { ProposalResponse } from "@/schema_single/ts/DasContrcat.types";
import { PROPOSAL_MODULE_ADDRESS, RPC_URL } from "./Wallet";
import { useChain } from "@interchain-kit/react";
import { CHAIN_NAME } from "./Wallet";

type Props = {
    proposal: ProposalResponse | undefined
};

export default function Proposal({ proposal }: Props) {
    const { address, status, wallet } = useChain(CHAIN_NAME);
    const [myVote, setMyVote] = useState<string | null>(null);
    const [isVoting, setIsVoting] = useState(false);
    const [gasLimit, setGasLimit] = useState<string>("200000");
    const [customGasEnabled, setCustomGasEnabled] = useState<boolean>(false);

    useEffect(() => {
        if (!proposal || !address) {
            setMyVote(null);
            return;
        }

        const fetchMyVote = async () => {
            try {
                const client = await CosmWasmClient.connect(RPC_URL);
                const response = await client.queryContractSmart(PROPOSAL_MODULE_ADDRESS, {
                    get_vote: {
                        proposal_id: proposal.id,
                        voter: address
                    }
                });
                if (response.vote) {
                    setMyVote(response.vote.vote);
                }
            } catch (error) {
                console.log("Not voted or error fetching vote");
            }
        };

        fetchMyVote();
    }, [proposal?.id, address]);

    if (!proposal) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="text-zinc-500 animate-pulse">Loading Proposal...</div>
            </div>
        );
    }

    const { id, proposal: prop } = proposal;

    const voteHandler = async (voteOption: "yes" | "no" | "abstain") => {
        if (!address) return;

        setIsVoting(true);
        try {
            const signer = await wallet?.getOfflineSigner();
            if (!signer) return;

            // Приводим signer к OfflineDirectSigner
            const offlineSigner = signer as OfflineDirectSigner;

            const client = await SigningCosmWasmClient.connectWithSigner(RPC_URL, offlineSigner);

            const msg = {
                vote: {
                    proposal_id: id,
                    vote: voteOption,
                    rationale: ""
                }
            };

            const executeOptions: any = { amount: [] };
            if (customGasEnabled) {
                executeOptions.gas = gasLimit;
            }

            await client.execute(address, PROPOSAL_MODULE_ADDRESS, msg, executeOptions);
            setMyVote(voteOption);
            toast.success(`Successfully voted ${voteOption.toUpperCase()}!`);
        } catch (error) {
            console.error("Voting error:", error);

            // Handle specific error types
            let errorMessage = 'Unknown error occurred';

            if (error instanceof Error) {
                if (error.message.includes('does not exist on chain')) {
                    errorMessage = 'Insufficient balance. Please add JUNO tokens to your wallet to pay for transaction fees.';
                } else if (error.message.includes('insufficient funds')) {
                    errorMessage = 'Insufficient funds to pay for transaction fees.';
                } else if (error.message.includes('account sequence')) {
                    errorMessage = 'Account not found on chain. Please ensure your wallet has JUNO tokens.';
                } else {
                    errorMessage = error.message;
                }
            }

            toast.error(`Voting failed: ${errorMessage}`);
        } finally {
            setIsVoting(false);
        }
    };

    // Calculate vote percentages
    // Note: parseInt for Uint128 is risky for huge numbers, but okay for display if decimals handled elsewhere
    const yesVotes = parseInt(prop.votes.yes);
    const noVotes = parseInt(prop.votes.no);
    const abstainVotes = parseInt(prop.votes.abstain);
    const totalVotes = yesVotes + noVotes + abstainVotes;

    const yesPercent = totalVotes > 0 ? (yesVotes / totalVotes * 100).toFixed(1) : '0';
    const noPercent = totalVotes > 0 ? (noVotes / totalVotes * 100).toFixed(1) : '0';
    const abstainPercent = totalVotes > 0 ? (abstainVotes / totalVotes * 100).toFixed(1) : '0';

    // Status styling & Text
    let statusColor = "text-zinc-500 border-zinc-700";
    if (prop.status === "open") statusColor = "text-green-500 border-green-500";
    if (prop.status === "passed") statusColor = "text-blue-500 border-blue-500";
    if (prop.status === "rejected") statusColor = "text-red-500 border-red-500";
    if (prop.status === "executed") statusColor = "text-purple-500 border-purple-500";

    const statusText = typeof prop.status === 'string' ? prop.status : Object.keys(prop.status)[0];
    const isOpen = statusText === "open";

    return (
        <div className="min-h-screen bg-black py-4 px-3 sm:py-8 sm:px-4">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="bg-zinc-900 border border-zinc-800 p-6 mb-6 shadow-lg">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-4 gap-2">
                        <div className="flex-1">
                            <span className="text-zinc-500 text-xs font-mono mb-1 block">#{id}</span>
                            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">{prop.title}</h1>
                        </div>
                        <span className={`px-3 py-1 border rounded-full text-xs font-bold uppercase self-start tracking-wider ${statusColor}`}>
                            {statusText}
                        </span>
                    </div>

                    {/* Description */}
                    <div className="text-zinc-300 mb-6 text-sm sm:text-base prose prose-invert max-w-none break-words overflow-wrap-anywhere">
                        <ReactMarkdown
                            components={{
                                a: ({ children, ...props }) => (
                                    <a {...props} className="break-all" style={{ wordBreak: 'break-all' }}>
                                        {children}
                                    </a>
                                ),
                                p: ({ children }) => (
                                    <p className="break-words overflow-wrap-anywhere mb-4 last:mb-0">
                                        {children}
                                    </p>
                                )
                            }}
                        >
                            {prop.description}
                        </ReactMarkdown>
                    </div>

                    {/* Proposer */}
                    <div className="text-xs text-zinc-500 flex items-center gap-2 border-t border-zinc-800 pt-4">
                        <span className="font-medium uppercase tracking-wider">Proposer:</span>
                        <span className="font-mono text-zinc-400 truncate">{prop.proposer}</span>
                    </div>
                </div>

                {/* Proposal Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    {/* Left: Metadata */}
                    <div className="bg-zinc-900 border border-zinc-800 p-6 h-full">
                        <h2 className="text-lg font-bold text-white mb-4 uppercase tracking-widest">Details</h2>
                        <div className="space-y-3 text-sm">
                            <Row label="Revoting" value={prop.allow_revoting ? 'Enabled' : 'Disabled'} />
                            <Row label="Total Power" value={prop.total_power} fontMono />
                            <Row label="Threshold" value={formatThreshold(prop.threshold)} />
                            <Row label="Expiration" value={formatExpiration(prop.expiration)} />
                        </div>
                    </div>

                    {/* Right: Results Chart */}
                    <div className="bg-zinc-900 border border-zinc-800 p-6 h-full">
                        <h2 className="text-lg font-bold text-white mb-4 uppercase tracking-widest">Results</h2>
                        <div className="space-y-4">
                            <Bar label="YES" count={prop.votes.yes} percent={yesPercent} color="bg-green-500" textColor="text-green-400" />
                            <Bar label="NO" count={prop.votes.no} percent={noPercent} color="bg-red-500" textColor="text-red-400" />
                            <Bar label="ABSTAIN" count={prop.votes.abstain} percent={abstainPercent} color="bg-yellow-500" textColor="text-yellow-400" />
                        </div>
                        <div className="mt-4 pt-4 border-t border-zinc-800 text-xs text-zinc-500 text-right">
                            Total Votes: {totalVotes.toLocaleString()}
                        </div>
                    </div>
                </div>

                {/* Messages (JSON) */}
                {prop.msgs && prop.msgs.length > 0 && (
                    <div className="bg-zinc-900 border border-zinc-800 p-6 mb-6">
                        <h2 className="text-sm font-bold text-zinc-500 mb-4 uppercase tracking-widest">Execution Messages</h2>
                        <div className="space-y-2">
                            {prop.msgs.map((msg, index) => (
                                <div key={index} className="bg-black border border-zinc-800 p-3 text-xs font-mono text-zinc-400 overflow-x-auto">
                                    <pre>{JSON.stringify(msg, null, 2)}</pre>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* --- VOTING SECTION --- */}
                <div className="bg-zinc-900 border border-zinc-800 p-6 sm:p-8">
                    <h2 className="text-xl font-bold text-white mb-6 uppercase tracking-widest text-center sm:text-left">
                        Cast Your Vote
                    </h2>

                    {status !== 'Connected' ? (
                        <div className="text-center py-6 border border-dashed border-zinc-700 rounded-lg">
                            <p className="text-zinc-500 mb-2">Wallet not connected</p>
                            <div className="text-sm text-zinc-400">Please connect your wallet at the top of the page to vote.</div>
                        </div>
                    ) : myVote ? (
                        <div className="text-center py-6 bg-black border border-green-900/50">
                            <p className="text-zinc-500 text-xs uppercase tracking-widest mb-2">You have voted</p>
                            <p className="text-2xl font-bold text-white uppercase">{myVote}</p>
                        </div>
                    ) : !isOpen ? (
                        <div className="text-center py-6">
                            <p className="text-zinc-500">Voting for this proposal is closed.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {/* Gas Settings */}
                            <div className="bg-zinc-800 border border-zinc-700 p-4 rounded-lg">
                                <div className="flex items-center gap-2 mb-3">
                                    <input
                                        type="checkbox"
                                        id="customGas"
                                        checked={customGasEnabled}
                                        onChange={(e) => setCustomGasEnabled(e.target.checked)}
                                        className="w-4 h-4 text-blue-600 bg-zinc-900 border-zinc-600 rounded focus:ring-blue-500 focus:ring-2"
                                    />
                                    <label htmlFor="customGas" className="text-sm font-bold text-zinc-300 uppercase tracking-wider cursor-pointer">
                                        Custom Gas Limit
                                    </label>
                                </div>

                                {customGasEnabled && (
                                    <div className="flex flex-col sm:flex-row gap-3">
                                        <div className="flex-1">
                                            <label className="block text-xs text-zinc-400 mb-1">Gas Limit</label>
                                            <input
                                                type="number"
                                                value={gasLimit}
                                                onChange={(e) => setGasLimit(e.target.value)}
                                                className="w-full bg-zinc-900 border border-zinc-600 text-zinc-200 px-3 py-2 text-sm rounded focus:border-zinc-500 focus:outline-none"
                                                placeholder="200000"
                                            />
                                        </div>
                                    </div>
                                )}

                                <p className="text-xs text-zinc-500 mt-2">
                                    {customGasEnabled
                                        ? "Higher gas limit = higher fee but faster transaction"
                                        : "Using automatic gas estimation"
                                    }
                                </p>
                            </div>

                            {/* Vote Buttons */}
                            <div className="flex flex-col sm:flex-row gap-4">
                                <button
                                    disabled={isVoting}
                                    onClick={() => voteHandler("yes")}
                                    className="flex-1 bg-green-600 text-white hover:bg-green-500 py-4 font-bold uppercase tracking-widest text-sm transition-colors disabled:opacity-50 border border-green-500"
                                >
                                    Vote Yes
                                </button>
                                <button
                                    disabled={isVoting}
                                    onClick={() => voteHandler("no")}
                                    className="flex-1 bg-red-600 text-white hover:bg-red-500 py-4 font-bold uppercase tracking-widest text-sm transition-colors disabled:opacity-50 border border-red-500"
                                >
                                    Vote No
                                </button>
                                <button
                                    disabled={isVoting}
                                    onClick={() => voteHandler("abstain")}
                                    className="flex-1 bg-yellow-600 text-white hover:bg-yellow-500 py-4 font-bold uppercase tracking-widest text-sm transition-colors disabled:opacity-50 border border-yellow-500"
                                >
                                    Abstain
                                </button>
                            </div>
                        </div>
                    )}

                    {isVoting && (
                        <div className="mt-4 text-center text-zinc-500 text-xs animate-pulse uppercase tracking-wider">
                            Processing Transaction...
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}


const Row = ({ label, value, fontMono }: any) => (
    <div className="flex justify-between items-center border-b border-zinc-800/50 pb-2 last:border-0">
        <span className="text-zinc-500">{label}</span>
        <span className={`text-zinc-200 ${fontMono ? 'font-mono' : ''}`}>{value}</span>
    </div>
);

const Bar = ({ label, count, percent, color, textColor }: any) => (
    <div>
        <div className="flex justify-between items-end mb-1">
            <span className={`text-xs font-bold ${textColor}`}>{label}</span>
            <span className="text-xs text-zinc-500 font-mono">{count} ({percent}%)</span>
        </div>
        <div className="w-full bg-zinc-800 h-2 rounded-sm overflow-hidden">
            <div className={`h-full ${color} transition-all duration-500`} style={{ width: `${percent}%` }}></div>
        </div>
    </div>
);


function formatExpiration(expiration: any): string {
    if (!expiration) return "Unknown";
    if ('at_height' in expiration) return `Block ${expiration.at_height} `;
    if ('at_time' in expiration) return new Date(Number(expiration.at_time) / 1_000_000).toLocaleString();
    if ('never' in expiration) return "Never";
    return JSON.stringify(expiration);
}

function formatThreshold(threshold: any): string {
    if (!threshold) return "Unknown";
    if ('absolute_percentage' in threshold) return `> ${threshold.absolute_percentage.percentage.percent || threshold.absolute_percentage.percentage}% `;
    if ('threshold_quorum' in threshold) return `Quorum: ${threshold.threshold_quorum.quorum.percent || threshold.threshold_quorum.quorum}% `;
    if ('absolute_count' in threshold) return `${threshold.absolute_count} votes`;
    return "Complex";
}
