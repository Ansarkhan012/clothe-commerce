export default function ShippingPolicyPage() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-16">
      <h1 className="text-4xl font-bold mb-8">Shipping Policy</h1>

      <div className="space-y-6 text-neutral-700 leading-7">
        <p>
          We deliver across Pakistan through trusted courier partners.
        </p>

        <section>
          <h2 className="text-xl font-semibold mb-2">Processing Time</h2>
          <p>
            Orders are usually processed within 1–3 business days.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">Delivery Time</h2>
          <p>
            Delivery generally takes 3–7 business days depending on location.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">Shipping Charges</h2>
          <p>
            Shipping charges may vary based on location and promotions.
          </p>
        </section>
      </div>
    </main>
  );
}