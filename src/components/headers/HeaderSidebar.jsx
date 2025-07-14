import React from "react";
import Link from "next/link";

const logoBlack = "/logo_black.svg";

export const HeaderSidebar = ({ showSidebar, toggleSidebar }) => {
  return (
    <div className={`td_side_header ${showSidebar && "active"}`}>
      <button className="td_close" onClick={toggleSidebar} />

      <div className="td_side_header_overlay" onClick={toggleSidebar} />

      <div className="td_side_header_in">
        <div className="td_side_header_shape" />
        <Link className="td_site_branding" href="/">
          <img src={logoBlack} alt="Logo" />
        </Link>

        <div className="td_side_header_box">
          <h2 className="td_side_header_heading">
            Do you have a project in your <br />
            mind? Keep connect us.
          </h2>
        </div>
        <div className="td_side_header_box">
          <h3 className="td_side_header_title td_heading_color">Contact Us</h3>
          <ul className="td_side_header_contact_info td_mp_0">
            <li>
              <i className="fa-solid fa-phone"></i>
              <span>
                <a href="tel:+444547800112">+44 454 7800 112</a>
              </span>
            </li>
            <li>
              <i className="fa-solid fa-envelope"></i>
              <span>
                <a href="mailto:example@gmail.com">example@gmail.com</a>
              </span>
            </li>
            <li>
              <i className="fa-solid fa-location-dot"></i>
              <span>
                50 Wall Street Suite, 44150 <br />
                Ohio, United States
              </span>
            </li>
          </ul>
        </div>
        <div className="td_side_header_box">
          <h3 className="td_side_header_title td_heading_color">Subscribe</h3>
          <div className="td_newsletter td_style_1">
            <form className="td_newsletter_form">
              <input
                type="email"
                className="td_newsletter_input"
                placeholder="Email address"
              />
              <button
                type="submit"
                className="td_btn td_style_1 td_radius_30 td_medium"
              >
                <span className="td_btn_in td_white_color td_accent_bg">
                  <span>Subscribe Now</span>
                </span>
              </button>
            </form>
          </div>
        </div>
        <div className="td_side_header_box">
          <h3 className="td_side_header_title td_heading_color">Follow Us</h3>
          <div className="td_social_btns td_style_1 td_heading_color">
            <a href="#" className="td_center">
              <i className="fa-brands fa-linkedin-in"></i>
            </a>
            <a href="#" className="td_center">
              <i className="fa-brands fa-twitter"></i>
            </a>
            <a href="#" className="td_center">
              <i className="fa-brands fa-youtube"></i>
            </a>
            <a href="#" className="td_center">
              <i className="fa-brands fa-facebook-f"></i>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
