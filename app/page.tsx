"use client";

import {useState, useEffect, useReducer,} from "react";
import Link from "next/link";

function ChangeIndicator({value}: {value: number}) {
  return(
    <span className={value >= 0 ? "up" : "down"}>
      {value >= 0 ? "▲" : "▼"} {Math.abs(value).toFixed(1)}%
    </span>
  );
}

function gameReducer(state:GameState, action:GameAction) {
  if (action.type === 'BUY') {
    if (state.balance < action.commodity.price){
      return state;
    }
    return {
      ...state, 
      balance: state.balance - action.commodity.price,
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
      balance: state.balance + action.commodity.price,
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
                  {commodity?.name}: {quantity}
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
  name: string;
  price: number;
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
  const [commodities, setCommodities] = useState([
      {
    id: "tea",
    name: "Tea",
    price: 42,
    change: 2.4,
  },
  {
    id: "spices",
    name: "Spices",
    price: 68,
    change: -1.1,
  },
  {
    id: "iron",
    name: "Iron",
    price: 51,
    change: 0.8,
  },
  {
    id: "wheat",
    name: "Wheat",
    price: 31,
    change: 0.3,
  },
  {
    id: "oil",
    name: "Oil",
    price: 75,
    change: -2.1,
  },
  {
    id: "gold",
    name: "Gold",
    price: 90,
    change: 3.1,
  },  
])
const networth = 
  gameState.balance + 
  Object.entries(gameState.inventory).reduce((total, [commodityId, quantity]) => {
  const commodity = commodities.find((c) => c.id === commodityId );
    return total + quantity * (commodity?.price ?? 0);
  }, 0)  
    useEffect(() => {
    const timer = setInterval(() => {
            setCommodities(prevCommodities => {
              return prevCommodities.map((commodity) => {
                const amount = Math.floor(Math.random() * 5) + 1;
                const randomDirection = Math.floor(Math.random() * 2);
                const direction = randomDirection * 2 - 1;
                const pointchange = amount * direction;
                const percentchange = Number(((pointchange / commodity.price) * 100).toFixed(1));
                return {...commodity, 
                  price: commodity.price + pointchange, 
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
      
      <div>
      <div className="ticker">
            <div className="ticker-track">
              <div className="keyset-a">
                {commodities.map((c) => (
                  <span key = {c.name}>
                    {c.name} <ChangeIndicator value={c.change} /> <span className="sep">•</span>{" "}
                  </span>
                ))}
              </div>
              <div className="keyset-b">
                {commodities.map((c) => (
                  <span key = {c.name}>
                    {c.name} <ChangeIndicator value={c.change} /> <span className="sep">•</span>{" "}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

      <section className="commodity-grid">
        {commodities.map((commodity) => (
          <article className="commodity-card" key={commodity.name}>
            <h2>{commodity.name}</h2>

            <p className="price">${commodity.price}</p>

            <p className="change">
              <ChangeIndicator value = {commodity.change} />
            </p>
            <div className="button-group">
            <button className="buy-button"
              onClick={() => {
                if (gameState.balance >= commodity.price) {
                  dispatch({ type: "BUY", commodity: commodity });
                  setMessage(`You bought ${commodity.name} for $${commodity.price}`);
                } else {
                  setMessage(`Insufficient money to buy ${commodity.name}`);
                }
              }}>
              Buy
            </button>

            <button className="sell-button"
              onClick={() => {
                if (gameState.inventory[commodity.id] > 0) {
                  dispatch({ type: "SELL", commodity: commodity });
                  setMessage(`You sold ${commodity.name} for $${commodity.price}`);
                } else {
                  setMessage(`You don't have any ${commodity.name} to sell!`);
                }
              }}>
              Sell
            </button>
            </div>
          </article>
        ))}
      </section>
      <div className="inventory">
        <h2>Inventory</h2>
        <ul>
          {Object.entries(gameState.inventory).map(([commodityId, quantity]) => {
            const commodity = commodities.find((c) => c.id === commodityId);
            return (
              <li key={commodityId}>
                {commodity?.name}: {quantity}
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