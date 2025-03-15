import React, { useState } from "react";

function App() {
  // REACT----State variables to manage form inputs and API responses
  const [tradeId, setTradeId] = useState("");
  const [bidId, setBidId] = useState("");
  const [bidInfo, setBidInfo] = useState("");
  const [bidSecret, setBidSecret] = useState("");
  const [responseMessage, setResponseMessage] = useState("");

  // Function to call the backend API for starting a trade
  const handleStartTrade = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/start-trade", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ tradeId }),
      });

      if (!response.ok) {
        throw new Error("Failed to start trade");
      }

      const data = await response.json();
      setResponseMessage(`Trade started successfully: ${data.tradeId}`);
    } catch (error) {
      console.error("Error starting trade:", error);
      setResponseMessage("Failed to start trade!");
    }
  };

  // Function to call the backend API for placing a deposit
  const handlePlaceDeposit = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/place-deposit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ bidId, bidInfo }),
      });

      if (!response.ok) {
        throw new Error("Failed to place deposit");
      }

      const data = await response.json();
      setResponseMessage(`Deposit placed successfully for Bid ID: ${data.bidId}`);
    } catch (error) {
      console.error("Error placing deposit:", error);
      setResponseMessage("Failed to place deposit!");
    }
  };

  // Function to call the backend API for finalizing the auction
  const handleFinalizeAuction = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/finalize-auction", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ bidSecret }),
      });

      if (!response.ok) {
        throw new Error("Failed to finalize auction");
      }

      const data = await response.json();
      setResponseMessage(`Auction finalized: ${data.message}`);
    } catch (error) {
      console.error("Error finalizing auction:", error);
      setResponseMessage("Failed to finalize auction!");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 md:px-10">
      <div className="max-w-4xl mx-auto bg-white shadow-md rounded-lg p-6">
        {/* Header */}
        <h1 className="text-3xl font-bold text-blue-500 text-center mb-8">
          Carbon Trading System
        </h1>

        {/* Connected Account and Contract Owner */}
        <div className="mb-6">
          <p className="text-lg font-medium text-gray-700">
            <span className="font-bold">Connected Account:</span> [Your Account]
          </p>
          <p className="text-lg font-medium text-gray-700">
            <span className="font-bold">Contract Owner:</span> [Owner Address]
          </p>
        </div>

        {/* Start Trade Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Start Trade</h2>
          <div className="flex gap-4">
            <input
              type="text"
              placeholder="Trade ID"
              value={tradeId}
              onChange={(e) => setTradeId(e.target.value)} // Update tradeId state
              className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleStartTrade} // Call API
              className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg shadow"
            >
              Start Trade
            </button>
          </div>
        </div>

        {/* Deposit Management Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Deposit Management
          </h2>
          <div className="flex flex-col md:flex-row gap-4">
            <input
              type="text"
              placeholder="Bid ID"
              value={bidId}
              onChange={(e) => setBidId(e.target.value)} // Update bidId state
              className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              placeholder="Bid Info"
              value={bidInfo}
              onChange={(e) => setBidInfo(e.target.value)} // Update bidInfo state
              className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handlePlaceDeposit} // Call API
              className="px-6 py-2 bg-green-500 hover:bg-green-600 text-white font-medium rounded-lg shadow"
            >
              Place Deposit
            </button>
            <button className="px-6 py-2 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg shadow">
              Refund Deposit
            </button>
          </div>
        </div>

        {/* Bidding Process Section */}
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Bidding Process
          </h2>
          <div className="flex flex-col md:flex-row gap-4">
            <input
              type="text"
              placeholder="Bid Secret"
              value={bidSecret}
              onChange={(e) => setBidSecret(e.target.value)} // Update bidSecret state
              className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button className="px-6 py-2 bg-yellow-500 hover:bg-yellow-600 text-white font-medium rounded-lg shadow">
              Set Bid Info
            </button>
            <button className="px-6 py-2 bg-yellow-500 hover:bg-yellow-600 text-white font-medium rounded-lg shadow">
              Set Bid Secret
            </button>
            <button
              onClick={handleFinalizeAuction} // Call API
              className="px-6 py-2 bg-indigo-500 hover:bg-indigo-600 text-white font-medium rounded-lg shadow"
            >
              Finalize Auction
            </button>
          </div>
        </div>

        {/* Response Message */}
        {responseMessage && (
          <div className="mt-6 bg-gray-100 text-gray-800 p-4 rounded-lg">
            {responseMessage}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;