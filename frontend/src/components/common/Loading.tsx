import type { CSSProperties } from "react";

interface LoadingProps {
  fullScreen?: boolean;
  text?: string;
}

const Loading = ({ fullScreen = false, text = "Loading..." }: LoadingProps) => {
  const style = {
    "--loading-height": fullScreen ? "100dvh" : "100%",
  } as CSSProperties;

  return (
    <div
      className={`loading ${fullScreen ? "loading--fullscreen" : ""}`}
      style={style}
      role="status"
      aria-live="polite"
    >
      <div className="loading__content">
        <div className="loading__spinner" aria-hidden="true" />
        <p>{text}</p>
      </div>
    </div>
  );
};

export default Loading;
