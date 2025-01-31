"use client";

import { Wallet, ConnectWallet } from "@coinbase/onchainkit/wallet";
import { Avatar, Name } from "@coinbase/onchainkit/identity";
import { useAccount } from "wagmi";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const { isConnected } = useAccount();
  const router = useRouter();

  useEffect(() => {
    if (isConnected) {
      router.push("/profile");
    }
  }, [isConnected, router]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gray-900">
      <h1 className="text-4xl font-bold mb-8 text-white text-center">
        Welcome to Agent Battle
      </h1>
      <p className="text-lg mb-8 text-gray-400 text-center">
        Agent Battle is a game where you can create your own agent and battle
        other agents. Connect your wallet to get started.
      </p>
      <div className="relative">
        <Wallet>
          <ConnectWallet className="bg-gray-800 text-green-400 border border-green-400 py-3 px-6 rounded-md hover:bg-green-400 hover:text-gray-900 transition-all duration-200 shadow-[0_0_15px_rgba(74,222,128,0.2)] hover:shadow-[0_0_20px_rgba(74,222,128,0.4)]">
            <Avatar className="h-6 w-6" />
            <Name />
          </ConnectWallet>
        </Wallet>
      </div>
    </main>
  );
}
