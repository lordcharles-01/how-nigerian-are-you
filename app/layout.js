export const metadata = {
  metadataBase: new URL("https://how-nigerian-are-you.vercel.app"),
  title: "How Nigerian Are You?",
  description: "Find out how many Nigerian states you have physically visited. Challenge your friends!",
  openGraph: {
    title: "How Nigerian Are You?",
    description: "No lies. No audio travelling. Find out how many of Nigeria's 36 states + FCT you've actually visited.",
    type: "website",
    url: "https://how-nigerian-are-you.vercel.app",
    images: [
      {
        url: "https://how-nigerian-are-you.vercel.app/og-image.png",
        width: 1200,
        height: 630,
        alt: "How Nigerian Are You? — The Nigerian states travel quiz",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "How Nigerian Are You?",
    description: "No lies. No audio travelling. Find out how many of Nigeria's 36 states + FCT you've actually visited. 🇳🇬",
    images: ["https://how-nigerian-are-you.vercel.app/og-image.png"],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#052e16" />
        <meta property="og:image" content="https://how-nigerian-are-you.vercel.app/og-image.png" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta name="twitter:image" content="https://how-nigerian-are-you.vercel.app/og-image.png" />
        <meta name="twitter:card" content="summary_large_image" />
      </head>
      <body style={{ margin: 0, background: "#052e16" }}>{children}</body>
    </html>
  );
}