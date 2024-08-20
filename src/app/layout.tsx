import "~/styles/globals.css";
import "@mantine/core/styles.css";
import "@mantine/dropzone/styles.css";

import { GeistSans } from "geist/font/sans";

import { TRPCReactProvider } from "~/trpc/react";
import { MantineProvider, ColorSchemeScript, createTheme } from "@mantine/core";

export const metadata = {
  title: "Hazel PDF Editor",
  description: "Hazel PDF Editor",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

const theme = createTheme({
  /** Put your mantine theme override here */
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${GeistSans.variable}`}>
      <head>
        <ColorSchemeScript />
      </head>
      <body>
        <TRPCReactProvider>
          <MantineProvider theme={theme}>{children}</MantineProvider>
        </TRPCReactProvider>
      </body>
    </html>
  );
}
