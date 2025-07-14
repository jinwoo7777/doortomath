import React from "react";
import Link from "next/link";

const userIcon = "/icons/user_3.svg";
const bookIcon = "/icons/book.svg";

export const CoursesOneItem = ({
  id, // 강의 ID 추가
  src,
  seats,
  semesters,
  subtitle,
  title,
  description,
  totalRatings,
}) => {
  // 강의 디테일 페이지 링크 생성
  const courseDetailLink = id ? `/course-details/${id}` : "/course-details";
  
  return (
    <div className="td_card td_style_3 d-block td_radius_10">
      <Link href={courseDetailLink} className="td_card_thumb">
        <img src={src} alt="Course thumbnail" />
      </Link>
      <div className="td_card_info td_white_bg">
        <div className="td_card_info_in">
          <ul className="td_card_meta td_mp_0 td_fs_18 td_medium td_heading_color">
            <li>
              <img src={userIcon} alt="User icon" />
              <span className="td_opacity_7">{seats} Seats</span>
            </li>
            <li>
              <img src={bookIcon} alt="Book icon" />
              <span className="td_opacity_7">{semesters} Semesters</span>
            </li>
          </ul>

          <Link
            href="/courses-grid-with-sidebar"
            className="td_card_category td_fs_14 td_bold td_heading_color td_mb_14"
          >
            <span>{subtitle}</span>
          </Link>

          <h2 className="td_card_title td_fs_24 td_mb_16">
            <Link href={courseDetailLink}>{title}</Link>
          </h2>

          <p className="td_card_subtitle td_heading_color td_opacity_7 td_mb_20">
            {description}
          </p>

          <div className="td_card_review">
            <div className="td_rating" data-rating="5">
              <i className="fa-regular fa-star"></i>
              <i className="fa-regular fa-star"></i>
              <i className="fa-regular fa-star"></i>
              <i className="fa-regular fa-star"></i>
              <i className="fa-regular fa-star"></i>
              <div className="td_rating_percentage">
                <i className="fa-solid fa-star fa-fw"></i>
                <i className="fa-solid fa-star fa-fw"></i>
                <i className="fa-solid fa-star fa-fw"></i>
                <i className="fa-solid fa-star fa-fw"></i>
                <i className="fa-solid fa-star fa-fw"></i>
              </div>
            </div>

            <span className="td_heading_color td_opacity_5 td_medium">
              (5.0/{totalRatings} Ratings)
            </span>
          </div>

          <div className="td_card_btn">
            <Link
              href="/cart"
              className="td_btn td_style_1 td_radius_10 td_medium"
            >
              <span className="td_btn_in td_white_color td_accent_bg">
                <span>Enroll Now</span>
              </span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
