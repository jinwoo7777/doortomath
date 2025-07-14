import React from "react";
import { VideoPlayer } from "./VideoPlayer";

const videoBg = "home_1/video_bg.jpg";

export const VideoOne = () => {
  return (
    <section>
      <div
        className="td_video_block td_style_1 td_accent_bg td_bg_filed td_center text-center"
        style={{ backgroundImage: `url(${videoBg})` }}
      >
        <div className="container">
          <VideoPlayer
            trigger={
              <a
                href="#vid2"
                className="td_player_btn_wrap_2 td_video_open wow zoomIn"
                data-wow-duration="1s"
                data-wow-delay="0.2s"
              >
                <span className="td_player_btn td_center">
                  <span></span>
                </span>
              </a>
            }
          />

          <div className="td_height_70 td_height_lg_50" />
          <h2
            className="td_fs_48 td_white_color mb-0 wow fadeInUp"
            data-wow-duration="1s"
            data-wow-delay="0.2s"
          >
            영상을 통해 수학의 문을 알아보세요 <br />
            캠퍼스 소개
          </h2>
        </div>
      </div>
      <div
        className="container wow fadeInUp"
        data-wow-duration="1s"
        data-wow-delay="0.25s"
      >
        <div className="td_contact_box td_style_1 td_accent_bg td_radius_10">
          <div className="td_contact_box_left">
            <p className="td_fs_18 td_light td_white_color td_mb_4">
              Get In Touch:
            </p>
            <h3 className="td_fs_36 mb-0 td_white_color">
              <a href="mailto:doortomath@naver.com">doortomath@naver.com</a>
            </h3>
          </div>
          <div className="td_contact_box_or td_fs_24 td_medium td_white_bg td_white_bg td_center rounded-circle td_accent_color">
            or
          </div>
          <div className="td_contact_box_right">
            <p className="td_fs_18 td_light td_white_color td_mb_4">
              Get In Touch:
            </p>
            <h3 className="td_fs_36 mb-0 td_white_color">
              <a href="tel:+019987698870">02 2564 0903</a>
            </h3>
          </div>
        </div>
      </div>
    </section>
  );
};
