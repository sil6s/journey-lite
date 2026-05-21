import { LocalContentManager } from "@/components/admin/local-content-manager";
import { reviewCards } from "@/app/components/data";

export default function AdminTestimonialsPage() {
  return (
    <LocalContentManager
      title="Testimonials / Reviews"
      description="Review published testimonial excerpts and prepare guided review management."
      createLabel="Add testimonial"
      rows={reviewCards.map((review) => ({
        id: review.name,
        title: review.name,
        description: review.excerpt,
        group: "Google review excerpt",
        href: "/#reviews",
        status: "Published",
      }))}
    />
  );
}
