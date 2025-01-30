"use client";

import { WalletDefault } from "@coinbase/onchainkit/wallet";
import { useAccount } from "wagmi";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Profile() {
  const { isConnected } = useAccount();
  const router = useRouter();

  useEffect(() => {
    if (!isConnected) {
      router.push("/");
    }
  }, [isConnected, router]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold mb-8">Your Profile</h1>
      <div className="relative">
        <WalletDefault />
      </div>
    </main>
  );
}
