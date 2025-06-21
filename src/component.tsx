import html2canvas from "html2canvas";
import React from "react";
import logo from "./logo.png";
import mqtnLogo from "/MQTN_LOGO_white_ver_nonback.png";
import { SetList } from "./model";

export const SetListProxy: React.FunctionComponent<
  SetList & { qrCodeURL: string }
> = v => {
  switch (v.theme) {
    case "mqtn":
      return <MQTNSetlist {...v} />;
    case "basic":
      return <BasicSetlist {...v} />;
    case "minimal":
      return <MinimalSetlist {...v} />;
    case "mqtn2":
      return <Mqtn2Setlist {...v} />;
    default:
      break;
  }
};

const MQTNSetlist = ({
  theme,
  band,
  event,
  playings,
  qrCodeURL,
}: SetList & { qrCodeURL: string }) => {
  const getDynamicFontSize = (itemCount: number) => {
    if (itemCount <= 8) return "2em";
    if (itemCount <= 12) return "1.5em";
    if (itemCount <= 16) return "1.3em";
    if (itemCount <= 20) return "1.1em";
    if (itemCount <= 25) return "0.95em";
    if (itemCount <= 30) return "0.85em";
    return "0.75em";
  };

  return (
    <div className={`mqtn setlist inverted paper container theme-${theme}`}>
      <div className={`mqtn content ui inverted paper padded segment`}>
        <div className="mqtn main ui grid">
          <div className="row">
            <div className="mqtn event ui inverted paper vertical stripe padded segment">
              <div className="ui inverted mqtn huge paper header">
                <div className="content">
                  <h1>{band.name}</h1>
                </div>
                <img
                  className="ui huge image"
                  src={logo}
                  alt="mosquitone logo"
                />
                <h2 className="mqtn ui inverted sub huge paper header">
                  <div className="content">{event.name}</div>
                  <img
                    className="ui right floated image"
                    src={qrCodeURL}
                    alt={`qrcode for setlist`}
                  />
                </h2>
              </div>
              {event.date && <p>{event.date}</p>}
              {(event.openTime || event.startTime) && (
                <p>
                  {event.openTime && `OPEN ${event.openTime}, `}
                  {event.startTime && `START: ${event.startTime}`}
                </p>
              )}
            </div>
          </div>
          <div className="row">
            <div className="centered column">
              <div className="ui padded inverted paper basic segment">
                <div
                  id="mqtn_playing_list"
                  className="ui huge inverted paper divided relaxed list"
                >
                  {playings.map((playing, idx) => (
                    <div key={idx} className="item">
                      <div
                        className="content"
                        style={{
                          fontSize: getDynamicFontSize(playings.length),
                        }}
                      >
                        {playing.title}
                      </div>
                      <div className="description">{playing.note}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const BasicSetlist = ({
  theme,
  band,
  event,
  playings,
  qrCodeURL,
}: SetList & { qrCodeURL: string }) => {
  const getDynamicFontSize = (itemCount: number) => {
    if (itemCount <= 8) return "2em";
    if (itemCount <= 12) return "1.5em";
    if (itemCount <= 16) return "1.3em";
    if (itemCount <= 20) return "1.1em";
    if (itemCount <= 25) return "0.95em";
    if (itemCount <= 30) return "0.85em";
    return "0.75em";
  };

  return (
    <div
      className={`mqtn setlist container theme-${theme}`}
      style={{ background: "#fefefe", border: "1px solid #e1e1e1" }}
    >
      <div className={`mqtn content ui padded basic segment`}>
        <div className="main ui grid">
          <div className="row" style={{ margin: "3rem 0" }}>
            <div className="event ui column">
              <div
                className=""
                style={{ display: "flex", justifyContent: "space-between" }}
              >
                <h1 style={{ fontSize: "3rem" }} className="ui header">
                  <div className="content">
                    {band.name}
                    <div className="sub ui header">{event.name}</div>
                  </div>
                </h1>
                <img
                  src={qrCodeURL}
                  width={50}
                  height={50}
                  alt={`qrcode for this setlist`}
                />
              </div>
              {event.date && <p>{event.date}</p>}
              {(event.openTime || event.startTime) && (
                <p>
                  {event.openTime && `OPEN ${event.openTime}, `}
                  {event.startTime && `START: ${event.startTime}`}
                </p>
              )}
            </div>
          </div>
          <div className="row">
            <div className="centered column">
              <div className="ui padded basic segment">
                <div
                  id="mqtn_playing_list"
                  className="ui huge divided relaxed list"
                >
                  {playings.map((playing, idx) => (
                    <div key={idx} className="item">
                      <div
                        className="content"
                        style={{
                          fontSize: getDynamicFontSize(playings.length),
                        }}
                      >
                        {playing.title}
                      </div>
                      <div className="description">{playing.note}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const MinimalSetlist = ({
  theme,
  band,
  event,
  playings,
  qrCodeURL,
}: SetList & { qrCodeURL: string }) => {
  const getDynamicFontSize = (itemCount: number) => {
    if (itemCount <= 10) return "1.8rem";
    if (itemCount <= 15) return "1.5rem";
    if (itemCount <= 20) return "1.3rem";
    if (itemCount <= 25) return "1.1rem";
    return "1rem";
  };

  return (
    <div
      className={`minimal setlist container theme-${theme}`}
      style={{
        background: "#ffffff",
        color: "#333333",
        fontFamily: "system-ui, -apple-system, sans-serif",
        maxWidth: "800px",
        margin: "0 auto",
        padding: "2rem",
        border: "2px solid #000000",
        borderRadius: "0",
      }}
    >
      <div style={{ textAlign: "center", marginBottom: "2rem" }}>
        <h1
          style={{
            fontSize: "2.5rem",
            fontWeight: "900",
            margin: "0 0 0.5rem 0",
            textTransform: "uppercase",
            letterSpacing: "2px",
          }}
        >
          {band.name}
        </h1>
        <h2
          style={{
            fontSize: "1.5rem",
            fontWeight: "400",
            margin: "0 0 1rem 0",
            textTransform: "uppercase",
            letterSpacing: "1px",
          }}
        >
          {event.name}
        </h2>
        {event.date && (
          <p style={{ fontSize: "1rem", margin: "0.5rem 0" }}>{event.date}</p>
        )}
        {(event.openTime || event.startTime) && (
          <p style={{ fontSize: "1rem", margin: "0.5rem 0" }}>
            {event.openTime && `OPEN ${event.openTime}`}
            {event.openTime && event.startTime && " / "}
            {event.startTime && `START ${event.startTime}`}
          </p>
        )}
      </div>

      <div style={{ marginBottom: "2rem" }}>
        <div
          style={{
            borderTop: "3px solid #000000",
            borderBottom: "1px solid #000000",
            padding: "1rem 0",
          }}
        >
          {playings.map((playing, idx) => (
            <div
              key={idx}
              style={{
                display: "flex",
                alignItems: "baseline",
                marginBottom: "0.8rem",
                fontSize: getDynamicFontSize(playings.length),
              }}
            >
              <span
                style={{
                  minWidth: "3rem",
                  fontWeight: "bold",
                  marginRight: "1rem",
                  fontSize: "1rem",
                }}
              >
                {String(idx + 1).padStart(2, "0")}.
              </span>
              <span style={{ flex: 1, fontWeight: "600" }}>
                {playing.title}
              </span>
              {playing.note && (
                <span
                  style={{
                    fontSize: "0.9rem",
                    color: "#666666",
                    fontStyle: "italic",
                    marginLeft: "1rem",
                  }}
                >
                  {playing.note}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      <div style={{ textAlign: "center" }}>
        <img
          src={qrCodeURL}
          alt="QR Code for setlist"
          style={{
            width: "80px",
            height: "80px",
            border: "2px solid #000000",
          }}
        />
      </div>
    </div>
  );
};

const Mqtn2Setlist = ({
  theme,
  band,
  event,
  playings,
  qrCodeURL,
}: SetList & { qrCodeURL: string }) => {
  const getDynamicFontSize = (itemCount: number) => {
    if (itemCount <= 3) return "3.5rem";
    if (itemCount <= 5) return "3rem";
    if (itemCount <= 7) return "2.7rem";
    if (itemCount <= 9) return "2.4rem";
    if (itemCount <= 11) return "2.1rem";
    if (itemCount <= 13) return "1.9rem";
    if (itemCount <= 15) return "1.7rem";
    if (itemCount <= 18) return "1.5rem";
    if (itemCount <= 21) return "1.4rem";
    if (itemCount <= 24) return "1.3rem";
    if (itemCount <= 27) return "1.2rem";
    if (itemCount <= 30) return "1.1rem";
    if (itemCount <= 35) return "1rem";
    return "0.9rem";
  };

  const getDynamicItemHeight = (itemCount: number) => {
    // セットリストコンテナ内の利用可能な高さを計算
    // セットリストコンテナのpadding: 1.5rem = 24px
    // セットリストタイトル: 1.2rem + margin 1rem = 約40px
    // 残りの高さから gap を除いた分を曲数で割る

    // A4の残り高さから推定: 約400px（調整可能）
    const setlistContentHeight = 400;
    const titleHeight = 40;
    const availableHeight = setlistContentHeight - titleHeight;
    const gapHeight = (itemCount - 1) * 10; // 0.6rem gap ≈ 10px
    const itemHeight = (availableHeight - gapHeight) / itemCount;

    // 最小値を設定（文字が読めるサイズ）
    const finalHeight = Math.max(itemHeight, 30);

    return `${finalHeight}px`;
  };

  return (
    <div
      className={`mqtn2 setlist container theme-${theme}`}
      style={{
        background:
          "linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%)",
        color: "#ffffff",
        fontFamily: "system-ui, -apple-system, 'SF Pro Display', sans-serif",
        width: "210mm",
        height: "297mm",
        padding: "15mm",
        position: "relative",
        boxSizing: "border-box",
        overflow: "hidden",
      }}
    >
      {/* Subtle background pattern */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `
          radial-gradient(circle at 25% 25%, rgba(255, 255, 255, 0.02) 0%, transparent 50%),
          radial-gradient(circle at 75% 75%, rgba(255, 255, 255, 0.01) 0%, transparent 50%)
        `,
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          position: "relative",
          zIndex: 1,
          height: "100%",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Header with logo */}
        <div
          style={{
            textAlign: "center",
            marginBottom: "1.5rem",
            padding: "1rem",
            background: "rgba(255, 255, 255, 0.05)",
            borderRadius: "16px",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
          }}
        >
          <img
            src={mqtnLogo}
            alt="mosquitone logo"
            style={{
              maxWidth: "250px",
              width: "100%",
              filter: "drop-shadow(0 4px 12px rgba(255, 255, 255, 0.1))",
            }}
          />
        </div>

        {/* Event info and QR code */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "1.5rem",
            padding: "1rem 1.5rem",
            background: "rgba(255, 255, 255, 0.08)",
            borderRadius: "12px",
            border: "1px solid rgba(255, 255, 255, 0.12)",
          }}
        >
          <div style={{ flex: 1 }}>
            <h2
              style={{
                fontSize: "1.5rem",
                fontWeight: "500",
                margin: "0 0 0.3rem 0",
                color: "#d0d0d0",
              }}
            >
              {event.name}
            </h2>
            {event.date && (
              <p
                style={{
                  fontSize: "0.9rem",
                  margin: "0.2rem 0",
                  color: "#d0d0d0",
                }}
              >
                {event.date}
              </p>
            )}
            {(event.openTime || event.startTime) && (
              <p
                style={{
                  fontSize: "0.8rem",
                  margin: "0.2rem 0",
                  color: "#c0c0c0",
                }}
              >
                {event.openTime && `OPEN ${event.openTime}`}
                {event.openTime && event.startTime && " / "}
                {event.startTime && `START ${event.startTime}`}
              </p>
            )}
          </div>
          <div
            style={{
              padding: "0.3rem",
              background: "rgba(255, 255, 255, 0.9)",
              borderRadius: "8px",
              boxShadow: "0 4px 16px rgba(0, 0, 0, 0.2)",
              marginLeft: "1rem",
            }}
          >
            <img
              src={qrCodeURL}
              alt="qrcode for setlist"
              style={{
                width: "60px",
                height: "60px",
                borderRadius: "6px",
              }}
            />
          </div>
        </div>

        {/* Setlist */}
        <div
          style={{
            background: "rgba(255, 255, 255, 0.05)",
            borderRadius: "16px",
            padding: "1.5rem",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            backdropFilter: "blur(10px)",
            flex: 1,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <h3
            style={{
              fontSize: "1.2rem",
              fontWeight: "600",
              margin: "0 0 1rem 0",
              textAlign: "center",
              color: "#f0f0f0",
              textTransform: "uppercase",
              letterSpacing: "2px",
            }}
          >
            SETLIST
          </h3>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "0.6rem",
              flex: 1,
              height: "100%",
            }}
          >
            {playings.map((playing, idx) => (
              <div
                key={idx}
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "0.8rem 1rem",
                  background:
                    idx % 2 === 0
                      ? "rgba(255, 255, 255, 0.08)"
                      : "rgba(255, 255, 255, 0.04)",
                  borderRadius: "8px",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                  transition: "all 0.2s ease",
                  flex: 1,
                }}
              >
                <span
                  style={{
                    minWidth: "2.5rem",
                    fontSize: "0.9rem",
                    fontWeight: "700",
                    color: "#6c7ce7",
                    marginRight: "1rem",
                    textAlign: "center",
                  }}
                >
                  {String(idx + 1).padStart(2, "0")}
                </span>

                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontSize: getDynamicFontSize(playings.length),
                      fontWeight: "700",
                      color: "#ffffff",
                      marginBottom: playing.note ? "0.2rem" : "0",
                      textShadow: "0 1px 3px rgba(0, 0, 0, 0.5)",
                    }}
                  >
                    {playing.title}
                  </div>
                  {playing.note && (
                    <div
                      style={{
                        fontSize: "0.7rem",
                        color: "#c0c0c0",
                        fontStyle: "italic",
                      }}
                    >
                      {playing.note}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export function captureNode(el: HTMLElement): Promise<Blob> {
  return new Promise(async (res, rej) =>
    (await html2canvas(el)).toBlob(b => (b ? res(b) : rej()))
  );
}
