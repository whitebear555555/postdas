'use client'
import Proposal from "@/components/Proposal";
import { useQuery } from "@tanstack/react-query";
import { fetchProposalList } from "../page";
import { ProposalListResponse } from "@/schema_single/ts/DasContrcat.types";
import { useParams } from "next/navigation";


export default function ProposalPage() {
    const id = useParams().id

    const { data, isLoading } = useQuery<ProposalListResponse>({
        queryKey: ['proposal'],
        queryFn: fetchProposalList,
    })

    if (isLoading) return <div className="min-h-screen bg-black flex items-center justify-center"><div className="text-center py-12 sm:py-20 px-4 text-zinc-500 animate-pulse text-sm sm:text-base">Loading proposal...</div></div>;

    console.log("res: ", data?.proposals);
    return (<Proposal proposal={data?.proposals.find(p => p.id == Number(id))} />)
}
