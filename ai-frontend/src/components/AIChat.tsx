'use client';

import React, { useState, useRef, useEffect } from 'react'
import ElizaBot from 'elizabot'
import { ethers } from 'ethers'
import characterConfig from '../config/character.json'
import { AgentRuntime } from '../lib/AgentRuntime'
import { Character } from '../lib/types'
import { IntentParser } from '../lib/intentParser'
import { TokenBalances } from './TokenBalances'

interface Message {
  text: string
  sender: 'user' | 'ai'
  timestamp: number
  action?: {
    type: 'transfer' | 'swap' | 'balance'
    data?: TransferAction | SwapAction | BalanceData
    confirmationId?: string
    status?: 'pending' | 'confirmed' | 'failed'
  }
}

interface TransferAction {
  fromChain: string
  targetChain: string
  amount: string
  toAddress: string
  token: string | null
}

interface SwapAction {
  fromToken: string
  toToken: string
  amount: string
  chain: string
}

interface BalanceData {
  address: string
  balance: string
  chain: string
}

interface AgentState {
  id: string;
  chain: string;
  balance: string;
  status: 'idle' | 'processing' | 'confirming';
}

interface TransactionResponse {
  text: string
  confirmationId?: string
  status: 'pending' | 'confirmed' | 'failed'
  type?: 'transfer' | 'swap' | 'balance'
  data?: TransferAction | SwapAction | BalanceData
}

export const AIChat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [account, setAccount] = useState<string | null>(null)
  const [balance, setBalance] = useState<string | null>(null)
  const [chainInfo, setChainInfo] = useState<{ nativeCurrency: { symbol: string } } | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const elizaRef = useRef<ElizaBot>(new ElizaBot())
  const agentRef = useRef<AgentRuntime>(new AgentRuntime({
    character: characterConfig,
    provider: new ethers.JsonRpcProvider(process.env.VITE_RPC_URL || 'https://rpc.sepolia.org'),
    espressoRpcUrl: process.env.VITE_ESPRESSO_RPC_URL || 'https://query.cappuccino.testnet.espresso.network/v0'
  }))
  const intentParser = useRef(new IntentParser())
  const [agents, setAgents] = useState<AgentState[]>([
    { id: 'agent-1', chain: 'cappuccino', balance: '0', status: 'idle' },
    { id: 'agent-2', chain: 'sepolia', balance: '0', status: 'idle' }
  ]);

  useEffect(() => {
    // Add initial greeting
    const initialMessage: Message = {
      text: characterConfig.responses.greeting,
      sender: 'ai',
      timestamp: Date.now()
    }
    setMessages([initialMessage])
  }, [])

  // Add confirmation polling
  useEffect(() => {
    const pollConfirmations = async () => {
      const pendingMessages = messages.filter(
        msg => msg.action?.confirmationId && msg.action.status === 'pending'
      );

      for (const msg of pendingMessages) {
        if (msg.action?.confirmationId) {
          try {
            const isConfirmed = await agentRef.current.checkConfirmation(msg.action.confirmationId);
            if (isConfirmed) {
              setMessages(prev => prev.map(m => 
                m.timestamp === msg.timestamp
                  ? {
                      ...m,
                      action: { ...m.action!, status: 'confirmed' },
                      text: m.text + '\n\n✅ Transaction confirmed by Espresso Network!'
                    }
                  : m
              ));
            }
          } catch (error) {
            console.error('Error checking confirmation:', error);
          }
        }
      }
    };

    const interval = setInterval(pollConfirmations, 5000); // Poll every 5 seconds
    return () => clearInterval(interval);
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Add effect to get wallet info
  useEffect(() => {
    const getWalletInfo = async () => {
      try {
        if (window.ethereum) {
          const provider = new ethers.BrowserProvider(window.ethereum);
          const accounts = await provider.send("eth_requestAccounts", []);
          const address = accounts[0];
          setAccount(address);

          // Get balance
          const balance = await provider.getBalance(address);
          setBalance(ethers.formatEther(balance));

          // Get chain info
          const network = await provider.getNetwork();
          setChainInfo({
            nativeCurrency: {
              symbol: network.name === 'sepolia' ? 'SEP' : 'ETH'
            }
          });
        }
      } catch (error) {
        console.error('Failed to get wallet info:', error);
      }
    };

    getWalletInfo();
  }, []);

  const handleUserInput = async (input: string): Promise<TransactionResponse> => {
    const intent = await intentParser.current.parseIntent(input)
    
    switch (intent.intent) {
      case 'transfer':
        if (intent.amount && intent.recipientAddress) {
          return handleTransferAction({
            fromChain: 'cappuccino',
            targetChain: 'sepolia',
            amount: intent.amount.toString(),
            toAddress: intent.recipientAddress,
            token: null
          })
        }
        return {
          text: "Please provide the amount and recipient address for the transfer.",
          status: 'failed'
        }

      case 'swap':
        if (intent.amount && intent.sourceToken && intent.destinationToken) {
          return handleSwapAction({
            fromToken: intent.sourceToken,
            toToken: intent.destinationToken,
            amount: intent.amount.toString(),
            chain: 'cappuccino'
          })
        }
        return {
          text: "Please provide the amount and tokens for the swap.",
          status: 'failed'
        }

      case 'checkBalance':
        try {
          const chain = intent.sourceChain || 'cappuccino';
          // If no specific address provided, use connected wallet
          const address = intent.walletAddress || await agentRef.current.getWalletAddress();
          
          if (!address) {
            return {
              text: "Please connect your wallet or provide an address to check balance.",
              status: 'failed'
            };
          }

          const balance = await agentRef.current.executeAction('getBalance', {
            address,
            chain
          });
          
          return {
            text: `💰 Balance for ${address}:\n${balance} ETH on ${chain}`,
            status: 'confirmed',
            type: 'balance',
            data: {
              address,
              balance,
              chain
            }
          };
        } catch (error: any) {
          return {
            text: `Failed to get balance: ${error.message}`,
            status: 'failed'
          };
        }

      default:
        return {
          text: intent.generalResponse,
          status: 'failed'
        }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isProcessing) return

    const userMessage: Message = {
      text: input,
      sender: 'user',
      timestamp: Date.now()
    }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsProcessing(true)

    try {
      const response = await handleUserInput(input)

      const aiMessage: Message = {
        text: response.text,
        sender: 'ai',
        timestamp: Date.now(),
        action: {
          type: response.type || 'transfer',
          data: response.data,
          confirmationId: response.confirmationId,
          status: response.status
        }
      }

      // If it's a transfer that succeeded but Espresso failed, still show success
      if (response.type === 'transfer' && !response.confirmationId && response.status === 'confirmed') {
        aiMessage.text = `🚀 Transfer successful!
${response.text}

Note: Espresso Network confirmation is temporarily unavailable, but your transaction is confirmed on the blockchain.`;
      }

      setMessages(prev => [...prev, aiMessage])
    } catch (error) {
      console.error('Error processing message:', error)
      const errorMessage: Message = {
        text: characterConfig.responses.error,
        sender: 'ai',
        timestamp: Date.now()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsProcessing(false)
    }
  }

  const parseTransferCommand = (input: string): TransferAction | null => {
    const transferRegex = /transfer\s+([\d.]+)\s*(?:ETH)?\s+to\s+(0x[a-fA-F0-9]{40})\s+(?:on\s+)?(\w+)?/i
    const match = input.match(transferRegex)
    
    if (match) {
      const [, amount, toAddress, chain = 'sepolia'] = match
      return {
        fromChain: chain.toLowerCase(),
        targetChain: chain.toLowerCase(),
        amount,
        toAddress,
        token: null
      }
    }
    return null
  }

  const handleTransferAction = async (transfer: TransferAction): Promise<TransactionResponse> => {
    try {
      // Update agent status
      setAgents(prev => prev.map(agent => 
        agent.id === intentParser.current.getAgentId()
          ? { ...agent, status: 'processing' }
          : agent
      ));

      // Execute the transfer with correct parameters
      const result = await agentRef.current.executeAction('transfer', {
        toAddress: transfer.toAddress,
        amount: transfer.amount,
        chain: transfer.targetChain,
        token: transfer.token
      });
      
      if (!result || !result.hash) {
        throw new Error('Transfer failed - no transaction hash received');
      }

      // Update agent status based on whether we got a confirmation ID
      setAgents(prev => prev.map(agent => 
        agent.id === intentParser.current.getAgentId()
          ? { ...agent, status: result.confirmationId ? 'confirming' : 'idle' }
          : agent
      ));

      // Build the transaction details
      const txDetails = `Transaction Details:
Hash: ${result.hash}
Amount: ${result.amount} ETH
From: ${result.from}
To: ${result.to} on ${result.chain}${result.explorerUrl ? `\nExplorer: ${result.explorerUrl}` : ''}`;

      // Build the status message
      const statusMessage = result.confirmationId 
        ? '\n\n⏳ Waiting for Espresso Network confirmation...'
        : '\n\n✅ Transaction confirmed on blockchain!';

      return {
        text: `🚀 Transfer initiated by Agent ${intentParser.current.getAgentId()}!\n\n${txDetails}${statusMessage}`,
        confirmationId: result.confirmationId,
        status: result.confirmationId ? 'pending' : 'confirmed',
        type: 'transfer',
        data: transfer
      };
    } catch (error: any) {
      // Reset agent status
      setAgents(prev => prev.map(agent => 
        agent.id === intentParser.current.getAgentId()
          ? { ...agent, status: 'idle' }
          : agent
      ));

      console.error('Transfer error:', error);
      return {
        text: `Transfer failed: ${error.message || 'Unknown error'}`,
        status: 'failed'
      };
    }
  };

  const parseSwapCommand = (input: string): SwapAction | null => {
    const swapRegex = /swap\s+([\d.]+)\s+(\w+)\s+to\s+(\w+)(?:\s+on\s+(\w+))?/i
    const match = input.match(swapRegex)
    
    if (match) {
      const [, amount, fromToken, toToken, chain = 'sepolia'] = match
      return {
        fromToken: fromToken.toUpperCase(),
        toToken: toToken.toUpperCase(),
        amount,
        chain: chain.toLowerCase()
      }
    }
    return null
  }

  const handleSwapAction = async (swap: SwapAction): Promise<TransactionResponse> => {
    try {
      // Update agent status
      setAgents(prev => prev.map(agent => 
        agent.id === intentParser.current.getAgentId()
          ? { ...agent, status: 'processing' }
          : agent
      ));

      const result = await agentRef.current.executeAction('swap', swap);
      
      // Update agent status to confirming
      setAgents(prev => prev.map(agent => 
        agent.id === intentParser.current.getAgentId()
          ? { ...agent, status: 'confirming' }
          : agent
      ));

      return {
        text: `🔄 Swap initiated by Agent ${intentParser.current.getAgentId()}!
Hash: ${result.hash}
Swapping ${swap.amount} ${swap.fromToken} to ${swap.toToken}
Chain: ${swap.chain}

Waiting for Espresso Network confirmation... ⏳`,
        confirmationId: result.confirmationId,
        status: 'pending',
        type: 'swap',
        data: swap
      };
    } catch (error: any) {
      // Reset agent status
      setAgents(prev => prev.map(agent => 
        agent.id === intentParser.current.getAgentId()
          ? { ...agent, status: 'idle' }
          : agent
      ));

      return {
        text: `Agent ${intentParser.current.getAgentId()} failed: ${error?.message || 'unknown error'}`,
        status: 'failed'
      };
    }
  };

  const generateResponse = (input: string): string => {
    const character = agentRef.current.getCharacter() as Character
    const inputLower = input.toLowerCase()

    // Handle greetings
    if (inputLower.match(/^(hi|hello|hey|gm)/)) {
      return "Hello! I'm excited to help you explore the Espresso Network. Would you like to learn about our fast confirmations, cross-chain capabilities, or how to integrate with our network?"
    }

    // Handle transfer-related queries
    if (inputLower.includes('transfer')) {
      return "It seems like you want to make a transfer! Here's how to do it:\n\n" +
        "Just type your transfer command in this format:\n" +
        "transfer [amount] to [address] on [chain]\n\n" +
        "For example:\n" +
        "transfer 0.0001 ETH to 0x742d35Cc6634C0532925a3b844Bc454e4438f44e on sepolia\n\n" +
        "Supported chains: sepolia, arbitrum, optimism\n" +
        "Note: Chain name is optional, defaults to sepolia"
    }

    // Handle swap-related queries
    if (inputLower.includes('swap')) {
      return "It looks like you want to swap tokens! Here's how to do it:\n\n" +
        "Just type your swap command in this format:\n" +
        "swap [amount] [fromToken] to [toToken] on [chain]\n\n" +
        "For example:\n" +
        "swap 0.1 ETH to USDC on arbitrum\n\n" +
        "Supported tokens: ETH, USDC, USDT, DAI\n" +
        "Supported chains: sepolia, arbitrum, optimism\n" +
        "Note: Chain name is optional, defaults to sepolia"
    }

    // Handle "tell me more" or general interest
    if (inputLower.includes('tell me more') || inputLower.includes('more information')) {
      const topics = [
        "Our HotShot consensus protocol confirms transactions within seconds, making cross-chain operations lightning fast.",
        "With 100 decentralized nodes in Mainnet 0, we ensure robust and reliable transaction processing.",
        "We offer low-cost data availability as an alternative to Ethereum, helping reduce operational costs.",
        "Our network prevents sequencer equivocation and protects against reorgs, enhancing security."
      ]
      return topics[Math.floor(Math.random() * topics.length)] + "\n\nWhat aspect would you like to explore further?"
    }

    // Handle help request
    if (inputLower.includes('help')) {
      return "I'd be happy to help! Here are some topics I can explain:\n\n" +
        "🚀 Fast Confirmations: Learn about our HotShot consensus\n" +
        "🔗 Cross-chain Operations: Explore our integration capabilities\n" +
        "🔐 Security Features: Understand our protection mechanisms\n" +
        "🛠️ Integration Guide: Get started with Arbitrum, Cartesi, OP stack, or Polygon CDK\n\n" +
        "Which topic interests you?"
    }

    // Default response with context
    const lore = character.lore[Math.floor(Math.random() * character.lore.length)]
    return `${lore}\n\nWould you like to know more about how this works or explore other features of the Espresso Network?`
  }

  return (
    <div className="bg-cream shadow-warm border border-mocha/10 rounded-xl h-[600px] flex flex-col backdrop-blur-sm">
      {/* Agent Status Bar */}
      <div className="border-b border-mocha/10 p-2 bg-cream/50 flex space-x-4">
        {agents.map(agent => (
          <div key={agent.id} className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${
              agent.status === 'idle' ? 'bg-green-500' :
              agent.status === 'processing' ? 'bg-yellow-500' :
              'bg-blue-500'
            }`} />
            <span className="text-sm text-mocha/70">{agent.id}</span>
            <span className="text-xs text-mocha/50">{agent.chain}</span>
          </div>
        ))}
      </div>

      <div className="flex flex-1">
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg, idx) => (
            <div
              key={msg.timestamp + idx}
              className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-xl p-3 shadow-inner-warm ${
                  msg.sender === 'user'
                    ? 'bg-mocha text-cream'
                    : 'bg-accent-peach/20 text-mocha'
                }`}
              >
                {msg.text}
                {msg.action && msg.action.type === 'transfer' && msg.action.data && 'fromChain' in msg.action.data && (
                  <div className="bg-cream/80 rounded-lg p-3 text-mocha border border-mocha/10">
                    <span className="text-mocha-light font-medium">Transfer Details:</span>
                    <br />
                    <span className="text-mocha/70">From Chain:</span> {msg.action.data.fromChain}
                    <br />
                    <span className="text-mocha/70">To Chain:</span> {msg.action.data.targetChain}
                    <br />
                    <span className="text-mocha/70">Amount:</span> {msg.action.data.amount} ETH
                    <br />
                    <span className="text-mocha/70">To:</span> {msg.action.data.toAddress}
                    <br />
                    <span className="text-mocha/70">Status:</span> {msg.action.status || 'pending'}
                  </div>
                )}
                {msg.action && msg.action.type === 'swap' && msg.action.data && 'fromToken' in msg.action.data && (
                  <div className="bg-cream/80 rounded-lg p-3 text-mocha border border-mocha/10">
                    <span className="text-mocha-light font-medium">Swap Details:</span>
                    <br />
                    <span className="text-mocha/70">From:</span> {msg.action.data.amount} {msg.action.data.fromToken}
                    <br />
                    <span className="text-mocha/70">To:</span> {msg.action.data.toToken}
                    <br />
                    <span className="text-mocha/70">Chain:</span> {msg.action.data.chain}
                    <br />
                    <span className="text-mocha/70">Status:</span> {msg.action.status || 'pending'}
                  </div>
                )}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Token Balances Panel */}
        <div className="w-80 p-4 border-l border-mocha/10">
          <TokenBalances 
            account={account}
            balance={balance}
            chainInfo={chainInfo}
          />
        </div>
      </div>

      {/* Input Area */}
      <div className="border-t border-mocha/10 p-4 bg-cream/50">
        <form onSubmit={handleSubmit} className="flex space-x-4">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            disabled={isProcessing}
            className="flex-1 bg-cream-light text-mocha rounded-xl border border-mocha/10 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-accent-peach focus:border-transparent disabled:bg-cream-dark/50 placeholder-mocha/50"
          />
          <button
            type="submit"
            disabled={isProcessing}
            className="bg-mocha text-cream px-6 py-2 rounded-xl hover:bg-mocha-light transition-colors disabled:bg-mocha/50 shadow-warm"
          >
            {isProcessing ? 'Processing...' : 'Send'}
          </button>
        </form>
      </div>
    </div>
  )
} 