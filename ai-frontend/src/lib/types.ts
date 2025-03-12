import { ethers } from "ethers";

export interface Memory {
  text: string;
  timestamp: number;
  metadata?: any;
}

export interface State {
  context: {
    [key: string]: any;
  };
  memory: Memory[];
}

export interface HandlerCallback {
  (response: { text: string; content?: any }): void;
}

export interface IAgentRuntime {
  provider: ethers.Provider;
  getCharacter(): Character;
  executeAction(action: string, params: any): Promise<any>;
}

export interface TransferDetails {
  fromAddress: string;
  toAddress: string;
  amount: string;
  token?: string;
  chainId?: number;
}

export interface Action {
  name: string;
  description: string;
  handler: (
    runtime: IAgentRuntime,
    message: Memory,
    state: State,
    options: any,
    callback?: HandlerCallback
  ) => Promise<boolean>;
}

export interface TransactionResponse {
  hash: string;
  wait(): Promise<ethers.TransactionReceipt | null>;
}

export interface Character {
  name: string;
  description: string;
  bio: string[];
  personality: string[];
  lore: string[];
  capabilities: string[];
  responses: {
    greeting: string;
    farewell: string;
    error: string;
    success: string;
  };
}
