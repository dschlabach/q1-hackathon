"use client";

import { useAccount, useWalletClient, usePublicClient } from "wagmi";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { parseEther } from "viem";
import ConnectedWallet from "../components/ConnectedWallet";
import { useNextAgent } from "../hooks/useNextAgent";
import { useCreateAgent } from "../hooks/useCreateAgent";
import Link from "next/link";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "../constants";

export default function CreateAgent() {
  const { isConnected, address } = useAccount();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();
  const router = useRouter();
  const [agentName, setAgentName] = useState("");
  const [agentPrompt, setAgentPrompt] = useState("");
  const { data: nextAgent } = useNextAgent();
  const { mutate: createAgent, isPending: isCreating } = useCreateAgent();
  const [isContractLoading, setIsContractLoading] = useState(false);

  const isFormValid = agentName.trim() !== "" && agentPrompt.trim() !== "";

  useEffect(() => {
    if (!isConnected) {
      router.push("/");
    }
  }, [isConnected, router]);

  const handleCreate = async () => {
    if (!isFormValid) return;
    if (!nextAgent?.id) {
      console.error("Waiting for agent ID...");
      // TODO: Add toast notification
      return;
    }
    if (!address || !walletClient || !publicClient) {
      alert("Please connect your wallet first");
      return;
    }

    try {
      setIsContractLoading(true);

      // Call smart contract
      const hash = await walletClient.writeContract({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: "createAgent",
        args: [BigInt(nextAgent.id)],
        value: parseEther("0.01"),
      });

      console.log("Transaction hash:", hash);

      // Wait for transaction confirmation
      const receipt = await publicClient.waitForTransactionReceipt({ hash });
      console.log("Transaction confirmed:", receipt);

      // After smart contract confirmation, create agent in backend
      createAgent(
        {
          id: nextAgent.id,
          name: agentName,
          prompt: agentPrompt,
        },
        {
          onSuccess: () => {
            router.push("/profile");
          },
          onError: (error) => {
            console.error("Failed to create agent:", error);

            // Check if it's an insufficient funds error
            if (
              error instanceof Error &&
              error.message.includes("exceeds the balance of the account")
            ) {
              alert(
                "Insufficient funds on Base Sepolia network. Please make sure you have enough Base Sepolia ETH (not regular Sepolia ETH) to cover the transaction (0.01 ETH + gas fees). You can get Base Sepolia ETH from the faucet at https://www.coinbase.com/faucets/base-sepolia-faucet"
              );
            } else {
              alert(
                "Error creating agent. Please check the console for details."
              );
            }
            // TODO: Add error toast notification
          },
        }
      );
    } catch (error) {
      console.error("Error creating agent:", error);

      // Check if it's an insufficient funds error
      if (
        error instanceof Error &&
        error.message.includes("exceeds the balance of the account")
      ) {
        alert(
          "Insufficient funds on Base Sepolia network. Please make sure you have enough Base Sepolia ETH (not regular Sepolia ETH) to cover the transaction (0.01 ETH + gas fees). You can get Base Sepolia ETH from the faucet at https://www.coinbase.com/faucets/base-sepolia-faucet"
        );
      } else {
        alert("Error creating agent. Please check the console for details.");
      }
      // TODO: Add error toast notification
    } finally {
      setIsContractLoading(false);
    }
  };

  const isLoading = isCreating || isContractLoading;

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-24 bg-gray-900">
      <div className="absolute top-4 left-4">
        <Link
          href="/profile"
          className="text-green-400 hover:text-green-300 transition-colors flex items-center gap-2"
        >
          Back to Profile
        </Link>
      </div>
      <ConnectedWallet />

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
              disabled={isCreating}
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
              disabled={isCreating}
            />
            <p className="mt-2 text-sm text-gray-400">
              This prompt will determine how your agent behaves during battles.
              Make it strategic and specific!
            </p>
          </div>
          <div className="mb-6">
            <div className="flex justify-between items-center text-sm">
              <span className="text-green-400">Creation Price</span>
              <span className="text-white">0.01 ETH</span>
            </div>
            <div className="mt-2 text-sm text-gray-400">
              This is a one-time fee to create your agent
            </div>
          </div>
          <button
            onClick={handleCreate}
            disabled={!isFormValid || isLoading}
            className={`w-full py-2 px-4 rounded-md transition-all duration-200 
              ${
                isFormValid && !isLoading
                  ? "bg-gray-700 text-green-400 border border-green-400 hover:bg-green-400 hover:text-gray-900 shadow-[0_0_15px_rgba(74,222,128,0.2)] hover:shadow-[0_0_20px_rgba(74,222,128,0.4)]"
                  : "bg-gray-700 text-gray-500 border border-gray-600 cursor-not-allowed"
              }`}
          >
            {isContractLoading
              ? "Creating on Blockchain..."
              : isCreating
              ? "Saving Agent..."
              : "Create Agent"}
          </button>
        </div>
      </div>
    </main>
  );
}
