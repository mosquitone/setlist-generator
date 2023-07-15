import React from "react";
import { SetList } from "./model";
import logo from "./logo.png";

export const SetListProxy: React.FunctionComponent<SetList> = (v) => {
  const qrCodeURL = `https://chart.apis.google.com/chart?cht=qr&chs=300x300&chl=${encodeURIComponent(
    window.location.href,
  )}&chld=L|1`;

  switch (v.theme) {
    case "mqtn":
      return <MQTNSetlist {...v} qrCodeURL={qrCodeURL} />;
    case "basic":
      return <BasicSetlist {...v} qrCodeURL={qrCodeURL} />;
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
}: SetList & { qrCodeURL: string }) => (
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
            <p>{event.date}</p>
            <p>
              OPEN {event.openTime}, START: {event.startTime}
            </p>
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
                    <div className="content">{playing.title}</div>
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

const BasicSetlist = ({
  theme,
  band,
  event,
  playings,
  qrCodeURL,
}: SetList & { qrCodeURL: string }) => (
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
            <p>{event.date}</p>
            <p>
              OPEN {event.openTime}, START: {event.startTime}
            </p>
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
                    <div className="content">{playing.title}</div>
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
