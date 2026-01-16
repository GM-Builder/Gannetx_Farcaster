import React, { useEffect, useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    MessageSquare, Send, Clock, X, Wallet, CheckCircle, Loader2
} from 'lucide-react';
import { useWalletState } from '@/hooks/useWalletState';
import GannetXABI from '@/abis/GannetXInteractiveChat.json';
import { ethers } from 'ethers';
import { BASE_CHAIN_ID, GANNETX_CHAT_CONTRACT_ADDRESS, BASE_RPC } from '@/utils/constants';
import toast from 'react-hot-toast';
import { Name } from '@coinbase/onchainkit/identity';

const CONTRACT_ADDRESS = GANNETX_CHAT_CONTRACT_ADDRESS;
const CHECKIN_FEE = ethers.utils.parseEther('0.000001');

interface GMMessage {
    user: string;
    timestamp: number;
    message: string;
}

const shortAddr = (a?: string) => (a ? `${a.substring(0, 6)}...${a.substring(a.length - 4)}` : '');

const ChatView: React.FC = () => {
    const { web3State, connectWallet, switchNetwork } = useWalletState();
    const [recentGMs, setRecentGMs] = useState<GMMessage[]>([]);
    const [input, setInput] = useState('');
    const [busy, setBusy] = useState(false);
    const [timeLeft, setTimeLeft] = useState<number>(0);
    const [isLoadingMessages, setIsLoadingMessages] = useState(true);
    const [colorMap, setColorMap] = useState<Record<string, string>>({});

    const listRef = useRef<HTMLDivElement | null>(null);
    const inputRef = useRef<HTMLInputElement | null>(null);

    const providerForReads = useCallback((): ethers.providers.Provider => {
        // Use web3State provider if on Base, else JsonRpcProvider
        if (web3State.provider && web3State.chainId === BASE_CHAIN_ID) {
            return web3State.provider;
        }
        return new ethers.providers.JsonRpcProvider(BASE_RPC, BASE_CHAIN_ID);
    }, [web3State.provider, web3State.chainId]);

    const scrollToBottom = useCallback((smooth = false) => {
        try {
            const el = listRef.current;
            if (el) {
                el.scrollTo({
                    top: el.scrollHeight,
                    behavior: smooth ? 'smooth' : 'auto'
                });
            }
        } catch (e) {
            console.error('Scroll error:', e);
        }
    }, []);

    const loadRecent = useCallback(async () => {
        try {
            setIsLoadingMessages(true);
            const provider = providerForReads();
            const contract = new ethers.Contract(CONTRACT_ADDRESS, GannetXABI, provider);
            // Ensure specific paginated call
            const raw: any[] = await contract.getRecentGMsPaginated(0, 80);
            const parsed = raw.map((r: any) => ({
                user: r.user,
                timestamp: Number(r.timestamp),
                message: r.message,
            }));
            const sorted = parsed.sort((a, b) => a.timestamp - b.timestamp);
            setRecentGMs(sorted);
            setTimeout(() => scrollToBottom(false), 100);
        } catch (e) {
            console.error('Failed to load recent GMs', e);
            // toast.error('Failed to load messages'); // Silent fail or retry might be better
        } finally {
            setIsLoadingMessages(false);
        }
    }, [providerForReads, scrollToBottom]);

    const refreshCooldown = useCallback(async () => {
        if (!web3State.address) return;
        try {
            const provider = providerForReads();
            const contract = new ethers.Contract(CONTRACT_ADDRESS, GannetXABI, provider);
            const t: ethers.BigNumber = await contract.timeUntilNextCheckin(web3State.address);
            setTimeLeft(t.toNumber());
        } catch (e) { console.error(e); }
    }, [web3State.address, providerForReads]);

    useEffect(() => {
        loadRecent();
        const iv = setInterval(() => { loadRecent(); refreshCooldown(); }, 5000); // Polling every 5s
        return () => clearInterval(iv);
    }, [loadRecent, refreshCooldown]);

    useEffect(() => {
        if (web3State.address) refreshCooldown();
    }, [web3State.address, refreshCooldown]);

    useEffect(() => {
        if (timeLeft > 0) {
            const t = setInterval(() => setTimeLeft(s => Math.max(0, s - 1)), 1000);
            return () => clearInterval(t);
        }
    }, [timeLeft]);

    const handleSend = async () => {
        if (busy || !input.trim()) return;

        if (!web3State.isConnected) {
            connectWallet();
            return;
        }
        if (web3State.chainId !== BASE_CHAIN_ID) {
            await switchNetwork(BASE_CHAIN_ID);
            return;
        }

        try {
            setBusy(true);
            const signer = web3State.signer;
            if (!signer) throw new Error("No signer");

            const contract = new ethers.Contract(CONTRACT_ADDRESS, GannetXABI, signer);
            // Check cooldown again
            const ttl = await contract.timeUntilNextCheckin(web3State.address);
            if (ttl.toNumber() > 0) {
                setTimeLeft(ttl.toNumber());
                toast.error(`Cooldown: ${ttl.toNumber()}s`);
                return;
            }

            const tx = await contract.checkIn(input.trim(), { value: CHECKIN_FEE });
            toast.loading('Sending GM...', { id: 'gm' });
            await tx.wait();
            toast.success('GM sent!', { id: 'gm' });
            setInput('');
            loadRecent();
            refreshCooldown();
        } catch (e: any) {
            console.error(e);
            toast.error(e.reason || e.message || 'Failed', { id: 'gm' });
        } finally {
            setBusy(false);
        }
    };

    const isOwnMessage = (u: string) => web3State.address?.toLowerCase() === u.toLowerCase();

    const colorForAddress = (addr: string) => {
        if (colorMap[addr]) return colorMap[addr];
        let h = 0;
        for (let i = 2; i < addr.length; i++) h = (h * 31 + addr.charCodeAt(i)) % 360;
        const c = `hsl(${h}deg 65% 50%)`;
        setColorMap(p => ({ ...p, [addr]: c }));
        return c;
    };

    return (
        <div className="flex flex-col h-[calc(100vh-80px)] bg-[#050608] text-white overflow-hidden pb-16">
            {/* Header */}
            <div className="flex-shrink-0 p-4 border-b border-white/5 bg-[#0B0E14]/80 backdrop-blur flex justify-between items-center z-10">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-cyan-500/10 rounded-lg text-cyan-400">
                        <MessageSquare className="w-5 h-5" />
                    </div>
                    <div>
                        <h2 className="font-bold text-lg">Chat</h2>
                        <p className="text-xs text-gray-500">{recentGMs.length} messages • Base</p>
                    </div>
                </div>
                {!web3State.isConnected && (
                    <button onClick={connectWallet} className="px-3 py-1.5 bg-cyan-500/20 text-cyan-400 text-xs rounded-lg border border-cyan-500/30 flex items-center gap-2">
                        <Wallet className="w-3 h-3" /> Connect
                    </button>
                )}
            </div>

            {/* Messages */}
            <div ref={listRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-[#0B0E14] to-[#050608]">
                {isLoadingMessages && recentGMs.length === 0 ? (
                    <div className="flex justify-center mt-10"><Loader2 className="w-8 h-8 text-cyan-500 animate-spin" /></div>
                ) : recentGMs.length === 0 ? (
                    <div className="text-center text-gray-500 mt-10">No messages yet. Say GM!</div>
                ) : (
                    recentGMs.map((m, i) => {
                        const isOwn = isOwnMessage(m.user);
                        return (
                            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}>
                                <div className="text-[10px] text-gray-500 mb-1 px-1 flex items-center gap-1">
                                    <Name address={m.user as `0x${string}`} className="text-gray-500" />
                                    {isOwn && <span>(you)</span>}
                                </div>
                                <div
                                    className={`px-4 py-2 rounded-2xl max-w-[80%] break-words ${isOwn ? 'bg-cyan-600 text-white rounded-tr-sm' : 'text-white rounded-tl-sm'}`}
                                    style={!isOwn ? { background: colorForAddress(m.user) } : {}}
                                >
                                    {m.message}
                                </div>
                            </motion.div>
                        );
                    })
                )}
            </div>

            {/* Input */}
            <div className="flex-shrink-0 p-4 border-t border-white/5 bg-[#0B0E14]/80 backdrop-blur z-10 bottom-16 absolute w-full">
                {timeLeft > 0 && <div className="text-xs text-amber-500 mb-2 flex items-center gap-2"><Clock className="w-3 h-3" /> Cooldown: {timeLeft}s</div>}
                <div className="flex gap-2">
                    <input
                        ref={inputRef}
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyPress={e => e.key === 'Enter' && handleSend()}
                        disabled={busy || timeLeft > 0}
                        placeholder="Type a message..."
                        className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-cyan-500 outline-none text-sm placeholder-gray-500"
                    />
                    <button
                        onClick={handleSend}
                        disabled={busy || timeLeft > 0 || !input.trim()}
                        className="w-12 h-12 flex items-center justify-center bg-cyan-500 rounded-xl text-white disabled:opacity-50 hover:bg-cyan-600 transition-all shadow-lg shadow-cyan-500/20"
                    >
                        {busy ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                    </button>
                </div>
                <div className="text-center text-[10px] text-gray-600 mt-2">Fee: 0.000001 ETH • Earn XP by chatting</div>
            </div>
        </div>
    );
};

export default ChatView;
