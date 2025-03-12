import { ethers } from "ethers";
import { IAgentRuntime, State, TransferDetails } from "../types";

export async function initWalletProvider(
  runtime: IAgentRuntime
): Promise<ethers.BrowserProvider> {
  if (!window.ethereum) {
    throw new Error("MetaMask is not installed");
  }

  const provider = new ethers.BrowserProvider(window.ethereum);
  await provider.send("eth_requestAccounts", []);
  return provider;
}

export async function buildTransferDetails(
  state: State,
  runtime: IAgentRuntime,
  provider: ethers.BrowserProvider
): Promise<TransferDetails> {
  const signer = await provider.getSigner();
  const fromAddress = await signer.getAddress();

  // Extract transfer details from state context
  const { toAddress, amount, token } = state.context;

  if (!toAddress || !amount) {
    throw new Error("Missing required transfer parameters");
  }

  return {
    fromAddress,
    toAddress,
    amount: amount.toString(),
    token: token || undefined,
    chainId: Number((await provider.getNetwork()).chainId),
  };
}
