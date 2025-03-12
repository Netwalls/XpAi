import {
  Action,
  IAgentRuntime,
  Memory,
  State,
  HandlerCallback,
} from "../types";
import { initWalletProvider, buildTransferDetails } from "../utils/wallet";
import { TransferAction } from "./TransferAction";

export const transferAction: Action = {
  name: "transfer",
  description: "Transfer tokens between addresses on the same chain",
  handler: async (
    runtime: IAgentRuntime,
    message: Memory,
    state: State,
    _options: any,
    callback?: HandlerCallback
  ) => {
    try {
      const walletProvider = await initWalletProvider(runtime);
      const action = new TransferAction(walletProvider);
      const paramOptions = await buildTransferDetails(
        state,
        runtime,
        walletProvider
      );

      const transferResp = await action.transfer(paramOptions);

      if (callback) {
        callback({
          text: `Successfully transferred ${paramOptions.amount} ${
            paramOptions.token ? "tokens" : "ETH"
          } to ${paramOptions.toAddress}\nTransaction Hash: ${
            transferResp.hash
          }`,
          content: {
            success: true,
            hash: transferResp.hash,
            details: paramOptions,
          },
        });
      }

      return true;
    } catch (error) {
      console.error("Error during token transfer:", error);
      if (callback) {
        callback({
          text: `Failed to transfer tokens: ${
            error instanceof Error ? error.message : "Unknown error"
          }`,
          content: {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
          },
        });
      }
      return false;
    }
  },
};
