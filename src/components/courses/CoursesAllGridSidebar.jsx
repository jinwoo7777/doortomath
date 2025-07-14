"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { fetchCourses } from "@/lib/supabase/fetchCourses";

const user = "/icons/user_3.svg";
const book = "/icons/book.svg";
const courseThumb1 = "/home_1/course_thumb_1.jpg";
const courseThumb2 = "/home_1/course_thumb_2.jpg";
const courseThumb3 = "/home_1/course_thumb_3.jpg";
const courseThumb4 = "/home_1/course_thumb_4.jpg";
const courseThumb5 = "/home_1/course_thumb_5.jpg";
const courseThumb6 = "/home_1/course_thumb_6.jpg";
const courseThumb7 = "/home_1/course_thumb_7.jpg";
const courseThumb8 = "/home_1/course_thumb_8.jpg";

const coursesList = [
  {
    id: 1,
    label: "New",
    image: courseThumb1,
    seats: 150,
    semesters: 12,
    category: "Data Analytics",
    title: "Starting Reputed Education & Build your Skills",
    description:
      "Far far away, behind the word mountains, far from the Consonantia.",
    rating: 4.5,
    totalRatings: 5,
  },
  {
    id: 2,
    label: "New",
    image: courseThumb2,
    seats: 100,
    semesters: 20,
    category: "Software Engineer",
    title: "Master Technology & Elevate Your Career",
    description: "Unlock the power of technology to drive your career forward.",
    rating: 5,
    totalRatings: 10,
  },
  {
    id: 3,
    label: "New",
    image: courseThumb3,
    seats: 300,
    semesters: 8,
    category: "Bachelor Of Arts",
    title: "Boost Creativity & Expand Your Horizons",
    description:
      "Discover innovative techniques to enhance your creative thinking.",
    rating: 5,
    totalRatings: 12,
  },
  {
    id: 4,
    label: "Best Seller",
    image: courseThumb4,
    seats: 250,
    semesters: 12,
    category: "Business Administrator",
    title: "Hone Leadership & Achieve Success",
    description:
      "Develop essential leadership skills to excel in any industry.",
    rating: 4,
    totalRatings: 30,
  },
  {
    id: 5,
    label: "New",
    image: courseThumb5,
    seats: 80,
    semesters: 12,
    category: "Fine of Arts",
    title: "Learn Coding & Advance Your Skills Up",
    description:
      "Gain in-demand coding expertise to stay ahead in the tech world.",
    rating: 4.5,
    totalRatings: 5,
  },
  {
    id: 6,
    label: "Best Seller",
    image: courseThumb6,
    seats: 200,
    semesters: 12,
    category: "Computer Science",
    title: "Explore Marketing & Build Your Brand",
    description:
      "Master marketing strategies to grow your personal or business brand.",
    rating: 4.5,
    totalRatings: 15,
  },
  {
    id: 7,
    label: "Best Seller",
    image: courseThumb7,
    seats: 150,
    semesters: 12,
    category: "Data Analytics",
    title: "Starting Reputed Education & Build your Skills",
    description:
      "Far far away, behind the word mountains, far from the Consonantia.",
    rating: 4.5,
    totalRatings: 5,
  },
  {
    id: 8,
    image: courseThumb8,
    seats: 100,
    semesters: 20,
    category: "Software Engineer",
    title: "Master Technology & Elevate Your Career",
    description: "Unlock the power of technology to drive your career forward.",
    rating: 5,
    totalRatings: 10,
  },
];

export const CoursesAllGridSidebar = () => {
  // Supabase에서 강의 데이터를 로드
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchCourses();
        setCourses(data);
      } catch (err) {
        console.error("강의 데이터 로드 오류:", err);
        setError(err.message || "데이터를 불러오는 중 오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <p className="text-center py-6">강의를 불러오는 중...</p>;
  if (error) return <p className="text-center text-red-600 py-6">{error}</p>;
  if (!courses.length) return <p className="text-center py-6">등록된 강의가 없습니다.</p>;
  return (
    <div className="row td_gap_y_30 td_row_gap_30">
      {courses.map((course) => (
        <div key={course.id} className="col-md-6">
          <div className="td_card td_style_3 d-block td_radius_10">
            <span className="td_card_label td_accent_bg td_white_color">
              {course.label}
            </span>

            <Link href="/course-details" className="td_card_thumb">
              <img src={course.thumbnail_url || course.image_url || course.image || "/images/placeholder-course.jpg"} alt={course.title} />
            </Link>

            <div className="td_card_info td_white_bg">
              <div className="td_card_info_in">
                <ul className="td_card_meta td_mp_0 td_fs_18 td_medium td_heading_color">
                  <li>
                    <img src={user} alt="user icon" />
                    <span className="td_opacity_7">{course.seats} Seats</span>
                  </li>

                  <li>
                    <img src={book} alt="book icon" />
                    <span className="td_opacity_7">
                      {course.semesters} Semesters
                    </span>
                  </li>
                  <li>
                    <img src={book} alt="book icon" />
                    <span className="td_opacity_7">{course.weeks} Weeks</span>
                  </li>
                </ul>

                <Link
                  href="/courses-grid-with-sidebar"
                  className="td_card_category td_fs_14 td_bold td_heading_color td_mb_14"
                >
                  <span>{course.category}</span>
                </Link>

                <h2 className="td_card_title td_fs_24 td_mb_16">
                  <Link href="/course-details">{course.title}</Link>
                </h2>

                <p className="td_card_subtitle td_heading_color td_opacity_7 td_mb_20">
                  {course.description}
                </p>

                <div className="td_card_review">
                  <div className="td_rating" data-rating="4.5">
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
                    ({course.rating}/{course.totalRatings} Ratings)
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
        </div>
      ))}
    </div>
  );
};
