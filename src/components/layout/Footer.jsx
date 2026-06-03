import {
  FaFacebookF,
  FaInstagram,
  FaPhoneAlt,
  FaWhatsapp,
  FaEnvelope,
  FaArrowUp,
} from "react-icons/fa";

const Footer = () => {
  const links = [
    "About Us",
    "Privacy Policy",
    "Return Policy",
    "Shipping Policy",
    "Terms and condition",
  ];

  const categories = [
    "Ethnic Wear",
    "DRESSES",
    "Tops",
    "Kurtas",
    "Kurtas And Kurtis",
    "Gown",
    "NEW ARRIVALS",
    "TOP PRODUCTS",
    "Dresses",
    "AMAZING DEALS",
    "BEST SELLERS",
    "Kurta Set",
  ];

  return (
    <footer className="bg-[#b10063] text-white">
      {/* Top Section */}
      <div className="max-w-7xl mx-auto px-4 lg:px-6 py-5">
        <div className="grid lg:grid-cols-2 gap-5">
          {/* Left */}
          <div>
            <img
              src="/logo.png"
              alt="Ammiy London"
              className="w-8 h-8 bg-white p-0.5"
            />

            <h2 className="text-xl font-bold mt-4 mb-3">
              Ammiy London
            </h2>

            <p className="max-w-md text-sm leading-normal font-medium">
              Ammiy London Is a Contemporary Women's Fashion Brand Dedicated to
              Celebrating Confidence, Individuality, and Everyday Elegance.
            </p>

            {/* <div className="flex items-center gap-3 mt-4">
              <a href="#" className="text-xl hover:opacity-80">
                <FaFacebookF />
              </a>

              <a href="#" className="text-xl hover:opacity-80">
                <FaInstagram />
              </a>
            </div> */}
          </div>

          {/* Right */}
          <div className="bg-[#a0005b] p-4 rounded-sm">
            <h3 className="text-base font-bold uppercase mb-4">
              Contact Us
            </h3>

            <div className="space-y-2 text-sm font-medium">
              <p>
                <span className="font-bold">Call:</span> +91 - 9928092650
              </p>

              <p>
                <span className="font-bold">WhatsApp:</span> +91 - 9928092650
              </p>

              <p>
                <span className="font-bold">Customer Support Time:</span> 24/7
              </p>

              <p>
                <span className="font-bold">Email:</span>{" "}
                ammiylondon@gmail.com
              </p>

              <p>
                <span className="font-bold">Address:</span> DEV PLAZA COMPLEX,
                SHOP NO F-06 A, NAGAR NIGAM ROAD SANGANER, Jaipur, Jaipur,
                Rajasthan, 302029, Rajasthan, Jaipur, 302029
              </p>
            </div>
          </div>
        </div>

        {/* Policy Links */}
        <div className="border-t border-white/30 mt-6 pt-3">
          <div className="flex flex-wrap justify-center gap-x-10 gap-y-3 text-sm font-semibold">
            {links.map((item) => (
              <a
                key={item}
                href="#"
                className="hover:text-white/80 transition"
              >
                {item}
              </a>
            ))}
          </div>
        </div>

        {/* Categories */}
        <div className="border-t border-white/20 mt-4 pt-3">
          <div className="flex flex-wrap items-center gap-y-2 text-xs">
            <span className="font-bold mr-3">
              Most searched on store
            </span>

            {categories.map((item, index) => (
              <div
                key={item}
                className="flex items-center"
              >
                <a
                  href="#"
                  className="text-white/80 hover:text-white transition"
                >
                  {item}
                </a>

                {index !== categories.length - 1 && (
                  <span className="mx-2 text-white/60">|</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

    </footer>
  );
};

export default Footer;