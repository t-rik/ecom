import { notFound } from "next/navigation";
import { Metadata } from "next";
import { getProductBySlug, getAllProductPaths } from "@/data/products";
import ProductFunnelClient from "@/components/ProductFunnelClient";

interface PageProps {
  params: {
    category: string;
    name: string;
  };
}

export function generateStaticParams() {
  return getAllProductPaths();
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const product = getProductBySlug(params.category, params.name);
  if (!product) {
    return {
      title: "المنتج غير موجود | Pratiko Maroc",
    };
  }

  return {
    title: `${product.title} | الدفع عند الاستلام - Pratiko Maroc`,
    description: product.subtitle,
    openGraph: {
      title: product.title,
      description: product.subtitle,
      images: [
        {
          url: product.images[0],
          width: 800,
          height: 800,
          alt: product.title,
        },
      ],
      locale: "ar_MA",
      type: "website",
    },
  };
}

export default function ProductFunnelPage({ params }: PageProps) {
  const product = getProductBySlug(params.category, params.name);

  if (!product) {
    notFound();
  }

  return <ProductFunnelClient product={product} />;
}
