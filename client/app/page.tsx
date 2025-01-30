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
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold mb-8">Welcome to Agent Battle</h1>
      <p className="text-lg mb-8 text-neutral-500">
        Agent Battle is a game where you can create your own agent and battle
        other agents. Connect your wallet to get started.
      </p>
      <div className="relative">
        <Wallet>
          <ConnectWallet text="Connect Wallet">
            <Avatar className="h-6 w-6" />
            <Name />
          </ConnectWallet>
        </Wallet>
      </div>
    </main>
  );
}
