// Browser-based PDF encryption using QPDF
import QPDF from "qpdf-wasm-esm-embedded";

export async function lockPdf(file: File, userPw: string, ownerPw: string) {
  const qpdf = await QPDF() as any;
  qpdf.FS.writeFile("/in.pdf", new Uint8Array(await file.arrayBuffer()));
  qpdf.callMain(["--encrypt", userPw, ownerPw, "256", "--", "/in.pdf", "/out.pdf"]);
  const out = qpdf.FS.readFile("/out.pdf");
  return new Blob([out], { type: "application/pdf" });
}
