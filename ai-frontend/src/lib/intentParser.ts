import ElizaBot from "elizabot";
import { z } from "zod";

const IntentSchema = z.object({
  intent: z.enum([
    "swap",
    "checkBalance",
    "transfer",
    "normalChat",
    "unknown",
    "coordinate",
  ]),
  amount: z.number().optional(),
  sourceToken: z.string().optional(),
  destinationToken: z.string().optional(),
  recipientAddress: z.string().optional(),
  walletAddress: z.string().optional(),
  sourceChain: z.string().optional(),
  targetChain: z.string().optional(),
  generalResponse: z.string(),
});

type Intent = z.infer<typeof IntentSchema>;

export class IntentParser {
  private eliza: ElizaBot;
  private agentId: string;
  private greetings = [
    "Welcome to XpresAI! I'm your Espresso Network assistant. What would you like to know about our fast cross-chain operations?",
    "Hi! I'm your XpresAI agent on the Espresso Network. Want to learn about our lightning-fast confirmations or try some cross-chain operations?",
    "Hello! I'm here to help you explore XpresAI and Espresso Network. Would you like to:\n" +
      "🚀 Learn about our HotShot consensus\n" +
      "💫 Try cross-chain transfers\n" +
      "🔄 Perform token swaps\n" +
      "💼 Check balances",
  ];

  private espressoTopics = {
    hotshot: {
      keywords: [
        "hotshot",
        "consensus",
        "how does it work",
        "tell me about hotshot",
      ],
      response:
        "HotShot is Espresso's revolutionary consensus protocol that powers our network! 🚀\n\n" +
        "Key features:\n" +
        "• Confirms transactions within seconds\n" +
        "• Provides instant finality for cross-chain operations\n" +
        "• Runs on 100 decentralized nodes in Mainnet 0\n" +
        "• Prevents sequencer equivocation\n" +
        "• Protects against reorgs\n\n" +
        "Would you like to try a cross-chain transfer to see HotShot in action?",
    },
    network: {
      keywords: [
        "network",
        "espresso network",
        "tell me about espresso",
        "what is espresso",
      ],
      response:
        "Espresso Network is a revolutionary Layer 2 solution! ☕\n\n" +
        "Core features:\n" +
        "• Global confirmation layer for fast, secure transactions\n" +
        "• Low-cost data availability alternative to Ethereum\n" +
        "• Supports multiple L2 chains (Arbitrum, OP Stack, Polygon)\n" +
        "• Powered by HotShot consensus for instant finality\n" +
        "• 100 decentralized nodes ensure reliability\n\n" +
        "What aspect would you like to explore further?",
    },
    security: {
      keywords: ["security", "how secure", "protection", "safe"],
      response:
        "Security is at the core of Espresso Network! 🔐\n\n" +
        "Our security features:\n" +
        "• Decentralized network of 100 nodes\n" +
        "• Prevention of sequencer equivocation\n" +
        "• Protection against reorgs\n" +
        "• Instant transaction finality\n" +
        "• Secure cross-chain message passing\n\n" +
        "Would you like to learn more about any specific security feature?",
    },
    integration: {
      keywords: ["integrate", "integration", "how to use", "implement"],
      response:
        "Integrating with Espresso Network is straightforward! 🛠️\n\n" +
        "We support:\n" +
        "• Arbitrum Orbit\n" +
        "• Optimism Stack\n" +
        "• Polygon CDK\n" +
        "• Cartesi\n\n" +
        "Current testnet endpoints:\n" +
        "• Cappuccino (main testnet)\n" +
        "• Sepolia (Ethereum testnet)\n\n" +
        "Would you like to try a test transaction?",
    },
  };

  constructor(
    agentId: string = "agent-" + Math.random().toString(36).substring(7)
  ) {
    this.eliza = new ElizaBot();
    this.agentId = agentId;
  }

  private findMatchingTopic(input: string): string | null {
    const normalizedInput = input.toLowerCase();
    for (const [topic, data] of Object.entries(this.espressoTopics)) {
      if (data.keywords.some((keyword) => normalizedInput.includes(keyword))) {
        return data.response;
      }
    }
    return null;
  }

  async parseIntent(userInput: string): Promise<Intent> {
    const input = userInput.toLowerCase();

    // Handle greetings and general inquiries
    if (input.match(/^(hi|hello|hey|gm|ho|yes|please)/)) {
      return {
        intent: "normalChat",
        generalResponse:
          "Hi! I'm excited to introduce you to Espresso Network's revolutionary features! 🚀\n\n" +
          "We specialize in:\n" +
          "1. ⚡ Lightning-fast cross-chain transfers using HotShot consensus\n" +
          "2. 🔄 Secure token swaps across multiple chains\n" +
          "3. 🌐 Integration with major L2s like Arbitrum, Optimism, and Polygon\n\n" +
          "Would you like to:\n" +
          "• Learn about our HotShot consensus technology?\n" +
          "• Try a cross-chain transfer?\n" +
          "• Explore our integration options?\n\n" +
          "Just ask about any topic or type 'transfer' or 'swap' to get started!",
      };
    }

    // Check for Espresso-specific topics
    const topicResponse = this.findMatchingTopic(input);
    if (topicResponse) {
      return {
        intent: "normalChat",
        generalResponse: topicResponse,
      };
    }

    // Handle help or info requests
    if (
      input.includes("help") ||
      input.includes("info") ||
      input.includes("what") ||
      input.includes("about")
    ) {
      return {
        intent: "normalChat",
        generalResponse:
          "I can help you with Espresso Network operations:\n\n" +
          "🚀 Cross-chain Transfers:\n" +
          "   transfer 0.1 ETH to 0x... on sepolia\n\n" +
          "🔄 Token Swaps:\n" +
          "   swap 0.1 ETH to USDC on cappuccino\n\n" +
          "💼 Balance Checks:\n" +
          "   balance of 0x...\n\n" +
          "Which operation would you like to try?",
      };
    }

    // Handle transfer keyword
    if (input === "transfer") {
      return {
        intent: "normalChat",
        generalResponse:
          "To make a cross-chain transfer on Espresso Network:\n\n" +
          "Format: transfer [amount] ETH to [address] on [chain]\n" +
          "Example: transfer 0.1 ETH to 0x742d35Cc6634C0532925a3b844Bc454e4438f44e on sepolia\n\n" +
          "Available chains:\n" +
          "• cappuccino (testnet)\n" +
          "• sepolia\n\n" +
          "Transfers are confirmed within seconds using our HotShot consensus! 🚀",
      };
    }

    // Handle swap keyword
    if (input === "swap") {
      return {
        intent: "normalChat",
        generalResponse:
          "To perform a token swap on Espresso Network:\n\n" +
          "Format: swap [amount] [fromToken] to [toToken] on [chain]\n" +
          "Example: swap 0.1 ETH to USDC on cappuccino\n\n" +
          "Available tokens:\n" +
          "• ETH\n" +
          "• USDC\n" +
          "• USDT\n" +
          "• DAI\n\n" +
          "Available chains:\n" +
          "• cappuccino (testnet)\n" +
          "• sepolia\n\n" +
          "Experience lightning-fast swaps with instant confirmations! ⚡",
      };
    }

    // Parse cross-chain transfer commands
    const transferMatch = input.match(
      /transfer\s+([\d.]+)\s*(?:eth)?\s+to\s+(0x[a-fA-F0-9]{40})(?:\s+(?:on|from)\s+(\w+))?/i
    );
    if (transferMatch) {
      const [, amount, address, chain = "cappuccino"] = transferMatch;
      return {
        intent: "transfer",
        amount: parseFloat(amount),
        recipientAddress: address,
        sourceChain: chain,
        targetChain: chain,
        generalResponse: `🚀 Initiating transfer of ${amount} ETH to ${address} on ${chain}...\n\nTransaction will be confirmed in seconds by Espresso's HotShot consensus!`,
      };
    }

    // Parse cross-chain swap commands
    const swapMatch = input.match(
      /swap\s+([\d.]+)\s+(\w+)\s+to\s+(\w+)(?:\s+on\s+(\w+))?/i
    );
    if (swapMatch) {
      const [, amount, sourceToken, destToken, chain = "cappuccino"] =
        swapMatch;
      return {
        intent: "swap",
        amount: parseFloat(amount),
        sourceToken: sourceToken.toUpperCase(),
        destinationToken: destToken.toUpperCase(),
        sourceChain: chain,
        targetChain: chain,
        generalResponse: `⚡ Initiating swap of ${amount} ${sourceToken} to ${destToken} on ${chain}...\n\nEspresso Network will process this instantly!`,
      };
    }

    // Parse balance check commands
    const balanceMatch = input.match(
      /balance\s+(?:of\s+)?(0x[a-fA-F0-9]{40})(?:\s+on\s+(\w+))?/i
    );
    if (balanceMatch) {
      const [, address, chain = "cappuccino"] = balanceMatch;
      return {
        intent: "checkBalance",
        walletAddress: address,
        sourceChain: chain,
        generalResponse: `Checking balance on ${chain}... 💼`,
      };
    }

    // Parse coordination commands
    const coordinateMatch = input.match(
      /coordinate\s+(?:with|between)\s+(\w+)(?:\s+and\s+(\w+))?/i
    );
    if (coordinateMatch) {
      const [, chain1, chain2 = "cappuccino"] = coordinateMatch;
      return {
        intent: "coordinate",
        sourceChain: chain1,
        targetChain: chain2,
        generalResponse: `Agent ${this.agentId} coordinating between ${chain1} and ${chain2}...`,
      };
    }

    // Default response for unknown inputs
    return {
      intent: "normalChat",
      generalResponse:
        "I'm your XpresAI assistant on the Espresso Network! I can help you with:\n\n" +
        "📚 Learn about:\n" +
        "• HotShot consensus\n" +
        "• Network security\n" +
        "• Integration options\n\n" +
        "🔧 Operations:\n" +
        "• Cross-chain transfers\n" +
        "• Token swaps\n" +
        "• Balance checks\n\n" +
        "What would you like to know more about?",
    };
  }

  getAgentId(): string {
    return this.agentId;
  }
}
