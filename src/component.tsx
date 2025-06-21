import html2canvas from "html2canvas";
import React from "react";
import logo from "./logo.png";
import { SetList } from "./model";

export const SetListProxy: React.FunctionComponent<SetList & { qrCodeURL: string }> = (v) => {


  switch (v.theme) {
    case "mqtn":
      return <MQTNSetlist {...v} />;
    case "basic":
      return <BasicSetlist {...v} />;
    case "minimal":
      return <MinimalSetlist {...v} />;
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
              <img className="ui huge image" src={logo} alt="mosquitone logo" />
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
            {(event.openTime || event.startTime) && <p>
              {event.openTime && `OPEN ${event.openTime}, `}{event.startTime && `START: ${event.startTime}`}
            </p>}
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
                    <div className="content" style={{ fontSize: getDynamicFontSize(playings.length) }}>{playing.title}</div>
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
            {(event.openTime || event.startTime) && <p>
              {event.openTime && `OPEN ${event.openTime}, `}{event.startTime && `START: ${event.startTime}`}
            </p>}
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
                    <div className="content" style={{ fontSize: getDynamicFontSize(playings.length) }}>{playing.title}</div>
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

export function captureNode(el: HTMLElement): Promise<Blob> { return new Promise(async (res, rej) => (await html2canvas(el)).toBlob(b => b ? res(b) : rej())) } 