import React from 'react';

const Terms = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">Terms of Service</h1>
          
          <div className="prose max-w-none">
            <p className="text-gray-600 mb-6">
              Last updated: {new Date().toLocaleDateString()}
            </p>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Acceptance of Terms</h2>
              <p className="text-gray-700">
                By accessing and using the IIT Tirupati Food Hub platform, you accept and agree to be 
                bound by the terms and provision of this agreement.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Eligibility</h2>
              <p className="text-gray-700 mb-4">
                This service is primarily intended for:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>Current students of IIT Tirupati</li>
                <li>Faculty and staff of IIT Tirupati</li>
                <li>Authorized visitors to the campus</li>
                <li>Local restaurants partnering with the platform</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. User Responsibilities</h2>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>Provide accurate and complete information</li>
                <li>Maintain the security of your account credentials</li>
                <li>Use the platform only for lawful purposes</li>
                <li>Respect other users and restaurant partners</li>
                <li>Pay for orders in a timely manner</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Orders and Payments</h2>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>All orders are subject to restaurant availability</li>
                <li>Prices are set by individual restaurants</li>
                <li>Payment must be completed before order processing</li>
                <li>Cancellation policies vary by restaurant</li>
                <li>Refunds are processed according to our refund policy</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Platform Availability</h2>
              <p className="text-gray-700">
                While we strive to maintain 24/7 availability, the platform may be temporarily 
                unavailable due to maintenance, updates, or technical issues. We are not liable 
                for any inconvenience caused by such interruptions.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Limitation of Liability</h2>
              <p className="text-gray-700">
                IIT Tirupati Food Hub acts as a platform connecting students with restaurants. 
                We are not responsible for food quality, delivery delays, or disputes between 
                users and restaurants.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Prohibited Activities</h2>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>Creating fake accounts or impersonating others</li>
                <li>Placing fraudulent orders</li>
                <li>Harassing other users or restaurant staff</li>
                <li>Attempting to hack or disrupt the platform</li>
                <li>Using the platform for commercial purposes without authorization</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Termination</h2>
              <p className="text-gray-700">
                We reserve the right to terminate or suspend accounts that violate these terms 
                or engage in prohibited activities.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Changes to Terms</h2>
              <p className="text-gray-700">
                We may update these terms from time to time. Users will be notified of significant 
                changes via email or platform notifications.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Contact Information</h2>
              <p className="text-gray-700">
                For questions about these Terms of Service, contact us at:
              </p>
              <div className="mt-4 p-4 bg-gray-100 rounded-lg">
                <p className="text-gray-700">
                  Email: fodyyy1@gmail.com<br />
                  Phone: +91-9989671246<br />
                  Address: IIT Tirupati, Tirupati, Andhra Pradesh
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Terms;