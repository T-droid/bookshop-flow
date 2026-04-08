import { AppLayout } from "@/components/AppLayout";
import { Card } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    id: "item-1",
    question: "Why can I not access some menu items?",
    answer:
      "Menu access depends on your role. For example, some pages are limited to admin or manager accounts.",
  },
  {
    id: "item-2",
    question: "How do I fix low stock warnings?",
    answer:
      "Open Stock Management to review affected titles, then create a purchase order for items below reorder level.",
  },
  {
    id: "item-3",
    question: "Where can I see recent sales?",
    answer:
      "Use the Sales page for transaction details and the Dashboard for a quick recent-sales snapshot.",
  },
  {
    id: "item-4",
    question: "What should I do when totals look incorrect?",
    answer:
      "Check tax settings, discount rules, and item quantities first. If the issue remains, share the receipt number with an admin.",
  },
  {
    id: "item-5",
    question: "Who do I contact for technical issues?",
    answer:
      "Contact your internal system admin or project maintainer with a short description, steps to reproduce, and any visible error message.",
  },
];

export default function FAQ() {
  return (
    <AppLayout>
      <div className="container mx-auto px-6 py-8 space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Frequently Asked Questions</h1>
          <p className="text-muted-foreground">
            Quick answers to common operational and access questions.
          </p>
        </div>

        <Card className="p-6 bg-card border border-border shadow-card-soft">
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq) => (
              <AccordionItem key={faq.id} value={faq.id}>
                <AccordionTrigger className="text-left">{faq.question}</AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Card>
      </div>
    </AppLayout>
  );
}
