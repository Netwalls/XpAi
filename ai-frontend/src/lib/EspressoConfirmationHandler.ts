import { ethers } from "ethers";

export class EspressoConfirmationHandler {
  private rpcUrl: string;

  constructor(rpcUrl: string) {
    this.rpcUrl = rpcUrl;
  }

  /**
   * Register a transaction with Espresso's confirmation layer
   * @param txHash The transaction hash to monitor
   * @param chain The chain where the transaction was submitted
   * @returns A unique confirmation ID
   */
  public async registerTransaction(
    txHash: string,
    chain: string
  ): Promise<string> {
    try {
      const response = await fetch(`${this.rpcUrl}/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          txHash,
          chain,
        }),
      });

      if (!response.ok) {
        throw new Error(
          `Failed to register transaction: ${response.statusText}`
        );
      }

      const data = await response.json();
      return data.confirmationId;
    } catch (error: any) {
      console.warn("Espresso confirmation registration failed:", error.message);
      return ""; // Return empty string if registration fails
    }
  }

  /**
   * Check if a transaction has been confirmed by Espresso's network
   * @param confirmationId The confirmation ID returned from registerTransaction
   * @returns boolean indicating if the transaction is confirmed
   */
  public async checkConfirmation(confirmationId: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.rpcUrl}/status/${confirmationId}`);
      if (!response.ok) {
        throw new Error(`Failed to check confirmation: ${response.statusText}`);
      }

      const data = await response.json();
      return data.status === "confirmed";
    } catch (error: any) {
      console.warn("Failed to check confirmation status:", error.message);
      return false;
    }
  }

  /**
   * Get detailed confirmation information for a transaction
   * @param confirmationId The confirmation ID returned from registerTransaction
   * @returns Detailed confirmation information
   */
  public async getConfirmationDetails(confirmationId: string): Promise<{
    status: string;
    confirmations: number;
    targetChain?: string;
    finalizedAt?: number;
  }> {
    try {
      if (!confirmationId) throw new Error("Confirmation ID is required");

      const response = await fetch(`${this.rpcUrl}/details/${confirmationId}`);
      if (!response.ok) {
        throw new Error(
          `Failed to get confirmation details: ${response.statusText}`
        );
      }

      return await response.json();
    } catch (error) {
      console.error("Failed to get confirmation details:", error);
      throw error;
    }
  }
}
