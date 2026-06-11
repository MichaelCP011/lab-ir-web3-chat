"use client";
import { useState, useEffect } from "react";
import { BrowserProvider, Contract } from "ethers";
import { contractAddress, abi } from "../constants";

export default function Home() {
  const [account, setAccount] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const connectWallet = async () => {
    if (typeof window !== "undefined" && (window as any).ethereum) {
      try {
        const provider = new BrowserProvider((window as any).ethereum);
        const accounts = await provider.send("eth_requestAccounts", []);
        setAccount(accounts[0]);
        fetchMessages(provider);
      } catch (error) {
        console.error("Gagal connect wallet:", error);
      }
    } else {
      alert("Tolong install MetaMask terlebih dahulu!");
    }
  };
  const fetchMessages = async (provider: BrowserProvider) => {
    try {
      const contract = new Contract(contractAddress, abi, provider);
      const data = await contract.getMessages();
      setMessages(data);
    } catch (error) {
      console.error("Gagal mengambil pesan:", error);
    }
  };

  const sendMessage = async () => {
    if (!input || !account) return;
    try {
      const provider = new BrowserProvider((window as any).ethereum);
      const signer = await provider.getSigner();
      const contract = new Contract(contractAddress, abi, signer);
      
      // Memanggil fungsi sendMessage di Solidity
      const tx = await contract.sendMessage(input);
      alert("Menunggu konfirmasi jaringan Sepolia...");
      
      await tx.wait(); 
      
      setInput(""); 
      fetchMessages(provider);
    } catch (error) {
      console.error("Gagal mengirim pesan:", error);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center p-10 bg-gray-50">
      <h1 className="text-3xl font-bold mb-8 text-blue-600">Lab IR - Web3 Chat</h1>
      
      {/* Tombol akan berubah nama jika sudah terkoneksi */}
      <button 
        onClick={connectWallet}
        className="mb-8 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
      >
        {account ? `Connected: ${account.slice(0, 6)}...${account.slice(-4)}` : "Connect Wallet"}
      </button>

      <div className="w-full max-w-2xl bg-white p-6 rounded-md shadow-md">
        <div className="h-64 border border-gray-200 mb-4 rounded-md p-4 overflow-y-auto flex flex-col gap-2">
          {messages.length === 0 ? (
            <p className="text-gray-500 text-center mt-20">Belum ada pesan. Ayo mulai obrolan!</p>
          ) : (
            messages.map((msg, index) => (
              <div key={index} className="p-3 bg-gray-100 rounded-md">
                <p className="text-xs text-gray-500 font-mono mb-1">
                  Dari: {msg.sender.slice(0, 6)}...{msg.sender.slice(-4)}
                </p>
                <p className="text-gray-800">{msg.content}</p>
              </div>
            ))
          )}
        </div>
        
        <div className="flex gap-2">
          <input
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ketik pesanmu..." 
            className="flex-1 border border-gray-300 rounded-md px-4 py-2 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <button 
            onClick={sendMessage}
            className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition"
          >
            Kirim
          </button>
        </div>
      </div>
    </main>
  );
}