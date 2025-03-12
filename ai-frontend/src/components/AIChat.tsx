'use client';

import React, { useState, useRef, useEffect } from 'react'
import ElizaBot from 'elizabot'
import { ethers } from 'ethers'
import characterConfig from '../config/character.json'
import { AgentRuntime } from '../lib/AgentRuntime'
import { Character } from '../lib/types'

interface Message {
  text: string
  sender: 'user' | 'ai'
  timestamp: number
  action?: {
    type: 'transfer' | 'swap' | 'balance'
    data?: any
  }
}

interface TransferAction {
  fromChain: string
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

export const AIChat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const elizaRef = useRef<ElizaBot>(new ElizaBot())
  const agentRef = useRef<AgentRuntime>(new AgentRuntime({
    character: characterConfig,
    provider: new ethers.JsonRpcProvider(process.env.VITE_RPC_URL)
  }))

  useEffect(() => {
    // Add initial greeting
    const initialMessage: Message = {
      text: characterConfig.responses.greeting,
      sender: 'ai',
      timestamp: Date.now()
    }
    setMessages([initialMessage])
  }, [])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const parseTransferCommand = (input: string): TransferAction | null => {
    const transferRegex = /transfer\s+([\d.]+)\s*(?:ETH)?\s+to\s+(0x[a-fA-F0-9]{40})\s+(?:on\s+)?(\w+)?/i
    const match = input.match(transferRegex)
    
    if (match) {
      const [, amount, toAddress, chain = 'sepolia'] = match
      return {
        fromChain: chain.toLowerCase(),
        amount,
        toAddress,
        token: null
      }
    }
    return null
  }

  const handleTransferAction = async (transfer: TransferAction) => {
    try {
      const result = await agentRef.current.executeAction('transfer', transfer)
      return `🚀 Transfer initiated ser!
Hash: ${result.hash}
Amount: ${transfer.amount} ETH
To: ${transfer.toAddress}
Chain: ${transfer.fromChain}

WAGMI! 🤝`
    } catch (error: any) {
      return `ngmi ser... transfer failed: ${error?.message || 'unknown error'}`
    }
  }

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

  const handleSwapAction = async (swap: SwapAction) => {
    try {
      const result = await agentRef.current.executeAction('swap', swap)
      return `🔄 Swap initiated!\nHash: ${result.hash}\nSwapping ${swap.amount} ${swap.fromToken} to ${swap.toToken}\nChain: ${swap.chain}\n\nEspresso's fast confirmations will ensure your swap completes quickly! ⚡`
    } catch (error: any) {
      return `Swap failed: ${error?.message || 'Unknown error'}. Please try again.`
    }
  }

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
      const transferAction = parseTransferCommand(input)
      const swapAction = parseSwapCommand(input)
      let response: string
      let action: Message['action']

      if (transferAction) {
        response = await handleTransferAction(transferAction)
        action = { type: 'transfer', data: transferAction }
      } else if (swapAction) {
        response = await handleSwapAction(swapAction)
        action = { type: 'swap', data: swapAction }
      } else {
        response = generateResponse(input)
      }

      const aiMessage: Message = {
        text: response,
        sender: 'ai',
        timestamp: Date.now(),
        action
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

  return (
    <div className="bg-cream shadow-warm border border-mocha/10 rounded-xl h-[600px] flex flex-col backdrop-blur-sm">
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
              {msg.action && (
                <div className="mt-2 text-sm">
                  {msg.action.type === 'transfer' && (
                    <div className="bg-cream/80 rounded-lg p-3 text-mocha border border-mocha/10">
                      <span className="text-mocha-light font-medium">Transfer Details:</span>
                      <br />
                      <span className="text-mocha/70">Chain:</span> {msg.action.data.fromChain}
                      <br />
                      <span className="text-mocha/70">Amount:</span> {msg.action.data.amount} ETH
                      <br />
                      <span className="text-mocha/70">To:</span> {msg.action.data.toAddress}
                    </div>
                  )}
                  {msg.action.type === 'swap' && (
                    <div className="bg-cream/80 rounded-lg p-3 text-mocha border border-mocha/10">
                      <span className="text-mocha-light font-medium">Swap Details:</span>
                      <br />
                      <span className="text-mocha/70">Chain:</span> {msg.action.data.chain}
                      <br />
                      <span className="text-mocha/70">From:</span> {msg.action.data.amount} {msg.action.data.fromToken}
                      <br />
                      <span className="text-mocha/70">To:</span> {msg.action.data.toToken}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
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