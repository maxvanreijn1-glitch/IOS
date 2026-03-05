export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-16 px-4">
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-lg p-10">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Contact Us</h1>
        <p className="text-gray-500 mb-8 text-sm">
          We&apos;re here to help. Reach out with any questions about Meetings Managed.
        </p>

        <div className="space-y-6 text-gray-700 text-sm">
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-1">Company</h2>
            <p className="font-medium">Deliverance</p>
            <p className="text-gray-500">Meetings Managed</p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-1">General Enquiries</h2>
            <a
              href="mailto:hello@deliverance.example.com"
              className="text-pink-600 hover:underline"
            >
              hello@deliverance.example.com
            </a>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-1">Privacy &amp; Data Requests</h2>
            <a
              href="mailto:privacy@deliverance.example.com"
              className="text-pink-600 hover:underline"
            >
              privacy@deliverance.example.com
            </a>
            <p className="text-gray-500 mt-1">
              For data access, rectification, or erasure requests under UK GDPR.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-1">Support</h2>
            <a
              href="mailto:support@deliverance.example.com"
              className="text-pink-600 hover:underline"
            >
              support@deliverance.example.com
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
