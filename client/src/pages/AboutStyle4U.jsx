import { Link } from 'react-router-dom'

const AboutStyle4U = () => {
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

          {/* Explore Style4U */}
          <div className="mb-14">

            <h2 className="text-3xl font-black text-gray-900 mb-5">
              EXPLORE STYLE4U
            </h2>

            <p className="text-gray-700 leading-8">
              Style4U is a young and enterprising brand that reflects your style quotient. The brand when adored gives freshness and a sense of confidence. It stands for uniqueness and enhancing individual personality. The brand helps you wear your desire to succeed and stand apart. It embodies the sense of achievement and desire to excel in every field of life.
            </p>

          </div>

          {/* Our Journey */}
          <div className="mb-14">

            <h2 className="text-3xl font-black text-gray-900 mb-5">
              OUR JOURNEY
            </h2>

            <p className="text-gray-700 leading-8 mb-5">
              Style4U is a five-year young company that was established in the year 2020. It started with a vision to encompass clothing and apparels in every walk of life, be it personal or professional.
            </p>

            <p className="text-gray-700 leading-8 mb-5">
              It provides complete Customised Apparel Merchandising Solutions tailor-made as per customer needs. We specialize in Fabrics, Boutique, Customised Apparel Merchandise and Uniforms with a state-of-the-art manufacturing facility in Faridabad (Haryana).
            </p>

            <p className="text-gray-700 leading-8">
              With complete control over the entire process from fabric selection to the finished product under one roof, we have built a reputation based on high-quality products, uncompromising attention to detail, and seamless customer service.
            </p>

          </div>

          {/* Our Forte */}
          <div className="mb-14">

            <h2 className="text-3xl font-black text-gray-900 mb-5">
              OUR FORTE
            </h2>

            <p className="text-gray-700 leading-8 mb-5">
              Whether you’re looking for customised T-shirts, Caps, Shirts, Uniforms, Workwear, Jackets or Hoodies, we have everything under one roof.
            </p>

            <p className="text-gray-700 leading-8 mb-5">
              Customers from all over the world trust us for delivering unmatched customised apparel solutions, and we are proud to have served more than 5000 customers.
            </p>

            <p className="text-gray-700 leading-8">
              With fully integrated manufacturing facilities, we ensure that stringent quality practices are followed throughout the entire process, right from designing to delivering the final product.
            </p>

          </div>

          {/* Our Values */}
          <div>

            <h2 className="text-3xl font-black text-gray-900 mb-5">
              OUR VALUES
            </h2>

            <p className="text-gray-700 leading-8">
              Our values stand for excellence in product quality and customer service to bring customer delight. We believe in personalization and customization by providing defect-free products within committed timelines.
            </p>

            <p className="text-gray-700 leading-8 mt-5">
              For us, the customer is at the center of everything we do and we strive to provide the best experience at every touchpoint.
            </p>

          </div>

        </div>

      </section>

    </div>
  )
}

export default AboutStyle4U