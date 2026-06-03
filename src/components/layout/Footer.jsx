import {
  FaFacebookF,
  FaInstagram,
  FaPhoneAlt,
  FaWhatsapp,
  FaEnvelope,
  FaArrowUp,
} from "react-icons/fa";

const ORANGE = '#f58021';
const WHITE = '#fff';

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
    <footer
      className="text-white"
      style={{
        background: ORANGE,
      }}
    >
      {/* Top Section */}
      <div className="max-w-7xl mx-auto px-4 lg:px-6 py-7">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left */}
          <div>
            <img
              src="/logo.png"
              alt="Ammiy London"
              className="w-16 h-16 bg-white p-1.5 rounded-lg"
            />

            <h2 className="text-2xl font-bold mt-4 mb-3 text-white">
              Ammiy London
            </h2>

            <p className="max-w-md text-sm leading-normal font-medium text-white/90">
              Ammiy London is a contemporary women's fashion brand dedicated to
              celebrating confidence, individuality, and everyday elegance.
            </p>

            {/* Social Icons (optional, use white for highlight color) */}
            {/* <div className="flex items-center gap-3 mt-4">
              <a href="#" className="text-2xl text-white hover:opacity-80 transition">
                <FaFacebookF />
              </a>
              <a href="#" className="text-2xl text-white hover:opacity-80 transition">
                <FaInstagram />
              </a>
            </div> */}
          </div>

          {/* Right */}
          <div className="bg-white/10 p-6 rounded-lg border border-white/15 shadow-sm">
            <h3 className="text-base font-bold uppercase mb-4 text-white">
              Contact Us
            </h3>

            <div className="space-y-2 text-sm font-medium text-white/90">
              <p>
                <span className="font-bold text-white">Call:</span> +91 - 9928092650
              </p>
              <p>
                <span className="font-bold text-white">WhatsApp:</span> +91 - 9928092650
              </p>
              <p>
                <span className="font-bold text-white">Customer Support Time:</span> 24/7
              </p>
              <p>
                <span className="font-bold text-white">Email:</span>{" "}
                ammiylondon@gmail.com
              </p>
              <p>
                <span className="font-bold text-white">Address:</span> DEV PLAZA COMPLEX,
                SHOP NO F-06 A, NAGAR NIGAM ROAD SANGANER, Jaipur, Jaipur,
                Rajasthan, 302029, Rajasthan, Jaipur, 302029
              </p>
            </div>
          </div>
        </div>

        {/* Policy Links */}
        <div className="border-t border-white/30 mt-8 pt-4">
          <div className="flex flex-wrap justify-center gap-x-10 gap-y-3 text-sm font-semibold">
            {links.map((item) => (
              <a
                key={item}
                href="#"
                className="hover:text-white/90 text-white/90 transition"
              >
                {item}
              </a>
            ))}
          </div>
        </div>

        {/* Categories */}
        <div className="border-t border-white/20 mt-6 pt-4">
          <div className="flex flex-wrap items-center gap-y-2 text-xs text-white/80">
            <span className="font-bold text-white mr-3">
              Most searched on store
            </span>
            {categories.map((item, index) => (
              <div
                key={item}
                className="flex items-center"
              >
                <a
                  href="#"
                  className="hover:text-white text-white/90 transition"
                >
                  {item}
                </a>
                {index !== categories.length - 1 && (
                  <span className="mx-2 text-white/40">|</span>
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