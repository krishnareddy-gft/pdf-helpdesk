// Browser-based PDF signing using pdf-lib
import { PDFDocument, rgb } from "pdf-lib";

export async function stampSignature(pdfFile: File, sigPng: File, page=0, x=100, y=100, w=200) {
  const pdfBytes = await pdfFile.arrayBuffer();
  const sigBytes = await sigPng.arrayBuffer();
  const doc = await PDFDocument.load(pdfBytes);
  const png = await doc.embedPng(sigBytes);
  const { width, height } = png.size();
  const scale = w / width;
  const pageRef = doc.getPage(page);
  pageRef.drawImage(png, { x, y, width: width*scale, height: height*scale });
  const out = await doc.save();
  return new Blob([out as BlobPart], { type: "application/pdf" });
}
