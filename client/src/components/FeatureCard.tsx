import Image from "next/image";
import Link from "next/link";
import React from "react";

const FeatureCard = ({
  imageSrc,
  title,
  description,
  linkText,
  linkHref,
}: {
  imageSrc: string;
  title: string;
  description: string;
  linkText: string;
  linkHref: string;
}) => {
  return (
    <div className="text-center">
      <div className="p-4 rounded-lg mb-4 flex item-center justify-center h-48">
        <Image
          src={imageSrc}
          width={400}
          height={400}
          className="w-full h-full object-contain"
          alt={title}
        />
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="mb-4">{description}</p>
      <Link
        href={linkHref}
        scroll={false}
        className="inline-block border border-gray-300 rounded px-4 py-2 hover:bg-gray-100"
      >
        {linkText}
      </Link>
    </div>
  );
};

export default FeatureCard;
