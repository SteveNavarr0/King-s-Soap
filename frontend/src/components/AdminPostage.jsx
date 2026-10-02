import React, { useState, useEffect } from "react";
import supabase from "../supabaseClient";

export default function AdminPostageQueue() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchQueue = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("orders")
      .select("id, created_at, customer_email, total_amount, tracking_number, label_url, label_printed, status")
      .in("status", ["paid", "accepted"])
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl md:text-3xl font-serif italic text-white">
            Shipping Queue
          </h2>
          <p className="text-sm md:text-base font-serif text-white/80 mt-0.5">
            {unprintedCount} ready to print · {orders.length} total orders
          </p>
        </div>

        <button
          onClick={fetchQueue}
          className="self-start sm:self-auto px-4 py-2 rounded-lg bg-[#8B6B4A] hover:bg-[#72573c] border border-white/30 text-white font-serif text-sm md:text-base shadow-sm hover:scale-105 cursor-pointer transition"
        >
          Refresh Queue
        </button>
      </div>

      {/* Orders List / Empty State */}
      {orders.length === 0 ? (
        <div className="p-8 md:p-12 text-center text-white/80 font-serif italic text-base md:text-xl border border-white/20 rounded-xl bg-black/10">
          No orders waiting for postage printing.
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const isPrinted = order.label_printed;

            return (
              <div
                key={order.id}
                className={`p-4 md:p-5 rounded-xl border transition-all duration-200 flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                  isPrinted
                    ? "bg-black/25 border-white/10 opacity-75"
                    : "bg-[#C5AE98]/20 border-white/30 shadow-md"
                }`}
              >
                {/* Order Information */}
                <div className="space-y-1.5">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs md:text-sm text-white/90 font-semibold tracking-wider">
                      #{order.id}
                    </span>

                    {isPrinted ? (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-serif bg-amber-500/20 text-amber-200 border border-amber-400/30">
                        Printed
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-serif bg-emerald-500/25 text-emerald-200 border border-emerald-400/40">
                        Ready to Print
                      </span>
                    )}
                  </div>

                  <p className="text-base md:text-lg font-serif text-white font-medium">
                    {order.customer_email}
                  </p>

                  {order.tracking_number && (
                    <p className="text-xs md:text-sm font-mono text-white/80">
                      Tracking:{" "}
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
                  )}
                </div>

                {/* Print Trigger */}
                <div className="flex items-center self-end md:self-center">
                  <button
                    onClick={() => handlePrintClick(order)}
                    className={`px-5 py-2 md:py-2.5 rounded-lg font-serif text-sm md:text-lg border shadow-sm hover:scale-105 cursor-pointer transition ${
                      isPrinted
                        ? "bg-white/15 hover:bg-white/25 text-white border-white/20"
                        : "bg-[#8B6B4A] hover:bg-[#72573c] text-white border-white/30 font-medium"
                    }`}
                  >
                    {isPrinted ? "Re-print Label" : "Print Postage"}
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