export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-16 px-4">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-lg p-10">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Privacy Policy</h1>
        <p className="text-sm text-gray-500 mb-8">Last updated: {new Date().getFullYear()}</p>

        <section className="space-y-8 text-gray-700 text-sm leading-relaxed">
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-2">1. About This Policy</h2>
            <p>
              Deliverance (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;) operates Meetings Managed. This policy
              explains how we collect, use, and protect your personal data in accordance with the UK
              GDPR and the Data Protection Act 2018.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-2">2. Data We Collect</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Account data:</strong> name, email address, hashed password, account type.</li>
              <li><strong>Booking &amp; meeting data:</strong> meeting requests, bookings, notes.</li>
              <li><strong>Session data:</strong> an HTTP-only session cookie used to keep you logged in.</li>
              <li><strong>Payment data:</strong> Stripe customer and subscription identifiers (we do not store raw card details).</li>
            </ul>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-2">3. Lawful Basis</h2>
            <p>
              We process your personal data on the basis of <strong>contract performance</strong> (to
              provide the service you signed up for) and <strong>legitimate interests</strong> (to
              maintain security and improve the platform). Where required, we rely on{" "}
              <strong>consent</strong>.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-2">4. Data Processors</h2>
            <p>We use the following third-party processors:</p>
            <ul className="list-disc pl-5 space-y-1 mt-1">
              <li><strong>Neon (PostgreSQL hosting)</strong> — database storage in the EU/EEA.</li>
              <li><strong>Vercel / hosting provider</strong> — application hosting.</li>
              <li><strong>Stripe</strong> — payment processing (subject to Stripe&apos;s own privacy policy).</li>
            </ul>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-2">5. Retention</h2>
            <p>
              We retain your personal data for as long as your account is active. You may request
              deletion at any time (see Section 7). We may retain minimal data for up to 90 days in
              backups before permanent deletion.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-2">6. Cookies</h2>
            <p>
              We use a single, strictly necessary HTTP-only session cookie (<code>session</code>) to
              authenticate you. This cookie contains your user ID and is not used for advertising or
              tracking. No third-party cookies are set by us.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-2">7. Your Rights</h2>
            <p>Under UK GDPR you have the right to:</p>
            <ul className="list-disc pl-5 space-y-1 mt-1">
              <li><strong>Access</strong> the personal data we hold about you.</li>
              <li><strong>Rectification</strong> of inaccurate data.</li>
              <li><strong>Erasure</strong> (&quot;right to be forgotten&quot;) — use the <em>Delete Account</em> feature in Settings.</li>
              <li><strong>Portability</strong> — contact us to request a copy of your data.</li>
              <li><strong>Object</strong> to processing based on legitimate interests.</li>
            </ul>
            <p className="mt-2">
              To exercise any right, contact us at <a href="mailto:privacy@deliverance.example.com" className="text-pink-600 underline">privacy@deliverance.example.com</a>.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-2">8. Security</h2>
            <p>
              Passwords are stored as bcrypt hashes. Session cookies are HTTP-only and set to{" "}
              <code>SameSite=Lax</code>. All data in transit is encrypted via TLS.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-2">9. Updates</h2>
            <p>
              We may update this policy from time to time. Material changes will be communicated by
              email or a notice within the application.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-2">10. Contact</h2>
            <p>
              Deliverance — Meetings Managed<br />
              Email: <a href="mailto:privacy@deliverance.example.com" className="text-pink-600 underline">privacy@deliverance.example.com</a>
            </p>
          </div>
        </section>
      </div>
    </div>
  )
}
