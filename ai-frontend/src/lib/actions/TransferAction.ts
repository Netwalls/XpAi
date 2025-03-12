import { ethers } from "ethers";
import { TransferDetails, TransactionResponse } from "../types";

export class TransferAction {
  private provider: ethers.BrowserProvider;
  private signer?: ethers.Signer;

  constructor(provider: ethers.BrowserProvider) {
    this.provider = provider;
  }

  private async initSigner(): Promise<void> {
    if (!this.signer) {
      this.signer = await this.provider.getSigner();
    }
  }

  async transfer(details: TransferDetails): Promise<TransactionResponse> {
    try {
      await this.initSigner();
      if (!this.signer) throw new Error("Failed to initialize signer");

      // Validate addresses
      if (!ethers.isAddress(details.toAddress)) {
        throw new Error("Invalid recipient address");
      }

      // Convert amount to Wei
      const amountInWei = ethers.parseEther(details.amount);

      // If token address is provided, handle ERC20 transfer
      if (details.token) {
        const tokenContract = new ethers.Contract(
          details.token,
          ["function transfer(address to, uint256 amount) returns (bool)"],
          this.signer
        );

        const tx = await tokenContract.transfer(details.toAddress, amountInWei);
        return tx;
      }

      // Handle native token (ETH) transfer
      const tx = await this.signer.sendTransaction({
        to: details.toAddress,
        value: amountInWei,
      });

      return tx;
    } catch (error) {
      console.error("Transfer failed:", error);
      throw error;
    }
  }
}
