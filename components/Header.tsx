"use client";

import Image from "next/image";
import icon from "/assets/icon.png";
import { Wallet } from "./Wallet";
import Link from "next/link";

export default function Header() {
    return (<div className="w-full flex flex-col items-center">
        <div className="w-full h-32 sm:h-48 md:h-64 bg-zinc-900 relative overflow-hidden border-b border-zinc-800">
            {/* <img src="/my-banner.jpg" alt="DAO Banner" className="w-full h-full object-cover opacity-80" /> */}

            <Link href="/">
                <div className="absolute inset-0 flex flex-row items-center justify-center bg-black/40 px-4">
                    <h1 className="text-4xl sm:text-4xl md:text-4xl lg:text-6xl font-bold text-white tracking-widest uppercase relative z-20 drop-shadow-lg">
                        POSTHUMAN
                    </h1>
                    <Image
                        src={icon}
                        className="Icon w-24 h-24 sm:w-40 sm:h-40 md:w-48 md:h-48 mx-2 sm:mx-4 relative z-10"
                        alt="logo"
                        width={300}
                        height={300}
                    />
                    <h1 className="text-4xl sm:text-4xl md:text-6xl font-bold text-white tracking-widest uppercase relative z-20 drop-shadow-lg">
                        DAS
                    </h1>
                </div>
            </Link>
        </div>

        <div className="w-full px-3 sm:px-4 py-3 sm:py-4 flex justify-between items-center border-b border-white/20 bg-white/10 backdrop-blur-md shadow-lg">
            <span className="text-black text-bold text-4xs sm:text-4sm font-medium drop-shadow-sm">Juno Network</span>
            <Wallet />
        </div>
    </div>)
}
