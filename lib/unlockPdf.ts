// lib/unlockPdf.ts
export async function unlockPdfInBrowser(file: File, password: string) {
  // Import only on the client to avoid SSR issues
  const QPDF = (await import("qpdf-wasm-esm-embedded")).default;
  const qpdf = await QPDF() as any; // init WASM runtime

  // Load the encrypted PDF into qpdf's virtual FS
  const bytes = new Uint8Array(await file.arrayBuffer());
  qpdf.FS.writeFile("/in.pdf", bytes);

  try {
    // qpdf --password=<pw> --decrypt in.pdf out.pdf
    qpdf.callMain([`--password=${password}`, "--decrypt", "--", "/in.pdf", "/out.pdf"]);
  } catch (e) {
    // Wrong password or unsupported file
    throw new Error("Failed to unlock PDF. Is the password correct?");
  }

  const out = qpdf.FS.readFile("/out.pdf");
  return new Blob([out], { type: "application/pdf" });
}
