import { ethers } from "ethers";
import { EspressoConfirmationHandler } from "./EspressoConfirmationHandler";

interface Character {
  name: string;
  bio: string[];
  lore: string[];
}

interface Plugin {
  name: string;
  initialize: () => Promise<void>;
  execute: (action: string, params: any) => Promise<any>;
}

// DEX Configuration
const DEX_CONTRACTS: Record<string, string> = {
  cappuccino: "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D", // Uniswap V2 Router
  sepolia: "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D", // Uniswap V2 Router
};

export class AgentRuntime {
  private plugins: Plugin[] = [];
  private wallet: ethers.Wallet | null = null;
  private espressoHandler: EspressoConfirmationHandler;
  private provider: ethers.JsonRpcProvider;

  constructor(
    private config: {
      character: Character;
      evmPublicKey?: string;
      evmPrivateKey?: string;
      provider: ethers.JsonRpcProvider;
      espressoRpcUrl: string;
    }
  ) {
    this.provider = config.provider;
    this.espressoHandler = new EspressoConfirmationHandler(
      config.espressoRpcUrl
    );
    this.initializePlugins();
  }

  private async initializePlugins() {
    // Try to get the signer from browser wallet if no private key provided
    if (!this.wallet) {
      try {
        if (window.ethereum) {
          const provider = new ethers.BrowserProvider(window.ethereum);
          await provider.send("eth_requestAccounts", []);
          const signer = await provider.getSigner();
          this.wallet = signer as any; // Cast to support both wallet types
        }
      } catch (error) {
        console.error("Failed to initialize browser wallet:", error);
      }
    }

    // Fallback to private key if provided
    if (!this.wallet && this.config.evmPrivateKey) {
      this.wallet = new ethers.Wallet(this.config.evmPrivateKey, this.provider);
    }

    this.plugins = [
      {
        name: "evm",
        initialize: async () => {},
        execute: async (action: string, params: any) => {
          switch (action) {
            case "transfer":
              return await this.handleTransfer(params);
            case "swap":
              return await this.handleSwap(params);
            case "getBalance":
              return await this.handleGetBalance(params);
            default:
              return null; // Let other plugins try to handle it
          }
        },
      },
    ];
  }

  private async handleTransfer(params: {
    toAddress: string;
    amount: string;
    chain?: string;
    token?: string;
  }) {
    // First check if MetaMask is installed
    if (!window.ethereum) {
      throw new Error("Please install MetaMask to make transfers");
    }

    try {
      // Request account access if needed
      await window.ethereum.request({ method: "eth_requestAccounts" });

      // Create a new provider and signer
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      // Create the transaction
      const tx = await signer.sendTransaction({
        to: params.toAddress,
        value: ethers.parseEther(params.amount),
      });

      // Wait for the transaction to be mined
      const receipt = await tx.wait();

      let confirmationId = undefined;
      let explorerUrl = undefined;

      // Try to register with Espresso confirmation layer, but don't fail if it doesn't work
      try {
        confirmationId = await this.espressoHandler.registerTransaction(
          tx.hash,
          params.chain || "cappuccino"
        );
        explorerUrl = `${process.env.VITE_ESPRESSO_EXPLORER_URL}/tx/${tx.hash}`;
      } catch (espressoError) {
        console.warn(
          "Failed to register with Espresso, but transaction was successful:",
          espressoError
        );
      }

      return {
        hash: tx.hash,
        from: tx.from,
        to: tx.to,
        amount: params.amount,
        confirmationId,
        chain: params.chain || "cappuccino",
        explorerUrl,
        status: confirmationId ? "pending" : "confirmed",
      };
    } catch (error: any) {
      console.error("Transfer failed:", error);
      if (error.code === 4001) {
        throw new Error("Transaction rejected by user");
      } else if (error.code === -32602) {
        throw new Error("Please connect your wallet first");
      } else {
        throw new Error(error.message || "Transfer failed");
      }
    }
  }

  private async handleSwap(params: {
    fromToken: string;
    toToken: string;
    amount: string;
    chain: string;
  }) {
    if (!this.wallet) throw new Error("Wallet not initialized");

    // Get DEX router address for the chain
    const routerAddress = DEX_CONTRACTS[params.chain];
    if (!routerAddress) {
      throw new Error(`No DEX router configured for chain: ${params.chain}`);
    }

    // Get signer
    const signer = await this.provider.getSigner();
    const address = await signer.getAddress();

    // Prepare swap parameters
    const swapParams = {
      from: address,
      to: routerAddress,
      value: ethers.parseEther(params.amount.toString()),
      data: this.encodeSwapData(
        params.fromToken,
        params.toToken,
        params.amount
      ),
    };

    // Execute swap transaction
    const tx = await signer.sendTransaction(swapParams);
    const receipt = (await tx.wait()) as ethers.TransactionReceipt;

    // Register with Espresso confirmation layer
    const confirmationId = await this.espressoHandler.registerTransaction(
      receipt.hash,
      params.chain
    );

    return {
      hash: receipt.hash,
      from: receipt.from,
      to: receipt.to,
      chain: params.chain,
      confirmationId,
    };
  }

  private encodeSwapData(
    fromToken: string,
    toToken: string,
    amount: string
  ): string {
    // Encode the swap function call - this is a simplified version
    // In production, you'd want to include deadline, slippage, and proper path
    const abiCoder = new ethers.AbiCoder();
    return abiCoder.encode(
      ["address", "address", "uint256"],
      [fromToken, toToken, ethers.parseEther(amount)]
    );
  }

  private async handleGetBalance(params: { address: string }) {
    if (!this.wallet?.provider)
      throw new Error("Wallet or provider not initialized");
    const balance = await this.wallet.provider.getBalance(params.address);
    return ethers.formatEther(balance);
  }

  public async executeAction(action: string, params: any) {
    switch (action) {
      case "swap": {
        if (!window.ethereum) {
          throw new Error("Please install MetaMask to perform swaps");
        }

        try {
          // Request account access
          await window.ethereum.request({ method: "eth_requestAccounts" });

          const provider = new ethers.BrowserProvider(window.ethereum);
          const signer = await provider.getSigner();

          // Get DEX router address
          const routerAddress = DEX_CONTRACTS[params.chain];
          if (!routerAddress) {
            throw new Error(
              `No DEX router configured for chain: ${params.chain}`
            );
          }

          // Create transaction
          const tx = await signer.sendTransaction({
            to: routerAddress,
            value:
              params.fromToken === "ETH"
                ? ethers.parseEther(params.amount)
                : "0",
            data: this.encodeSwapData(
              params.fromToken,
              params.toToken,
              params.amount
            ),
          });

          const receipt = await tx.wait();
          if (!receipt) {
            throw new Error("Transaction failed - no receipt received");
          }

          let confirmationId;
          try {
            confirmationId = await this.espressoHandler.registerTransaction(
              receipt.hash,
              params.chain
            );
          } catch (error) {
            console.warn(
              "Failed to register with Espresso, but swap was successful"
            );
          }

          return {
            hash: receipt.hash,
            from: receipt.from,
            to: receipt.to,
            chain: params.chain,
            confirmationId,
            status: confirmationId ? "pending" : "confirmed",
          };
        } catch (error: any) {
          console.error("Swap error:", error);
          if (error.code === 4001) {
            throw new Error("Transaction rejected by user");
          } else if (error.code === -32602) {
            throw new Error("Please connect your wallet first");
          } else {
            throw new Error(error.message || "Swap failed");
          }
        }
      }
      default: {
        let lastError = null;

        for (const plugin of this.plugins) {
          try {
            const result = await plugin.execute(action, params);
            if (result) {
              return result;
            }
          } catch (error: any) {
            lastError = error;
            console.error(
              `Plugin ${plugin.name} failed to execute ${action}:`,
              error
            );
          }
        }

        // If we got here and lastError exists, the action was recognized but failed
        if (lastError) {
          throw lastError;
        }

        throw new Error(`No plugin could handle action: ${action}`);
      }
    }
  }

  public async checkConfirmation(confirmationId: string): Promise<boolean> {
    return this.espressoHandler.isConfirmed(confirmationId);
  }

  public getCharacter() {
    return this.config.character;
  }

  public getWalletAddress() {
    return this.wallet?.address;
  }
}
