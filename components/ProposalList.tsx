
'use client'
import { useEffect, useState } from "react";
import { ProposalListResponse, ProposalResponse } from "@/schema_single/ts/DasContrcat.types";
import Link from "next/link";


export default function ProposalList(prop: { proposalList: ProposalListResponse | undefined }) {
  if (!prop.proposalList || prop.proposalList.proposals.length === 0) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-4">
        <div className="text-zinc-400 text-center">
          <div className="text-4xl mb-4">📋</div>
          <div className="text-lg font-medium">No proposals found</div>
          <div className="text-sm text-zinc-500 mt-2">Check back later for new proposals</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black py-6 px-3 sm:py-8 sm:px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-6 sm:mb-8 text-center">DAS Proposals</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {prop.proposalList.proposals.map(p => (
            <ProposalPreview key={p.id} prop={p} />
          ))}
        </div>
      </div>
    </div>
  );
}

function ProposalPreview({ prop }: { prop: ProposalResponse }) {
  let statuscolor = "text-zinc-500";
  if (prop.proposal.status === "open") statuscolor = "text-green-400";
  if (prop.proposal.status === "passed") statuscolor = "text-blue-400";
  if (prop.proposal.status === "rejected") statuscolor = "text-red-400";
  if (prop.proposal.status === "executed") statuscolor = "text-purple-400";

  // check if string or object (for veto_timelock)
  const statustext = typeof prop.proposal.status === 'string'
    ? prop.proposal.status
    : Object.keys(prop.proposal.status)[0];

  return (
    <Link href={`/${prop.id}`}>
      <div className="bg-zinc-900 border border-zinc-700 p-4 sm:p-6 hover:border-zinc-600 transition-all cursor-pointer group rounded-lg">
        <div className="flex justify-between items-start mb-3">
          <span className="text-xs text-zinc-500 font-mono">#{prop.id}</span>
          <span className={`text-xs font-bold uppercase border px-2 py-0.5 rounded-full border-zinc-600 ${statuscolor}`}>
            {statustext}
          </span>
        </div>
        <h3 className="text-lg sm:text-xl font-semibold text-white group-hover:text-gray-300 mb-2 line-clamp-2">
          {prop.proposal.title}
        </h3>
        <p className="text-zinc-400 text-sm line-clamp-2 mb-3">
          {prop.proposal.description}
        </p>

        <div className="flex flex-col gap-2 text-xs text-zinc-500 font-mono">
          <div className="flex justify-between">
            <span>Yes: {prop.proposal.votes.yes}</span>
            <span>No: {prop.proposal.votes.no}</span>
          </div>
          <div className="text-xs text-zinc-600">
            Expires: {prop.proposal.expiration && typeof prop.proposal.expiration === 'object' && 'at_time' in prop.proposal.expiration
              ? new Date(Number(prop.proposal.expiration.at_time) / 1000000).toLocaleDateString()
              : prop.proposal.expiration && typeof prop.proposal.expiration === 'object' && 'at_height' in prop.proposal.expiration
                ? `Block ${prop.proposal.expiration.at_height}`
                : 'Never'
            }
          </div>
        </div>
      </div>
    </Link>
  )
}