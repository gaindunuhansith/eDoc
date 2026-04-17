export default function HelpPage() {
  return (
    <main className="min-h-screen bg-[#f8fbff] px-6 py-12">
      <div className="mx-auto w-full max-w-7xl">
        <div className="rounded-3xl bg-white border border-gray-100 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="mt-1 text-sm text-gray-500">Support, guides and FAQs</p>
            </div>
            <div className="flex items-center gap-3">
              <button className="px-4 py-2 rounded-lg border border-gray-200 text-sm text-gray-700 bg-white hover:bg-gray-50">
                Contact Support
              </button>
              <button className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-700">
                Submit a Ticket
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <aside className="space-y-3">
              <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
                <h3 className="text-sm font-medium text-gray-700">Quick Links</h3>
                <ul className="mt-3 space-y-2 text-sm text-gray-600">
                  <li className="hover:text-gray-900">Getting started</li>
                  <li className="hover:text-gray-900">Account & billing</li>
                  <li className="hover:text-gray-900">Integrations</li>
                </ul>
              </div>
            </aside>

            <section className="lg:col-span-2 space-y-6">
              <div className="p-6 bg-white border border-gray-100 rounded-2xl shadow-sm">
                <h2 className="text-lg font-semibold text-gray-900">Getting started</h2>
                <p className="mt-3 text-sm text-gray-600">Follow these steps to get started quickly with eDoc.</p>
                <ol className="mt-4 list-decimal pl-5 space-y-2 text-sm text-gray-600">
                  <li>Create an account and set up your profile.</li>
                  <li>Add clinic details and staff members.</li>
                  <li>Configure appointments and notifications.</li>
                </ol>
              </div>

              <div className="p-6 bg-white border border-gray-100 rounded-2xl shadow-sm">
                <h2 className="text-lg font-semibold text-gray-900">FAQs</h2>
                <div className="mt-4 space-y-4 text-sm text-gray-600">
                  <details className="p-4 border rounded-lg">
                    <summary className="font-medium">How do I reset my password?</summary>
                    <p className="mt-2">Use the Forgot Password link on the login page to request a reset email.</p>
                  </details>
                  <details className="p-4 border rounded-lg">
                    <summary className="font-medium">How do I contact support?</summary>
                    <p className="mt-2">Use the Contact Support button or email support@example.com.</p>
                  </details>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </main>
  )
}
