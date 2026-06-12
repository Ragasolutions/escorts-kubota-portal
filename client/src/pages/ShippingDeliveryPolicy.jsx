import { Link } from 'react-router-dom'

const ShippingDeliveryPolicy = () => {
return ( <div className="min-h-screen bg-white">

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
        Shipping & Delivery Policy
      </h1>

      <div className="space-y-10">

        {/* Order Processing */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Order Processing
          </h2>

          <h3 className="text-lg font-semibold text-gray-800 mb-3">
            Payment
          </h3>

          <p className="text-gray-700 leading-8">
            All orders are processed only after receipt of full payment or the agreed advance payment, including applicable taxes and charges. We offer secure payment options to ensure a safe and convenient transaction experience.
          </p>

          <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-3">
            Order Processing Time
          </h3>

          <p className="text-gray-700 leading-8">
            As most of our products are customized according to customer requirements, order processing and production timelines may vary depending on product type, order quantity, customization requirements, design approval timelines, and material availability.
          </p>

          <p className="text-gray-700 leading-8 mt-4">
            Typically, orders are processed and manufactured within <strong>3 to 15 business days</strong> from the date of order confirmation and payment receipt.
          </p>

          <p className="text-gray-700 leading-8 mt-4">
            For bulk or highly customized orders, production timelines may be extended and will be communicated to the customer in advance.
          </p>
        </div>

        {/* Shipping Methods */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Shipping Methods
          </h2>

          <p className="text-gray-700 leading-8">
            Style4U partners with reliable courier and logistics providers to deliver products across India.
          </p>

          <p className="text-gray-700 leading-8 mt-4">
            Shipping charges, if applicable, will be communicated during order confirmation and may vary depending on:
          </p>

          <ul className="list-disc pl-6 text-gray-700 space-y-2 mt-4">
            <li>Delivery location</li>
            <li>Order size and weight</li>
            <li>Shipping method selected</li>
          </ul>
        </div>

        {/* Delivery Time */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Delivery Time
          </h2>

          <p className="text-gray-700 leading-8">
            Once your order has been manufactured, packed, and dispatched, delivery generally takes <strong>3 to 7 business days</strong> for most serviceable locations across India.
          </p>

          <p className="text-gray-700 leading-8 mt-4">
            Deliveries to remote or non-metro locations may require additional transit time.
          </p>

          <p className="text-gray-700 leading-8 mt-4">
            Delivery timelines are estimates and may be affected by factors beyond our control including:
          </p>

          <ul className="list-disc pl-6 text-gray-700 space-y-2 mt-4">
            <li>Weather conditions</li>
            <li>Public holidays</li>
            <li>Transportation disruptions</li>
            <li>Natural calamities</li>
            <li>Government restrictions</li>
            <li>Courier partner delays</li>
          </ul>
        </div>

        {/* Tracking */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Order Tracking
          </h2>

          <p className="text-gray-700 leading-8">
            Once your order has been shipped, tracking details may be shared via email, WhatsApp, SMS, or phone communication wherever applicable.
          </p>

          <p className="text-gray-700 leading-8 mt-4">
            Customers can use the provided tracking information to monitor shipment status and estimated delivery timelines.
          </p>
        </div>

        {/* Delivery Address */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Delivery Address
          </h2>

          <p className="text-gray-700 leading-8">
            Customers are responsible for providing complete and accurate shipping information at the time of placing the order.
          </p>

          <p className="text-gray-700 leading-8 mt-4">
            Style4U shall not be held responsible for delays, failed deliveries, or additional charges arising from incorrect or incomplete shipping details provided by the customer.
          </p>
        </div>

        {/* Damaged Shipments */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Damaged or Lost Shipments
          </h2>

          <p className="text-gray-700 leading-8">
            Customers are requested to inspect the package immediately upon delivery.
          </p>

          <p className="text-gray-700 leading-8 mt-4">
            If any product is received in a damaged condition, or if any item is missing from the shipment, customers must notify Style4U within <strong>48 hours</strong> of delivery along with photographs and order details.
          </p>

          <p className="text-gray-700 leading-8 mt-4">
            We will review the issue and provide appropriate assistance as per our company policies.
          </p>
        </div>

        {/* Contact */}
        <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Contact Us
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

          <p className="text-gray-700 mt-6">
            At Style4U, customer satisfaction is our priority. We strive to ensure every order reaches you safely, efficiently, and on time.
          </p>
        </div>

        {/* Note */}
        <div className="border-l-4 border-amber-500 bg-amber-50 p-5 rounded-r-xl">
          <p className="text-gray-700">
            <strong>Note:</strong> This Shipping & Delivery Policy may be updated or modified from time to time without prior notice. Customers are encouraged to review the latest version available on our website.
          </p>
        </div>

      </div>
    </div>
  </section>

</div>


)
}

export default ShippingDeliveryPolicy
