/* Shown only while a tailored page is being prepared (scrape + model). */
export default function Loading() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        background: "#0b1015",
        color: "#7f8c96",
        fontFamily: "system-ui, sans-serif",
        fontSize: "0.95rem",
      }}
    >
      Preparing page…
    </div>
  );
}