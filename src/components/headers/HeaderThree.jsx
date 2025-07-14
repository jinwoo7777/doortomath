"use client";

import React from "react";
import Link from "next/link";
import { useMobilemenu } from "../../lib/hooks/useMobilemenu";
import { useStickyHeader } from "../../lib/hooks/useStickyHeader";
import { HeaderSearch } from "./HeaderSearch";

// 아이콘 색상 변경을 위한 스타일 정의
const iconStyles = {
  socialIcon: {
    transition: 'all 0.3s ease',
    cursor: 'pointer'
  },
  youtubeIcon: {
    filter: 'invert(0%) sepia(100%) saturate(7500%) hue-rotate(202deg) brightness(9%) contrast(100%)' // #00001B 색상
  },
  instaIcon: {
    filter: 'invert(0%) sepia(100%) saturate(7500%) hue-rotate(202deg) brightness(9%) contrast(100%)' // #00001B 색상
  },
  blogIcon: {
    filter: 'invert(0%) sepia(100%) saturate(7500%) hue-rotate(202deg) brightness(9%) contrast(100%)' // #00001B 색상
  }
};

const callIcon = "/icons/call.svg";
const envelopeIcon = "/icons/envlop.svg";
const logoV2 = "/logo_v2.svg";
const menuSquareIcon = "/icons/menu-square.svg";
const loveIcon = "/icons/love.svg";
const cartIcon = "/icons/cart.svg";
const youtubeIcon = "/icons/icons8-youtube2.svg";
const instarIcon = "/icons/instagram.svg";
const blogIcon = "/icons/ico_blog_b.svg";

export const HeaderThree = () => {
  useMobilemenu();
  useStickyHeader();

  return (
    <header className="td_site_header td_style_1 td_type_2 td_sticky_header td_medium td_heading_color">
      {/* top */}
      <div className="td_top_header td_heading_bg td_white_color">
        <div className="container">
          <div className="td_top_header_in">
            <div className="td_top_header_left">
              <ul className="td_header_contact_list td_mp_0 td_normal">
                <li>
                  <img src={callIcon} alt="" />
                  <span>
                    Call: <Link href="tel:99066789768">02 2564 0903</Link>
                  </span>
                </li>
                <li>
                  <img src={envelopeIcon} alt="" />
                  <span>
                    Email:
                    <Link href="mailto:doortomath@naver.com">
                      doortomath@naver.com
                    </Link>
                  </span>
                </li>
              </ul>
            </div>
            <div className="td_top_header_right">
              <span>
                <Link href="/signin" className="">
                  로그인
                </Link>
                /
                <Link href="/signup" className="">
                  회원가입
                </Link>
              </span>
              <Link href="#" className="td_btn td_style_1 td_medium">
                <span className="td_btn_in td_white_color td_accent_bg">
                  <span>상담신청</span>
                  <svg
                    width="19"
                    height="20"
                    viewBox="0 0 19 20"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M15.1575 4.34302L3.84375 15.6567"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M15.157 11.4142C15.157 11.4142 16.0887 5.2748 15.157 4.34311C14.2253 3.41142 8.08594 4.34314 8.08594 4.34314"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* main */}
      <div className="td_main_header">
        <div className="container">
          <div className="td_main_header_in">
            <div className="td_main_header_left">
              <Link href="/" className="td_site_branding">
                <img src={logoV2} alt="Logo" />
              </Link>

              <div className="td_header_category_wrap position-relative">
                <button className="td_header_dropdown_btn td_medium td_heading_color">
                  <img
                    src={menuSquareIcon}
                    alt=""
                    className="td_header_dropdown_btn_icon"
                  />
                  <span>수업 시간 안내</span>
                  <span className="td_header_dropdown_btn_tobble_icon td_center">
                    <svg
                      width="10"
                      height="6"
                      viewBox="0 0 10 6"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M9 4.99997C9 4.99997 6.05404 1.00001 4.99997 1C3.94589 0.999991 1 5 1 5"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                </button>
                <ul className="td_header_dropdown_list td_mp_0">
                  <li>
                    <Link href="/schedules/elementary">초등부 시간표</Link>
                  </li>
                  <li>
                    <Link href="/schedules/middle">중등부 시간표</Link>
                  </li>
                  <li>
                    <Link href="/schedules/high">고등부 시간표</Link>
                  </li>
                </ul>
              </div>
            </div>

 {/* ---------------------------------------------------------------------------------------------- */}
            <div className="td_main_header_right">
              <nav className="td_nav">
                <div className="td_nav_list_wrap">
                  <div className="td_nav_list_wrap_in">
                    <ul className="td_nav_list">
                      <li>
                        <Link href="/about">학원소개</Link>
                      </li>
                      {/*<li>
                        <Link href="/products">수업안내</Link>
                      </li>*/}
                      <li className="menu-item-has-children">
                        <Link href="/#">커뮤니티</Link>
                        <ul>
                          <li>
                            <Link href="/blog?category=notice">
                              공지사항
                            </Link>
                          </li>
                          <li>
                            <Link href="/faqs">
                              자주 묻는 질문
                            </Link>
                          </li>
                          <li>
                            <Link href="/schedules/elementary">
                              수업 시간표
                            </Link>
                          </li>
                        </ul>
                      </li>
 {/* ---------------------------------------------------------------------------------------------- */}                      
 {/* ---------------------------------------------------------------------------------------------- */}
                      <li className="menu-item-has-children">
                        <Link href="#">수학의문 소식</Link>
                        <ul>
                              <li>
                              <Link href="/blog/with-sidebar">블로그</Link>
                              </li>
                              <li>
                                <Link href="/blog?category=%20academy-event">이벤트</Link>
                              </li>
                              <li>
                                <Link href="/blog?category=tidings">학원소식</Link>
                              </li>
                              <li>
                                <Link href="/team-members">학습방법소개</Link>
                              </li>
                              <li>
                                <Link href="/team-members">수학의문 강사</Link>
                              </li>
                        </ul>
                      </li>
 {/* ---------------------------------------------------------------------------------------------- */}
 <li className="menu-item-has-children">
                        <Link href="#">수학의문 지점</Link>
                        <ul>
                              <li>
                                <Link href="/contact">위례 수학의문</Link>
                              </li>
                        </ul>
                      </li>
 {/* ---------------------------------------------------------------------------------------------- */}


 {/*
                      <li className="menu-item-has-children td_mega_menu">
                        <Link href="#">수학의문 소식</Link>
                        <ul className="td_mega_wrapper">
                          <li className="menu-item-has-children">
                            <h4>Inner Pages</h4>
                            <ul>
                              <li>
                                <Link href="/blog?category=notice">공지사항</Link>
                              </li>
                              <li>
                                <Link href="/event/ev-123">자주 묻는 질문</Link>
                              </li>
                              <li>
                                <Link href="/team-members">수강후기</Link>
                              </li>
                              <li>
                                <Link href="/team-members/t-123">
                                  Team Details
                                </Link>
                              </li>
                            </ul>
                          </li>
                          <li className="menu-item-has-children">
                            <h4>Inner Pages</h4>
                            <ul>
                              <li>
                                <Link href="/signup">
                                  Students Registrations
                                </Link>
                              </li>
                              <li>
                                <Link href="/instructor-registrations">
                                  Instructor Registrations
                                </Link>
                              </li>
                              <li>
                                <Link href="/signup">Signup</Link>
                              </li>
                              <li>
                                <Link href="/signin">Signin</Link>
                              </li>
                            </ul>
                          </li>
                          <li className="menu-item-has-children">
                            <h4>Shop Pages</h4>
                            <ul>
                              <li>
                                <Link href="/faqs">Faqs</Link>
                              </li>
                              <li>
                                <Link href="/cart">Cart</Link>
                              </li>
                              <li>
                                <Link href="/checkout">Checkout</Link>
                              </li>
                              <li>
                                <Link href="/error">Error</Link>
                              </li>
                            </ul>
                          </li>
                        </ul>
                      </li>

*/}
 {/* ---------------------------------------------------------------------------------------------- */}

  {/*                    
                      <li className="menu-item-has-children">
                        <Link href="#">수학의문 지점</Link>
                        <ul>
                          <li>
                            <Link href="/blog">Blogs</Link>
                          </li>
                          <li>
                            <Link href="/blog/with-sidebar">
                              Blog With Sidebar
                            </Link>
                          </li>
                          <li>
                            <Link href="/blog/b-123">Blog Details</Link>
                          </li>
                        </ul>
                      </li>
*/}


                      <li>
                        <Link href="/contact">오시는길</Link>
                      </li>
                    </ul>
                  </div>
                </div>
              </nav>

              <div className="td_hero_icon_btns position-relative">
                {/*
                <div className="position-relative">
                  <HeaderSearch />
                </div>
*/}
 {/* ---------------------------------------------------------------------------------------------- */}

            <div className="td_footer_social_btns td_fs_20">


              <a href="#" className="td_center">
              <i className="fa-regular fa-circle-play"></i>
              </a>
              <a href="#" className="td_center">
              <i className="fa-brands fa-instagram"></i>
              </a>
              <a href="#" className="td_center">
              <i className="fa-regular fa-comment"></i>
              </a>
            </div>
               {/*
                <button className="td_circle_btn td_center" type="button">
                  <img src={cartIcon} alt="" />
                  <span className="td_circle_btn_label">0</span>
                </button>*/}
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
