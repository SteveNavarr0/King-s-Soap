import React from "react";
import AdminHeader from "../components/AdminHeader";
import AdminNav from "../components/AdminNav";
import AdminPostageQueue from "../components/AdminPostage";

export default function AdminPostagePage() {
    return (
      <div className="min-h-screen pb-16">
        <AdminHeader />
  
        <div className="flex flex-col justify-left mt-8 md:mt-8 ml-8 mr-8 md:ml-13 md:mr-13 text-white">
          <h1 className="text-3xl md:text-5xl font-serif">
            Postage & Fulfillment
          </h1>
          <p className="text-base font-serif md:text-xl leading-relaxed text-white">
            Review, print, and track outbound customer orders
          </p>
        </div>
  
        <div className="mt-4 md:mt-8 mb-6 ml-8 mr-8 md:ml-13 md:mr-13 bg-white/10 rounded-xl p-4 md:p-8 md:border md:border-white/30">
          <AdminPostageQueue />
        </div>
  
        <AdminNav />
      </div>
    );
  }