import { Link } from 'react-router-dom'

const TermsConditions = () => {
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
            Terms & Conditions
          </h1>

          <div className="space-y-10">

            {/* Acceptance */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Acceptance of Terms of Use
              </h2>

              <p className="text-gray-700 leading-8">
                Please read these Terms & Conditions carefully. These Terms govern your access to and use of the Style4U website and services. By accessing, browsing, or using this website, you confirm that you are legally competent to enter into a binding agreement under applicable laws and agree to be bound by these Terms & Conditions and any additional policies, guidelines, restrictions, or notices posted on this website.
              </p>

              <p className="text-gray-700 leading-8 mt-4">
                Style4U reserves the right to amend, modify, or update these Terms & Conditions at any time without prior notice. Your continued use of the website following any changes shall constitute your acceptance of such revised Terms.
              </p>
            </div>

            {/* Intellectual Property */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Copyrighted Materials & Intellectual Property
              </h2>

              <p className="text-gray-700 leading-8">
                All content displayed on this website, including but not limited to logos, graphics, images, product designs, text, trademarks, artwork, and other materials, are the property of Style4U or its licensors and are protected under applicable intellectual property laws.
              </p>

              <p className="text-gray-700 leading-8 mt-4">
                You may not reproduce, distribute, modify, transmit, publish, or commercially exploit any content from this website without prior written consent from Style4U.
              </p>

              <p className="text-gray-700 leading-8 mt-4">
                Customers are solely responsible for ensuring that any logos, designs, artwork, trademarks, or content submitted to Style4U do not infringe upon the intellectual property rights of any third party.
              </p>
            </div>

            {/* Use Of Site */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Use of Site
              </h2>

              <p className="text-gray-700 leading-8 mb-4">
                You are granted permission to access and use this website solely for obtaining information regarding Style4U products and services, requesting quotations, placing orders, and communicating with our team.
              </p>

              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>For any unlawful purpose</li>
                <li>To solicit others to participate in unlawful activities</li>
                <li>To violate laws or regulations</li>
                <li>To infringe intellectual property rights</li>
                <li>To submit false information</li>
                <li>To upload malware or malicious code</li>
                <li>To misuse personal information</li>
                <li>To interfere with website operations</li>
                <li>To gain unauthorized access to systems</li>
              </ul>
            </div>

            {/* Customized Products */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Customized Products
              </h2>

              <p className="text-gray-700 leading-8">
                Style4U specializes in Customized Apparel Merchandising Solutions including T-Shirts, Shirts, Caps, Uniforms, Workwear, Jackets, Hoodies, and Promotional Merchandise.
              </p>

              <p className="text-gray-700 leading-8 mt-4">
                Customers are responsible for reviewing and approving all artwork, designs, sizes, colors, quantities, and customization details before production begins.
              </p>

              <p className="text-gray-700 leading-8 mt-4">
                Minor variations in fabric texture, print placement, embroidery, color shades, and measurements may occur as part of the manufacturing process and shall not be considered defects.
              </p>
            </div>

            {/* Order Confirmation */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Order Confirmation & Payment
              </h2>

              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Order confirmation by the customer</li>
                <li>Approval of designs and artwork</li>
                <li>Receipt of agreed payment or advance payment</li>
              </ul>

              <p className="text-gray-700 leading-8 mt-4">
                Style4U reserves the right to refuse or cancel any order due to pricing errors, product unavailability, incorrect information, or suspected fraudulent activity.
              </p>
            </div>

            {/* Transfer */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Transfer of Title
              </h2>

              <p className="text-gray-700 leading-8">
                Ownership and risk of loss for products shall pass to the customer upon dispatch of the goods from Style4U's manufacturing facility.
              </p>
            </div>

            {/* Returns */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Returns, Exchanges & Cancellations
              </h2>

              <p className="text-gray-700 leading-8">
                Customized products are generally non-returnable and non-refundable once production has commenced.
              </p>

              <ul className="list-disc pl-6 text-gray-700 space-y-2 mt-4">
                <li>Wrong product delivered</li>
                <li>Materially different from approved specifications</li>
                <li>Manufacturing defect</li>
              </ul>

              <p className="text-gray-700 leading-8 mt-4">
                Any issue must be reported within 48 hours of delivery along with supporting photographs and order details.
              </p>
            </div>

            {/* Indemnification */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Indemnification
              </h2>

              <p className="text-gray-700 leading-8">
                You agree to indemnify and hold harmless Style4U, its employees, affiliates, suppliers, and representatives from claims arising from misuse of the website or violation of these Terms.
              </p>
            </div>

            {/* Liability */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Limitation of Liability
              </h2>

              <p className="text-gray-700 leading-8">
                All services and products are provided on an "as available" and "as is" basis without warranties of any kind.
              </p>

              <p className="text-gray-700 leading-8 mt-4">
                Style4U shall not be liable for any direct, indirect, incidental, special, punitive, or consequential damages arising from the use of the website, products, or services.
              </p>
            </div>

            {/* Law */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Applicable Law
              </h2>

              <p className="text-gray-700 leading-8">
                These Terms & Conditions shall be governed by the laws of India.
              </p>

              <p className="text-gray-700 leading-8 mt-4">
                Any disputes shall be subject to the exclusive jurisdiction of courts located in Faridabad, Haryana.
              </p>
            </div>

            {/* Contact */}
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Contact Information
              </h2>

              <p className="text-gray-700 font-semibold">
                Style4U
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

export default TermsConditions