import React from 'react';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";

const FAQAccordion = ({ faqs }) => {
  return (
    <Accordion type="single" collapsible className="w-full space-y-4">
      {faqs.map((faq, index) => (
        <AccordionItem 
          key={index} 
          value={`item-${index}`}
          className="bg-card border border-border rounded-xl px-6 data-[state=open]:shadow-md transition-all"
        >
          <AccordionTrigger className="text-left font-semibold text-foreground hover:text-primary py-5 text-base md:text-lg">
            {faq.question}
          </AccordionTrigger>
          <AccordionContent className="text-muted-foreground text-sm md:text-base leading-relaxed pb-6">
            {faq.answer}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
};

export default FAQAccordion;