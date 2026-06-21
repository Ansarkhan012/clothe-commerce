export default function ReturnRefundPolicyPage() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-16">
      <h1 className="text-4xl font-bold mb-8">Return & Refund Policy</h1>

      <div className="space-y-6 text-neutral-700 leading-7">
        <section>
          <h2 className="text-xl font-semibold mb-2">Returns</h2>
          <p>
            Returns may be accepted within 7 days of receiving the order if the
            product is damaged, defective, or incorrect.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">Conditions</h2>
          <p>
            Products must be unused, unwashed, and in original packaging.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">Refunds</h2>
          <p>
            Approved refunds will be processed within a reasonable timeframe
            after inspection.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">Contact</h2>
          <p>
            For return requests, please contact our support team with your
            order details.
          </p>
        </section>
      </div>
    </main>
  );
}