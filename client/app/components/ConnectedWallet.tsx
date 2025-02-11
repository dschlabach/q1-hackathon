"use client";

import {
  Wallet,
  ConnectWallet,
  WalletDropdown,
  WalletDropdownDisconnect,
} from "@coinbase/onchainkit/wallet";
import { Avatar, Name, Identity, Address } from "@coinbase/onchainkit/identity";
import { useAccount } from "wagmi";
import { base } from "viem/chains";

export default function ConnectedWallet() {
  const { address } = useAccount();

  return (
    <div className="absolute top-4 right-4">
      <Wallet>
        <ConnectWallet className="bg-gray-800 border border-green-400 py-2 px-4 rounded-md transition-all duration-200 shadow-[0_0_15px_rgba(74,222,128,0.2)] group hover:bg-green-400 hover:shadow-[0_0_20px_rgba(74,222,128,0.4)]">
          <Avatar
            address={address}
            className="h-8 w-8 rounded-full bg-green-400 opacity-90 group-hover:opacity-100"
            chain={base}
          />
          <div className="flex flex-col text-green-400 group-hover:text-gray-900">
            <Name
              address={address}
              chain={base}
              className="font-semibold text-green-400 group-hover:text-gray-900"
            />
          </div>
        </ConnectWallet>
        <WalletDropdown className="bg-gray-800 border border-green-400">
          <Identity
            className="px-4 pt-3 pb-2 bg-gray-800"
            hasCopyAddressOnClick
          >
            <Avatar
              address={address}
              chain={base}
              className="h-8 w-8 rounded-full bg-green-400 opacity-90 group-hover:opacity-100"
            />
            <Address className="text-gray-300 text-lg" />
          </Identity>
          <WalletDropdownDisconnect className="bg-gray-800 text-white fill-white hover:text-white hover:bg-gray-700 [&_svg]:!fill-white [&_path]:!fill-white" />
        </WalletDropdown>
      </Wallet>
    </div>
  );
}
