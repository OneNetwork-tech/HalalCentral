import { Html, Head, Main, NextScript } from 'next/document'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'

export default function Document() {
  return (
    <Html>
      <Head>
        <meta name="description" content="HalalCentral - Find halal restaurants, mosques, and community services in Sweden" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}

