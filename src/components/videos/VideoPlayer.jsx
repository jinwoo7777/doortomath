"use client";

import React, { useEffect, useState } from "react";
import dynamic from 'next/dynamic';
import "reactjs-popup/dist/index.css";

// 서버 사이드에서 로드하지 않도록 동적 임포트
const Popup = dynamic(
  () => import('reactjs-popup').then((mod) => mod.default),
  { ssr: false }
);

export const VideoPlayer = ({ trigger, videoId, ...props }) => {
  return (
    <>
      <div className="video-player-wrapper">
        <Popup
          trigger={trigger}
          position="center center"
          modal
          nested
          contentStyle={{
            width: '90vw',
            maxWidth: '1200px',
            padding: 0,
            border: 'none',
            borderRadius: '8px',
            overflow: 'hidden',
            background: 'transparent',
          }}
          overlayStyle={{
            background: 'rgba(0, 0, 0, 0.7)'
          }}
          closeOnDocumentClick
          lockScroll
        >
          <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
            <iframe
              src={`https://www.youtube.com/embed/${videoId || 'rRid6GCJtgc'}`}
              width="100%"
              height="100%"
              className="absolute top-0 left-0 w-full h-full"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title="YouTube video player"
            />
          </div>
        </Popup>
      </div>
    </>
  );
};
