import Link from "next/link";
import "../biotech/biotech.css";
import "../fintech/fintech.css";
import "./articles.css";
import NeuralField from "../biotech/neuralfield";
import ChartField from "../fintech/chartfield";

/* Shared frame for every /articles route: theme, top bar, footer. */
export default function ArticleShell({
  children,
  theme = "biotech",
  progress = false,
}: {
  children: React.ReactNode;
  theme?: "biotech" | "fintech";
  progress?: boolean;
}) {
  return (
    <div className={`bio art ${theme === "fintech" ? "fin" : ""}`}>
      {theme === "fintech" ? <ChartField /> : <NeuralField />}
      {progress && (
        <div className="art-progress" aria-hidden="true">
          <i />
        </div>
      )}

      <header className="top">
        <div className="wrap top-in">
          <Link href="/" className="top-name">Caleb Liu</Link>
          <nav className="top-nav" aria-label="Site">
            <Link href="/articles">Articles</Link>
            <Link href="/biotech">Biotech</Link>
            <Link href="/fintech">Fintech</Link>
          </nav>
        </div>
      </header>

      {children}

      <footer className="wrap foot">
        <span>Caleb Liu</span>
        <span>Software for biotech and finance</span>
      </footer>
    </div>
  );
}