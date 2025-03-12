import { ethers } from "ethers";

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

export class AgentRuntime {
  private plugins: Plugin[] = [];
  private wallet: ethers.Wallet | null = null;

  constructor(
    private config: {
      character: Character;
      evmPublicKey?: string;
      evmPrivateKey?: string;
      provider?: ethers.Provider;
    }
  ) {
    this.initializePlugins();
  }

  private async initializePlugins() {
    if (this.config.evmPrivateKey && this.config.provider) {
      this.wallet = new ethers.Wallet(
        this.config.evmPrivateKey,
        this.config.provider
      );

      this.plugins.push({
        name: "evm",
        initialize: async () => {},
        execute: async (action: string, params: any) => {
          switch (action) {
            case "transfer":
              return this.handleTransfer(params);
            case "getBalance":
              return this.handleGetBalance(params);
            default:
              throw new Error(`Unknown action: ${action}`);
          }
        },
      });
    }
  }

  private async handleTransfer(params: {
    toAddress: string;
    amount: string;
    chain: string;
  }) {
    if (!this.wallet) throw new Error("Wallet not initialized");

    const tx = await this.wallet.sendTransaction({
      to: params.toAddress,
      value: ethers.parseEther(params.amount),
    });

    return {
      hash: tx.hash,
      from: tx.from,
      to: tx.to,
      amount: params.amount,
    };
  }

  private async handleGetBalance(params: { address: string }) {
    if (!this.wallet?.provider)
      throw new Error("Wallet or provider not initialized");
    const balance = await this.wallet.provider.getBalance(params.address);
    return ethers.formatEther(balance);
  }

  public async executeAction(action: string, params: any) {
    for (const plugin of this.plugins) {
      try {
        return await plugin.execute(action, params);
      } catch (error) {
        console.error(
          `Plugin ${plugin.name} failed to execute ${action}:`,
          error
        );
      }
    }
    throw new Error(`No plugin could handle action: ${action}`);
  }

  public getCharacter() {
    return this.config.character;
  }

  public getWalletAddress() {
    return this.wallet?.address;
  }
}
