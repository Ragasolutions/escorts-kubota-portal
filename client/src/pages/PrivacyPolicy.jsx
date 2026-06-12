import { Link } from 'react-router-dom'

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-white">

      {/* Hero Banner */}
      <section className="overflow-hidden">
  <img
    src="/about-banner.jpg"
    alt="Escorts Dealership Uniform"
    className="w-full h-auto object-cover"
  />
</section>

      {/* Content */}
      <section className="py-16">

        <div className="max-w-6xl mx-auto px-4">

          <Link
            to="/login"
            className="inline-flex items-center text-amber-600 hover:text-amber-700 font-medium mb-10"
          >
            ← Go Back
          </Link>

          <h1 className="text-4xl font-black text-gray-900 mb-10">
            Privacy Policy
          </h1>

          <div className="space-y-10">

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Introduction
              </h2>

              <p className="text-gray-700 leading-8">
                At Style4U, we value your trust and are committed to protecting your privacy.
                This Privacy Policy explains how we collect, use, store, and safeguard your
                personal information when you visit our website, place an order, submit an
                inquiry, or interact with our services.
              </p>

              <p className="text-gray-700 leading-8 mt-4">
                By using our website, you consent to the practices described in this Privacy Policy.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Information We Collect
              </h2>

              <h3 className="font-semibold text-lg mb-3">
                Personal Information
              </h3>

              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Name</li>
                <li>Email Address</li>
                <li>Phone Number</li>
                <li>Company / Organization Name</li>
                <li>Billing Address</li>
                <li>Shipping Address</li>
              </ul>

              <h3 className="font-semibold text-lg mt-6 mb-3">
                Order Information
              </h3>

              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Product Preferences</li>
                <li>Customization Requirements</li>
                <li>Artwork, Logos, Designs and Specifications</li>
                <li>Transaction Details</li>
              </ul>

              <h3 className="font-semibold text-lg mt-6 mb-3">
                Technical Information
              </h3>

              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>IP Address</li>
                <li>Browser Type</li>
                <li>Device Information</li>
                <li>Website Usage Data</li>
                <li>Cookies and Similar Technologies</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                How We Use Your Information
              </h2>

              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Processing and fulfilling orders</li>
                <li>Providing customized apparel and merchandise solutions</li>
                <li>Responding to inquiries and support requests</li>
                <li>Sending order confirmations and updates</li>
                <li>Improving website, products and services</li>
                <li>Maintaining internal records</li>
                <li>Complying with legal obligations</li>
                <li>Preventing fraudulent activities</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Customer Designs & Artwork
              </h2>

              <p className="text-gray-700 leading-8">
                Customers may submit logos, artwork, trademarks, designs, and creative materials
                for customized apparel orders.
              </p>

              <ul className="list-disc pl-6 text-gray-700 space-y-2 mt-4">
                <li>Product Customization</li>
                <li>Design Proofing</li>
                <li>Manufacturing and Order Fulfillment</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Cookies
              </h2>

              <p className="text-gray-700 leading-8">
                Our website may use cookies and similar technologies to enhance user experience
                and improve website functionality.
              </p>

              <ul className="list-disc pl-6 text-gray-700 space-y-2 mt-4">
                <li>Understand website traffic patterns</li>
                <li>Remember user preferences</li>
                <li>Improve website performance</li>
                <li>Enhance customer experience</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Information Sharing
              </h2>

              <p className="text-gray-700 leading-8">
                Style4U does not sell, rent, or trade personal information.
                Information may only be shared with trusted service providers
                involved in payment processing, logistics, website hosting,
                maintenance, and customer support.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Data Security
              </h2>

              <p className="text-gray-700 leading-8">
                We implement reasonable administrative, technical, and physical safeguards
                to protect personal information against unauthorized access, disclosure,
                alteration, or destruction.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Data Retention
              </h2>

              <p className="text-gray-700 leading-8">
                We retain personal information only as long as necessary to complete
                transactions, fulfill legal obligations, resolve disputes, and maintain
                business records.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Third-Party Links
              </h2>

              <p className="text-gray-700 leading-8">
                Our website may contain links to third-party websites. Style4U is not
                responsible for the privacy practices or content of external websites.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Your Rights
              </h2>

              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Access your personal information</li>
                <li>Request correction of inaccurate information</li>
                <li>Request deletion of information</li>
                <li>Withdraw consent where applicable</li>
                <li>Raise concerns regarding data processing</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Changes To This Privacy Policy
              </h2>

              <p className="text-gray-700 leading-8">
                Style4U reserves the right to update or modify this Privacy Policy
                at any time without prior notice. Changes become effective immediately
                upon publication on this page.
              </p>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Contact Information
              </h2>

              <p className="text-gray-700">
                <strong>Style4U</strong>
              </p>

              <p className="text-gray-700">
                Faridabad, Haryana, India
              </p>

              <p className="text-gray-700 mt-2">
                Email: style4ufbd@gmail.com
              </p>

              <p className="text-gray-700">
                Phone: +91 8076422987
              </p>
            </div>

          </div>

        </div>

      </section>

    </div>
  )
}

export default PrivacyPolicy