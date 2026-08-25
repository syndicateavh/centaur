import React from 'react';
import { Route, Routes, BrowserRouter as Router } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { Toaster } from 'sonner';

import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import HomePage from '@/pages/HomePage.jsx';
import FloatingWhatsAppButton from '@/components/FloatingWhatsAppButton.jsx';
import StickyEnrollButton from '@/components/StickyEnrollButton.jsx';

function App() {
  return (
    <Router>
      <Helmet>
        <title>Finance Career Training Lucknow | Centaur Careers | Investment Banking, Retail Banking & NBFC Jobs | Alambagh & Krishna Nagar</title>
        <meta name="description" content="Centaur Careers - 6-week Hire-Train-Deploy program for finance careers. 3 Pillars: IB Ops, Retail Banking, Finance Ops. Lucknow Advantage hometown jobs, unlimited interviews, Target CTC 3–12 LPA. Offline training with Mindsprout partner." />
      </Helmet>
      
      <div className="flex flex-col min-h-screen">
        <Header />
        
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<HomePage />} />
            {/* Catch-all route to redirect back to home for this landing page */}
            <Route path="*" element={<HomePage />} />
          </Routes>
        </main>
        
        <Footer />
      </div>
      
      <FloatingWhatsAppButton />
      <StickyEnrollButton />
      <Toaster position="bottom-right" richColors />
    </Router>
  );
}

export default App;