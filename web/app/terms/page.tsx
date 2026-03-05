export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-16 px-4">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-lg p-10">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Terms of Service</h1>
        <p className="text-sm text-gray-500 mb-8">Last updated: {new Date().getFullYear()}</p>

        <section className="space-y-8 text-gray-700 text-sm leading-relaxed">
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-2">1. Introduction</h2>
            <p>
              These Terms of Service (&quot;Terms&quot;) govern your use of Meetings Managed, a service
              operated by Deliverance (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;). By creating an account you agree
              to be bound by these Terms.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-2">2. Service Description</h2>
            <p>
              Meetings Managed is a scheduling and client-management platform that allows businesses
              to manage meeting bookings with their clients. Features include booking management,
              organisation management, and client communication.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-2">3. Account Registration</h2>
            <p>
              You must provide accurate and complete information when creating an account. You are
              responsible for maintaining the confidentiality of your password and for all activity
              under your account.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-2">4. Acceptable Use</h2>
            <p>You agree not to:</p>
            <ul className="list-disc pl-5 space-y-1 mt-1">
              <li>Use the service for any unlawful purpose.</li>
              <li>Attempt to gain unauthorised access to any part of the service.</li>
              <li>Transmit harmful, harassing, or defamatory content.</li>
              <li>Reverse-engineer or attempt to extract our source code.</li>
            </ul>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-2">5. Subscriptions &amp; Payment</h2>
            <p>
              Business accounts require a paid subscription. Fees are billed monthly via Stripe.
              Subscriptions renew automatically until cancelled. Refunds are handled on a
              case-by-case basis at our discretion. Prices may change with reasonable notice.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-2">6. Intellectual Property</h2>
            <p>
              All software, design, and content provided as part of the service is owned by
              Deliverance or its licensors. You retain ownership of any data you upload.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-2">7. Limitation of Liability</h2>
            <p>
              To the fullest extent permitted by law, Deliverance shall not be liable for any
              indirect, incidental, special, or consequential damages arising from your use of the
              service. Our total liability shall not exceed the fees paid by you in the 12 months
              preceding the claim.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-2">8. Termination</h2>
            <p>
              You may delete your account at any time via the Settings page. We reserve the right to
              suspend or terminate accounts that violate these Terms.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-2">9. Governing Law</h2>
            <p>
              These Terms are governed by the laws of England and Wales. Any disputes shall be
              subject to the exclusive jurisdiction of the courts of England and Wales.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-2">10. Changes to Terms</h2>
            <p>
              We may update these Terms from time to time. Continued use of the service after
              changes constitutes acceptance of the new Terms.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-2">11. Contact</h2>
            <p>
              Deliverance — Meetings Managed<br />
              Email: <a href="mailto:hello@deliverance.example.com" className="text-pink-600 underline">hello@deliverance.example.com</a>
            </p>
          </div>
        </section>
      </div>
    </div>
  )
}
