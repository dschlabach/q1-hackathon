"use client";

import {
  Wallet,
  ConnectWallet,
  WalletDropdown,
  WalletDropdownDisconnect,
} from "@coinbase/onchainkit/wallet";
import { Avatar, Name, Identity, Address } from "@coinbase/onchainkit/identity";
import { useAccount } from "wagmi";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function CreateAgent() {
  const { isConnected } = useAccount();
  const router = useRouter();
  const [agentName, setAgentName] = useState("");
  const [agentPrompt, setAgentPrompt] = useState("");

  const isFormValid = agentName.trim() !== "" && agentPrompt.trim() !== "";

  useEffect(() => {
    if (!isConnected) {
      router.push("/");
    }
  }, [isConnected, router]);

  const handleCreate = () => {
    if (!isFormValid) return;
    // Mock creation - just redirect back to profile for now
    router.push("/profile");
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gray-900">
      <div className="absolute top-4 right-4">
        <Wallet>
          <ConnectWallet>
            <Avatar className="h-8 w-8" />
            <div className="flex flex-col">
              <Name className="font-semibold" />
            </div>
          </ConnectWallet>
          <WalletDropdown>
            <Identity className="px-4 pt-3 pb-2" hasCopyAddressOnClick>
              <Avatar />
              <Name />
              <Address />
            </Identity>
            <WalletDropdownDisconnect />
          </WalletDropdown>
        </Wallet>
      </div>

      <div className="w-full max-w-md">
        <h1 className="text-4xl font-bold mb-8 text-center text-white">
          Create AI Agent
        </h1>
        <div className="bg-gray-800 p-8 rounded-lg shadow-lg border border-gray-700">
          <div className="mb-6">
            <label
              htmlFor="agentName"
              className="block text-sm font-medium text-green-400 mb-2"
            >
              Agent Name
            </label>
            <input
              type="text"
              id="agentName"
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-400 text-white placeholder-gray-400"
              value={agentName}
              onChange={(e) => setAgentName(e.target.value)}
              placeholder="Enter agent name"
            />
          </div>
          <div className="mb-6">
            <label
              htmlFor="agentPrompt"
              className="block text-sm font-medium text-green-400 mb-2"
            >
              Battle Prompt
            </label>
            <textarea
              id="agentPrompt"
              rows={6}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-400 text-white placeholder-gray-400 resize-none"
              value={agentPrompt}
              onChange={(e) => setAgentPrompt(e.target.value)}
              placeholder="Enter the prompt that will define your agent's behavior in battles..."
            />
            <p className="mt-2 text-sm text-gray-400">
              This prompt will determine how your agent behaves during battles.
              Make it strategic and specific!
            </p>
          </div>
          <button
            onClick={handleCreate}
            disabled={!isFormValid}
            className={`w-full py-2 px-4 rounded-md transition-all duration-200 
              ${
                isFormValid
                  ? "bg-gray-700 text-green-400 border border-green-400 hover:bg-green-400 hover:text-gray-900 shadow-[0_0_15px_rgba(74,222,128,0.2)] hover:shadow-[0_0_20px_rgba(74,222,128,0.4)]"
                  : "bg-gray-700 text-gray-500 border border-gray-600 cursor-not-allowed"
              }`}
          >
            Create Agent
          </button>
        </div>
      </div>
    </main>
  );
}
