import React from "react";
import Link from "next/link";

const footerLogo = "/logo_v2.svg";

export const FooterThree = () => {
  return (
    <footer
      className="td_footer td_style_1 td_type_3 td_color_4"
      style={{ backgroundColor: "#6440FB" }}
    >
      <div className="container">
        <h3 className="td_fs_60 td_white_color mb-0">{`수업·상담 언제든 환영합니다`}</h3>
        <div className="td_footer_row">
          <div className="td_footer_col">
            <div className="td_footer_widget">
              <h2 className="td_footer_widget_title td_fs_32 td_white_color td_medium td_mb_30">
                Navigate
              </h2>
              <ul className="td_footer_widget_menu">
                <li>
                  <Link href="/">Home</Link>
                </li>
                <li>
                  <Link href="/about">About</Link>
                </li>
                <li>
                  <Link href="/contact">Contact</Link>
                </li>
                <li>
                  <Link href="/contact">Refund</Link>
                </li>
                <li>
                  <Link href="#">Help Center</Link>
                </li>
                <li>
                  <Link href="#">Privacy Policy</Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="td_footer_col">
            <div className="td_footer_widget">
              <h2 className="td_footer_widget_title td_fs_32 td_white_color td_medium td_mb_30">
                Courses
              </h2>
              <ul className="td_footer_widget_menu">
                <li>
                  <Link href="/course-details">Business Coach</Link>
                </li>
                <li>
                  <Link href="/course-details">Development Coach</Link>
                </li>
                <li>
                  <Link href="/course-details">Testimonials</Link>
                </li>
                <li>
                  <Link href="/course-details">Seo Optimization</Link>
                </li>
                <li>
                  <Link href="/course-details">Web design</Link>
                </li>
                <li>
                  <Link href="/course-details">Life Coach</Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="td_footer_col">
            <div className="td_footer_widget">
              <h2 className="td_footer_widget_title td_fs_32 td_white_color td_medium td_mb_30">
                Subscribe Now
              </h2>
              <div className="td_newsletter td_style_1">
                <p className="td_mb_20 td_opacity_7">
                  Far far away, behind the word mountains, far from the
                  Consonantia.
                </p>
                <form action="#" className="td_newsletter_form">
                  <input
                    type="email"
                    className="td_newsletter_input"
                    placeholder="Email address"
                  />
                  <button
                    type="submit"
                    className="td_btn td_style_1 td_radius_30 td_medium"
                  >
                    <span className="td_btn_in td_white_color td_accent_bg" style={{ backgroundColor: "#6440FB" }}>
                      <span>Subscribe</span>
                    </span>
                  </button>
                </form>
              </div>
            </div>
          </div>
          <div className="td_footer_col">
            <div className="td_footer_widget">
              <div className="td_footer_address_widget_wrap">
                <ul className="td_footer_address_widget td_medium td_mp_0">
                  <li>
                    <i className="fa-solid fa-phone-volume"></i>
                    <a href="cal:+23(000)68603">+82 (02) 2564 0903</a>
                  </li>
                  <li>
                    <i className="fa-solid fa-envelope"></i>
                    <a href="mailto:doortomath@naver.com">
                    doortomath@naver.com
                    </a>
                  </li>
                  <li>
                    <i className="fa-solid fa-location-dot"></i>
                    서울시 강남구 삼성로 155 
                    <br />
                    대치퍼스트 빌딩 6층 605,606,607호
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="td_footer_bottom td_fs_18">
        <div className="container">
          <div className="td_footer_bottom_in">
            <p className="td_copyright mb-0">
              Copyright ©대치수학의문 | All Right Reserved
            </p>
            <div className="td_footer_logo">
              <img src={footerLogo} alt="Logo" />
            </div>
            <div className="td_footer_social_btns td_fs_20">
              <a href="#" className="td_center">
                <i className="fa-brands fa-facebook-f"></i>
              </a>
              <a href="#" className="td_center">
                <i className="fa-brands fa-x-twitter"></i>
              </a>
              <a href="#" className="td_center">
                <i className="fa-brands fa-instagram"></i>
              </a>
              <a href="#" className="td_center">
                <i className="fa-brands fa-pinterest-p"></i>
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
