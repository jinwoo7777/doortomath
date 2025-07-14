import React from "react";
import { Odometer } from "../odometer/Odometer";

const funfactIcon1 = "/home_3/funfact_icon_1.svg";
const funfactIcon2 = "/home_3/funfact_icon_2.svg";
const funfactIcon3 = "/home_3/funfact_icon_3.svg";
const funfactIcon4 = "/home_3/funfact_icon_4.svg";

export const FunfactOne = ({ 
  content = {
    items: [
      {
        id: 1,
        icon: '/home_3/funfact_icon_1.svg',
        value: 20,
        suffix: '+년',
        label: '대치동 20년운영 원장직강'
      },
      {
        id: 2,
        icon: '/home_3/funfact_icon_2.svg',
        value: 3000,
        suffix: '+',
        label: '누적학생수'
      },
      {
        id: 3,
        icon: '/home_3/funfact_icon_3.svg',
        value: 90,
        suffix: '%',
        label: '1년이상 재원률'
      },
      {
        id: 4,
        icon: '/home_3/funfact_icon_4.svg',
        value: 10,
        suffix: '+년차',
        label: '검증된 전문 강사진'
      }
    ]
  }
}) => {
  return (
    <div className="td_accent_bg">
      <div className="td_height_80 td_height_lg_80" />
      <div className="container">
        <div className="td_funfact_1_wrap">
          {content.items.map((item, index) => (
            <div key={item.id} className="td_funfact td_style_1">
              <div className="td_funfact_in">
                <div className="td_funfact_icon">
                  <img src={item.icon} alt="funfact icon" />
                </div>
                <div className="td_funfact_right">
                  <h3 className="td_fs_36 td_white_color mb-0">
                    <Odometer end={item.value} suffix={item.suffix} />
                  </h3>
                  <p className="mb-0 td_white_color td_opacity_7">
                    {item.label}
                  </p>
                </div>
              </div>
              <svg
                width="140"
                height="120"
                viewBox="0 0 140 120"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                strokeWidth="2"
                strokeDasharray="8 8"
              >
                <rect
                  x="1"
                  y="1"
                  width="138"
                  height="118"
                  rx="9"
                  stroke="white"
                />
              </svg>
            </div>
          ))}
        </div>
      </div>

      <div className="td_height_120 td_height_lg_80" />
    </div>
  );
};
