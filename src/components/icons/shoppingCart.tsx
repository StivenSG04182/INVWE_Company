import React from 'react';

interface IconProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
}

export const ShoppingCart = ({ size = 24, ...props }: IconProps) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M2 2H4L5.6 13M5.6 13C5.6 13.5523 6.04772 14 6.6 14H17.4C17.9523 14 18.4 13.5523 18.4 13C18.4 12.4477 17.9523 12 17.4 12H6.6C6.04772 12 5.6 12.4477 5.6 13ZM7 17C7 17.5523 7.44772 18 8 18C8.55228 18 9 17.5523 9 17C9 16.4477 8.55228 16 8 16C7.44772 16 7 16.4477 7 17ZM16 17C16 17.5523 16.4477 18 17 18C17.5523 18 18 17.5523 18 17C18 16.4477 17.5523 16 17 16C16.4477 16 16 16.4477 16 17Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M5 6H19.4C19.7314 6 20 6.26863 20 6.6V7.4C20 7.73137 19.7314 8 19.4 8H7"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default ShoppingCart;