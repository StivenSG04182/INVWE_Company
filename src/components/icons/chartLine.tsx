import React from 'react';

const ChartLine = () => {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M2 22H22"
        stroke="#70799A"
        strokeWidth="1.5"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="stroke-[#70799A] text-xl transition-all"
      />
      <path
        d="M9.75 4V22H14.25V4C14.25 2.9 13.8 2 12.45 2H11.55C10.2 2 9.75 2.9 9.75 4Z"
        className="fill-[#C8CDD8] text-xl transition-all"
      />
      <path
        d="M3 10V22H7V10C7 8.9 6.6 8 5.4 8H4.6C3.4 8 3 8.9 3 10Z"
        className="fill-[#70799A] text-xl transition-all"
      />
      <path
        d="M17 15V22H21V15C21 13.9 20.6 13 19.4 13H18.6C17.4 13 17 13.9 17 15Z"
        className="fill-[#C8CDD8] text-xl transition-all"
      />
    </svg>
  );
};

export default ChartLine;