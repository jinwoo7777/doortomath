import React from "react";

export const RateTwo = ({ content = {} }) => {
  const { rate = { heading: '2025년 수학의문 | 명문대 입학현황', items: [] } } = content;
  const rating = 5;

  return (
    <section className="td_heading_bg td_rate_section td_type_1">
      <div className="td_rate_heading td_fs_20 td_semibold td_white_color">
        {rate.heading}
        <div className="td_rating_wrap">
          <div className="td_rating" data-rating={rating}>
            {[...Array(5)].map((_, i) => (
              <i 
                key={i} 
                className={`fa-${i < rating ? "solid" : "regular"} fa-star`}
              />
            ))}
          </div>
        </div>
      </div>
      <div className="td_rate_feature_list_wrap" style={{ overflowY: "auto" }}>
        <div className="td_moving_box_wrap">
          <div className="td_moving_box_in">
            <div className="td_moving_box">
              <ul className="td_rate_feature_list td_mp_0">
                {rate.items && rate.items.map((item) => (
                  <li key={item.id}>
                    <div className="td_rate_feature_icon td_center td_white_bg">
                      <img src={item.image} alt={item.title} />
                    </div>
                    <div className="td_rate_feature_right">
                      <h3 className="td_fs_24 td_semibold td_white_color td_mb_4">
                        {item.title}
                      </h3>
                      <p className="mb-0 td_white_color td_opacity_7">
                        {item.description}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            <div className="td_moving_box">
              <ul className="td_rate_feature_list td_mp_0">
                {rate.items && rate.items.map((item) => (
                  <li key={item.id + '-duplicate'}>
                    <div className="td_rate_feature_icon td_center td_white_bg">
                      <img src={item.image} alt={item.title} />
                    </div>
                    <div className="td_rate_feature_right">
                      <h3 className="td_fs_24 td_semibold td_white_color td_mb_4">
                        {item.title}
                      </h3>
                      <p className="mb-0 td_white_color td_opacity_7">
                        {item.description}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
