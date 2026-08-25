import React from "react";
import { MessageCircle } from "lucide-react";

const whatsappMessage = "Hi Centaur Careers! I'm interested in the Financial Operations Masterclass and would like to know more about the program, fees, training, and placement support. Please share the details with me.";

const FloatingWhatsAppButton = () => {
  return (
    <div className="fixed bottom-6 right-6 z-50">

      {/* WhatsApp Button */}
      <a
        href={`https://wa.me/919369213948?text=${encodeURIComponent(whatsappMessage)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="relative flex items-center justify-center w-14 h-14 rounded-full bg-green-500 text-white shadow-xl hover:bg-green-600 hover:scale-105 transition-all duration-300"
        aria-label="Chat on WhatsApp"
      >

        {/* Ping Animation */}
        <span className="absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-50 animate-ping"></span>

        {/* Icon */}
        <MessageCircle className="w-7 h-7 relative z-10" />
      </a>

    </div>
  );
};

export default FloatingWhatsAppButton;