export const metadata = {
  title: "How Nigerian Are You?",
  description: "Find out how many Nigerian states you have physically visited. Challenge your friends!",
  openGraph: {
    title: "How Nigerian Are You?",
    description: "I've visited X out of 37 Nigerian states. Can you beat me?",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "How Nigerian Are You?",
    description: "Find out how many Nigerian states you've visited!",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#052e16" />
      </head>
      <body style={{ margin: 0, background: "#052e16" }}>{children}</body>
    </html>
  );
}
