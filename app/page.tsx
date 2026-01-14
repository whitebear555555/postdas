'use client'
import { useEffect, useState } from "react";
import { PROPOSAL_MODULE_ADDRESS, RPC_URL } from "@/components/Wallet";
import { useQuery } from "@tanstack/react-query";
import { CosmWasmClient } from "@cosmjs/cosmwasm-stargate";
import { ProposalListResponse, ProposalResponse } from "@/schema_single/ts/DasContrcat.types";
import Link from "next/link";
import ProposalList from "@/components/ProposalList";
import { create } from 'zustand'

interface ProposalListState {
  proposals: ProposalResponse[];
  setProposals: (proposals: any[]) => void;
}

const useProposalStore = create<ProposalListState>((set) => ({
  proposals: [],
  setProposals: (newProposals) => set({ proposals: newProposals }),
}))


export const fetchProposalList = async ({ queryKey }: any) => {
  const [_key, { limit = 100, start_after = 0 } = {}] = queryKey;
  const client = await CosmWasmClient.connect(RPC_URL);
  const response = await client.queryContractSmart(PROPOSAL_MODULE_ADDRESS, {
    list_proposals: {
      limit,
      start_after
    }
  });
  console.log("res: ", response.proposals);
  response.proposals.reverse()
  return response
}

export default function Home() {
  const setProposals = useProposalStore((state) => state.setProposals);
  const { data: proposalList, isFetched, isLoading, isError, error } = useQuery<ProposalListResponse>({
    queryKey: ['proposals'],
    queryFn: fetchProposalList,
  })

/*   useEffect(() => {
    if (proposalList?.proposals) {
      setProposals(proposalList.proposals);
    }
  }, [proposalList, setProposals]) */;

  if (isLoading) return <div className="min-h-screen bg-black flex items-center justify-center"><div className="text-center py-12 sm:py-20 px-4 text-zinc-500 animate-pulse text-sm sm:text-base">loading das data...</div></div>;

  if (isError) return (
    <div className="text-center py-12 sm:py-20 px-4 text-red-500 text-sm sm:text-base">
      error: {error instanceof Error ? error.message : 'unknown error'}
    </div>
  );

  return (
    <ProposalList proposalList={proposalList} />
  )
}
