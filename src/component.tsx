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

export function captureNode(el: HTMLElement): Promise<Blob> { return new Promise(async (res, rej) => (await html2canvas(el)).toBlob(b => b ? res(b) : rej())) } 