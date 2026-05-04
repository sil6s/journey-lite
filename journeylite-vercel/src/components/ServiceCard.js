import Link from 'next/link'

export default function ServiceCard({ title, description, href }) {
  return (
    <article className="rounded-2xl border border-gray-200 bg-white p-6">
      <div className="text-2xl" aria-hidden="true">⚕️</div>
      <h3 className="mt-3 text-xl font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-gray-600">{description}</p>
      <Link href={href} className="mt-4 inline-block text-sm font-semibold text-brand-700">Learn More →</Link>
    </article>
  )
}
