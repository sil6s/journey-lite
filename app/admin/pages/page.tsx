import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const sections = [
  "Homepage hero",
  "CTA strips",
  "Trust badges",
  "Service highlights",
  "Featured testimonials",
  "Location cards",
  "FAQ sections",
  "Footer CTAs",
  "Announcement bars",
];

export default function AdminPagesPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Pages / Website Sections</CardTitle>
        <CardDescription>Guided editing areas for common website sections. Current content is preserved in local page components.</CardDescription>
      </CardHeader>
      <CardContent>
        <Accordion className="w-full" type="single" collapsible>
          {sections.map((section) => (
            <AccordionItem key={section} value={section}>
              <AccordionTrigger>
                <span className="flex items-center gap-3">
                  {section}
                  <Badge variant="secondary">guided fields planned</Badge>
                </span>
              </AccordionTrigger>
              <AccordionContent>
                <div className="grid gap-4 rounded-lg border bg-muted/30 p-4 md:grid-cols-[1fr_auto] md:items-center">
                  <p className="text-sm text-muted-foreground">
                    This section can be connected to Sanity site settings when a schema is added. Use Studio for advanced edits until then.
                  </p>
                  <Button variant="outline">Prepare edit form</Button>
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  );
}
