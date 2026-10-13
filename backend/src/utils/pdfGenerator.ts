import puppeteer from "puppeteer";

interface PdfOptions {
  title: string;
  html: string;
  filename?: string;
}

export const generatePdf = async ({
  html,
}: PdfOptions): Promise<Buffer> => {
  const browser = await puppeteer.launch({
    headless: true,
  });

  try {
    const page = await browser.newPage();

    await page.setContent(html, {
      waitUntil: "load",
    });

    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: {
        top: "20mm",
        right: "15mm",
        bottom: "20mm",
        left: "15mm",
      },
    });

    return Buffer.from(pdf);
  } finally {
    await browser.close();
  }
};