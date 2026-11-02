import React from 'react';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="foot-container">
        <div className="top-container">
          <div className="details-container">
            <div>
              <h5>ABOUT</h5>
              <p>Contact Us</p>
              <p>About Us</p>
              <p>Careers</p>
              <p>Flipkart Stories</p>
              <p>Press</p>
              <p>Corporate Information</p>
            </div>
            <div>
              <h5>GROUP COMPANIES</h5>
              <p>Myntra</p>
              <p>Cleartrip</p>
              <p>Shopsy</p>
            </div>
            <div>
              <h5>HELP</h5>
              <p>Payments</p>
              <p>Shipping</p>
              <p>Cancellation &amp; Returns</p>
              <p>FAQ</p>
            </div>
            <div>
              <h5>CONSUMER POLICY</h5>
              <p>Cancellation &amp; Returns</p>
              <p>Terms Of Use</p>
              <p>Security</p>
              <p>Privacy</p>
              <p>Sitemap</p>
              <p>Grievance Redressal</p>
              <p>EPR Compliance</p>
            </div>
          </div>

          <div className="address-container">
            <div>
              <h5>Mail Us:</h5>
              <p>
                Elite Flipkart Internet Private Limited,<br />
                Buildings Alyssa, Begonia &amp; Clove<br />
                Embassy Tech Village, Outer Ring Road,<br />
                Devarabeesannahalli Village,<br />
                Bengaluru, 560103, Karnataka, India
              </p>
              <h5 style={{ marginTop: '12px' }}>Social:</h5>
              <div className="social-icons-row">
                <i className="fa-brands fa-instagram"></i>
                <i className="fa-brands fa-youtube"></i>
                <i className="fa-brands fa-x-twitter"></i>
                <i className="fa-brands fa-facebook"></i>
              </div>
            </div>

            <div>
              <h5>Registered Office Address:</h5>
              <p>
                Elite Flipkart Internet Private Limited,<br />
                Buildings Alyssa, Begonia &amp; Clove<br />
                Embassy Tech Village, Outer Ring Road,<br />
                Devarabeesannahalli Village,<br />
                Bengaluru, 560103, Karnataka, India<br />
                CIN: U5112U5P054767H57<br />
                Telephone: 080-4547-2000
              </p>
            </div>
          </div>
        </div>

        <div className="bottom-container">
          <p><i className="fa-solid fa-briefcase"></i> Become a Seller</p>
          <p><i className="fa-solid fa-rectangle-ad"></i> Advertise</p>
          <p><i className="fa-solid fa-gift"></i> Gift Cards</p>
          <p><i className="fa-solid fa-circle-question"></i> Help Center</p>
          <p>&copy; 2007-2026 Elite Ecommerce / Flipkart.com</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
