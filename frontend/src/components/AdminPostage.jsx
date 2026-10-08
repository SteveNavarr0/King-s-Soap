import React, { useState, useEffect } from "react";
import { FiRefreshCw } from "react-icons/fi";
import supabase from "../supabaseClient";

export default function AdminPostageQueue() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchQueue = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("orders")
      .select("id, created_at, customer_email, total_amount, tracking_number, label_url, label_printed, status")
      .eq("status", "paid")
      .not("label_url", "is", null)
      .order("label_printed", { ascending: true })
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error fetching postage queue:", error);
    } else {
      setOrders(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchQueue();
  }, []);

  const handlePrintClick = async (order) => {
    // 1. Open the EasyPost label in a new tab
    window.open(order.label_url, "_blank", "noopener,noreferrer");

    // 2. Optimistic update: mark printed and shift item to bottom of queue
    setOrders((prevOrders) => {
      const updated = prevOrders.map((o) =>
        o.id === order.id ? { ...o, label_printed: true } : o
      );
      const unprinted = updated.filter((o) => !o.label_printed);
      const printed = updated.filter((o) => o.label_printed);
      return [...unprinted, ...printed];
    });

    // 3. Persist update in Supabase
    await supabase
      .from("orders")
      .update({
        label_printed: true,
        label_printed_at: new Date().toISOString(),
      })
      .eq("id", order.id);
  };

  if (loading) {
    return (
      <div className="text-center py-10 font-serif italic text-white/80 text-lg md:text-xl">
        Loading postage queue...
      </div>
    );
  }

  const unprintedCount = orders.filter((o) => !o.label_printed).length;

  return (
    <div className="w-full">
      {/* Queue Header */}
      
      <div className="mb-6">

        <div className="flex items-center justify-between gap-4">
          <h2 className="text-2xl md:text-3xl font-serif italic text-white">
            Shipping Queue
          </h2>

          <button
            type="button"
            onClick={fetchQueue}
            className="inline-flex shrink-0 items-center gap-0 sm:gap-3 whitespace-nowrap text-white font-serif italic text-sm md:text-base hover:scale-105 cursor-pointer transition"
          >
            <span className="hidden sm:inline">Refresh Queue</span>
            <FiRefreshCw aria-hidden="true" />
          </button>
          
        
      </div>

      <p className="text-sm md:text-base font-serif text-white/80 mt-0.5">
            {unprintedCount} ready to print · {orders.length} total orders
      </p>
    
      </div>

      

      {/* Orders List / Empty State */}
      {orders.length === 0 ? (
        <div className="p-8 md:p-12 text-center text-white/80 font-serif italic text-base md:text-xl md:border md:border-white/20 rounded-xl bg-black/10">
          No orders waiting for postage printing.
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const isPrinted = order.label_printed;

            return (
              <div
                key={order.id}
                className={`p-4 rounded-lg border shadow-sm flex flex-col gap-4 md:flex-row md:items-center md:justify-between transition-all duration-200 ${
                  isPrinted
                    ? "bg-black/25 border-white/10 opacity-75"
                    : "border-white/30 shadow-sm"
                }`}
              >
                {/* Order Information */}
                <div className="space-y-4 md:space-y-2">
                  {/* Mobile label; desktop keeps the compact queue layout */}
                  <span className="block mb-1 font-sans text-xs uppercase tracking-wide text-white/90">
                    Order ID
                  </span>

                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs md:text-sm text-white">
                      #{order.id}
                    </span>

                    {isPrinted ? (
                      <span className="hidden md:inline-flex px-3 py-1 rounded-full border border-amber-400/30 bg-amber-500/20 font-serif text-sm text-amber-200">
                        Printed
                      </span>
                    ) : (
                      <span className="hidden md:inline-flex px-3 py-1 rounded-full border border-emerald-400/40 bg-emerald-500/25 font-serif text-sm text-emerald-200">
                        Ready
                      </span>
                    )}
                  </div>

                  <span className="block mb-1 font-sans text-xs uppercase tracking-wide text-white/90">
                    Contact
                  </span>
                  <p className="font-serif text-base md:text-lg font-medium text-white">
                    {order.customer_email}
                  </p>

                  {order.tracking_number && (
                  <div>
                    {/* Mobile label; desktop keeps the inline label */}
                    <span className="block mb-1 font-sans text-xs uppercase tracking-wide text-white/90">
                      Tracking
                    </span>

                    <p className="font-mono text-sm md:text-base text-white">

                      {order.tracking_url ? (
                        <a
                          href={order.tracking_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="underline hover:text-white transition"
                        >
                          {order.tracking_number}
                        </a>
                      ) : (
                        order.tracking_number
                      )}
                    </p>
                  </div>
                )}

                {/* Mobile status field; desktop status remains beside the Order ID */}
                <div className="md:hidden">
                  <span className="block mb-2 font-sans text-xs uppercase tracking-wide text-white/90">
                    Status
                  </span>
                  {isPrinted ? (
                      <span className="inline-flex px-3 py-1 rounded-full border border-amber-400/30 bg-amber-500/20 font-serif text-sm text-amber-200">
                        Printed
                      </span>
                    ) : (
                      <span className="inline-flex px-3 py-1 rounded-full border border-emerald-400/40 bg-emerald-500/25 font-serif text-sm text-emerald-200">
                        Ready
                      </span>
                    )}
                  </div>

                </div>

                {/* Print Trigger */}
                <div className="flex items-center md:self-end md:self-center">
                  <button
                    type="button"
                    onClick={() => handlePrintClick(order)}
                    className="w-40 md:w-50 h-8 md:h-10 rounded-full bg-white/15 border border-white/30 shadow-sm text-white text-sm md:text-lg flex items-center justify-center whitespace-nowrap hover:scale-105 cursor-pointer transition"
                  >
                    {isPrinted ? "Reprint Label" : "Print Postage"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}