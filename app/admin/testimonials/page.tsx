import { fetchTestimonials } from "@/app/admin/people/actions";
import { TestimonialsClient } from "./TestimonialsClient";

export const metadata = { title: "Testimonials — JourneyLite Admin" };
export const dynamic = "force-dynamic";

export default async function AdminTestimonialsPage() {
  const testimonials = await fetchTestimonials().catch(() => []);
  return <TestimonialsClient initialTestimonials={testimonials} />;
}
