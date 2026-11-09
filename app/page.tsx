"use client";

import {useState, useEffect, useReducer,} from "react";
import Link from "next/link";

function ChangeIndicator({value}: {value: number}) {
  const className = value > 0 ? "up" : value < 0 ? "down" : "neutral";
  const arrow = value > 0 ? "▲" : value < 0 ? "▼" : "−"; 
  return(
    <span className={className}>
      {arrow} {Math.abs(value).toFixed(1)}%
    </span>
  );
}

function gameReducer(state:GameState, action:GameAction) {
  if (action.type === 'BUY') {
    if (state.balance < action.commodity.currentPrice){
      return state;
    }
    return {
      ...state, 
      balance: state.balance - action.commodity.currentPrice,
      inventory: {
        ...state.inventory, [action.commodity.id]: state.inventory[action.commodity.id] + 1,
      }
    }
  }

    if (action.type === 'SELL') {
      if (state.inventory[action.commodity.id] <= 0){
        return state;
    }
    return {
      ...state, 
      balance: state.balance + action.commodity.currentPrice,
      inventory: {
        ...state.inventory, [action.commodity.id]: state.inventory[action.commodity.id] - 1,
      }
    }
  }

  return state;
};

function InventoryModal({
    isOpen,
    onClose,
    inventory,
    commodities
  }: {
    isOpen: boolean;
    onClose: () => void
    inventory: Record<string, number>;
    commodities: Commodity[];
  }) {
    if (!isOpen) return null;

    return(
      <div className="modal-overlay">
        <div className="modal-content">
          <h2>Your Inventory</h2>
          <button onClick={onClose}>Close</button>

          <div className="inventory-grid">
            {Object.entries(inventory)
            .filter(([commodityId, quantity]) => {
              return quantity > 0;
            })
            .map(([commodityId, quantity]) => {
              const commodity = commodities.find((c) => c.id === commodityId);
              return (
                <div key={commodityId}>
                  {commodity?.commodityName}: {quantity}
                </div>
              );
            })
          }
            </div>
          </div>
        </div>
    );
  }

interface GameState{
  inventory: Record<string, number>
  balance: number
}

interface Commodity {
  id: string;
  commodityName: string;
  currentPrice: number;
  change: number;
}

interface GameAction {
  type: "BUY" | "SELL";
  commodity: Commodity;
}

export default function Home() {
  const [gameState, dispatch] = useReducer(gameReducer, {
    inventory: { tea: 0, spices: 0, iron: 0, wheat: 0, oil: 0, gold: 0 },
    balance: 1000
  });
  const [message, setMessage] = useState("");
  const [isInventoryOpen, setIsInventoryOpen] =useState(false)
  const [commodities, setCommodities] = useState<Commodity[]>([])
  const networth = 
    gameState.balance + 
    Object.entries(gameState.inventory).reduce((total, [commodityId, quantity]) => {
  const commodity = commodities.find((c) => c.id === commodityId );
    return total + quantity * (commodity?.currentPrice ?? 0);
  }, 0)
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMounted(true);
  }, []);
  useEffect (() => {
    const fetchCommodities = async () => {
      const res = await fetch('/api/commodities');
      const data = await res.json();
      const mappedData = data.map((c: Commodity) => ({...c, change:0}))
      setCommodities(mappedData);
    }
    fetchCommodities();
  }, []);
    useEffect(() => {
    const timer = setInterval(() => {
            setCommodities(prevCommodities => {
              return prevCommodities.map((commodity) => {
                const amount = Math.floor(Math.random() * 5) + 1;
                const randomDirection = Math.floor(Math.random() * 2);
                const direction = randomDirection * 2 - 1;
                const pointchange = amount * direction;
                const percentchange = Number(((pointchange / commodity.currentPrice) * 100).toFixed(1));
                return {...commodity, 
                  currentPrice: commodity.currentPrice + pointchange, 
                  change: percentchange,};
              });
            });
    }, 5000);
    return () => clearInterval(timer)
  }, []);

  return (
    <main className="market">
      <header className="market-header">
        <div>
          <h1>Market</h1>
          <p>Global Commodity Exchange</p>
          {message && <p>{message}</p>}
          <button onClick={() => setIsInventoryOpen(true)}>
            Open Inventory
          </button>
        </div>

        <div className="balance">
          <span>Balance</span>
          <strong>${gameState.balance.toFixed(2)}</strong>
          <span>Networth</span>
          <strong>${networth.toFixed(2)}</strong>
        </div>
      </header>
      
      {isMounted && (
      <div>
      <div className="ticker">
            <div className="ticker-track">
              <div className="keyset-a">
                {commodities.map((c) => (
                  <span key = {c.commodityName}>
                    {c.commodityName} <ChangeIndicator value={c.change} /> <span className="sep">•</span>{" "}
                  </span>
                ))}
              </div>
              <div className="keyset-b">
                {commodities.map((c) => (
                  <span key = {c.commodityName}>
                    {c.commodityName} <ChangeIndicator value={c.change} /> <span className="sep">•</span>{" "}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {isMounted && (
      <section className="commodity-grid">
        {commodities.map((commodity) => (
          <article className="commodity-card" key={commodity.commodityName}>
            <h2>{commodity.commodityName}</h2>

            <p className="price">${commodity.currentPrice}</p>

            <p className="change">
              <ChangeIndicator value = {commodity.change} />
            </p>
            <div className="button-group">
            <button className="buy-button"
              onClick={() => {
                if (gameState.balance >= commodity.currentPrice) {
                  dispatch({ type: "BUY", commodity: commodity });
                  setMessage(`You bought ${commodity.commodityName} for $${commodity.currentPrice}`);
                } else {
                  setMessage(`Insufficient money to buy ${commodity.commodityName}`);
                }
              }}>
              Buy
            </button>

            <button className="sell-button"
              onClick={() => {
                if (gameState.inventory[commodity.id] > 0) {
                  dispatch({ type: "SELL", commodity: commodity });
                  setMessage(`You sold ${commodity.commodityName} for $${commodity.currentPrice}`);
                } else {
                  setMessage(`You don't have any ${commodity.commodityName} to sell!`);
                }
              }}>
              Sell
            </button>
            </div>
          </article>
        ))}
      </section>
      )}
      <div className="inventory">
        <h2>Inventory</h2>
        <ul>
          {Object.entries(gameState.inventory).map(([commodityId, quantity]) => {
            const commodity = commodities.find((c) => c.id === commodityId);
            return (
              <li key={commodityId}>
                {commodity?.commodityName}: {quantity}
              </li>
            );
          })}
        </ul>
      </div>
      <div>
        <Link href = "/practice">
        <button>
          Go to practice
        </button>
        </Link>
      </div>
      <InventoryModal 
      isOpen={isInventoryOpen}
      onClose={() => setIsInventoryOpen(false)}
      inventory={gameState.inventory}
      commodities={commodities}
      />
    </main>
  );
}