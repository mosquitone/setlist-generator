import { ErrorMessage, Field, FieldArray, Formik, useField } from "formik";
import html2canvas from "html2canvas";
import QR from "qrcode";
import React, {
  ReactElement,
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import ReactDOM from "react-dom/client";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import {
  Accordion,
  Button,
  Divider,
  Dropdown,
  Form,
  Grid,
  Header,
  Icon,
  Input,
  Label,
  List,
  Loader,
  Menu,
  Message,
  Modal,
  Placeholder,
  Popup,
  Segment,
  Transition
} from "semantic-ui-react";
import { useSetlistManager } from "./client";
import { SetListProxy } from "./component";
import { SetList, SetListSchema, SetListValue } from "./model";

async function makeImage(node: ReactNode) {
  const el = document.createElement("div");
  el.style.width = "fit-content";
  el.style.position = "absolute"
  el.style.bottom = "0"
  el.style.transform = "translate(-100%, -100%)"
  document.body.appendChild(el)
  const root = ReactDOM.createRoot(el);
  await new Promise((resolve) => {
    root.render(<div ref={resolve}>{node}</div>);
  });
  const canvas = await html2canvas(el, { onclone: () => { return new Promise(r => setTimeout(r, 500)) } });
  root.unmount()
  document.body.removeChild(el)
  const blob = await new Promise<Blob>((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject()))
  );
  const url = URL.createObjectURL(blob);
  const revoke = () => URL.revokeObjectURL(url);
  return [url, revoke];
}

export const Home = () => {
  const m = useSetlistManager();
  const history = useMemo(
    () =>
      m
        .getHistory()
        .reverse()
        .filter((i, m, a) => a.indexOf(i) === m)
        .map((i) => i),
    [m]
  );
  const loader = useCallback(() => m.getAll(history), [m, history]);

  const { loading, data } = useLoading(loader);
  return (
    <Segment basic>
      <Header>
        <Header.Content as="h1">mosquitone Setlist Generator</Header.Content>
        <Header.Subheader as="h2">To create setlist is fun.</Header.Subheader>
      </Header>
      <Menu text vertical fluid>
        <Menu.Item header>content</Menu.Item>
        <Menu.Item as={Link} to="/new">
          <Icon name="gamepad" />
          Create new setlist
        </Menu.Item>
        {history.length > 0 && (
          <Menu.Item>
            <Accordion
              inline
              panels={[
                {
                  key: "history",
                  title: {
                    children: (
                      <>
                        <Icon name="history" />
                        Recent setlist
                        <Icon name="dropdown" />
                      </>
                    ),
                  },
                  content: {
                    content: (
                      <List link>
                        {history.filter(i => !data || data[i] != null).map((i) => (
                          <List.Item key={i}>
                            <List.Content as={Link} to={"/show/" + i}>
                              {i}
                              <List.Description>
                                {data ? (
                                  data[i]?.displayName || "NotFound"
                                ) : (
                                  <Placeholder
                                    content={
                                      <Placeholder.Line></Placeholder.Line>
                                    }
                                  />
                                )}
                              </List.Description>
                              {/* } */}
                            </List.Content>
                          </List.Item>
                        ))}
                      </List>
                    ),
                  },
                },
              ]}
            />
          </Menu.Item>
        )}
      </Menu>
    </Segment>
  );
};

const FormValuePersistanceManager = {
  KEY: "setlist_create_form_value_v2",
  canRestore: () =>
    localStorage.getItem(FormValuePersistanceManager.KEY) !== null,
  store: (values: SetListValue) =>
    localStorage.setItem(
      FormValuePersistanceManager.KEY,
      JSON.stringify(values)
    ),
  restore: () =>
    FormValuePersistanceManager.canRestore()
      ? JSON.parse(
        localStorage.getItem(FormValuePersistanceManager.KEY) as string
      )
      : null,
  clear: () => localStorage.clear(),
};

const CreateFormInput: React.FunctionComponent<
  { [key: string]: any } & {
    name: string;
    label?: string;
    placeholder: string;
  }
> = ({ name, label, placeholder, ...rest }) => (
  <Form.Field {...rest}>
    {label && <label htmlFor={name}>{label}</label>}
    <Field placeholder={placeholder} name={name}></Field>
    <ErrorMessage
      component="div"
      className="ui error message"
      name={name}
      render={(msg: any) => (
        <Label color="red" pointing="above" basic>
          {msg}
        </Label>
      )}
    />
  </Form.Field>
);

enum RestoreStatus {
  READY,
  DOING,
  COMPLETE,
  FAILURE,
  NEVER,
}

function PlayingField({ name }: { name: string }) {
  const f = useField(name);
  const [openMisc, setOpenMisc] = useState(f[0].value?.note);
  return (
    <span
      style={{ display: "flex", flexDirection: "column", alignItems: "end" }}
    >
      <CreateFormInput
        name={`${name}.title`}
        placeholder="SONG or MC"
        style={{ width: "100%" }}
        required
      />
      {!openMisc ? (
        <Link
          to="_"
          onClick={(ev) => {
            ev.preventDefault();
            setOpenMisc(true);
          }}
          style={{ marginTop: "-1rem" }}
        >
          misc
        </Link>
      ) : (
        <CreateFormInput
          label="note"
          inline
          name={`${name}.note`}
          placeholder="note"
          style={{ width: "" }}
        />
      )}
    </span>
  );
}

export const CreateSetlistPage: React.FunctionComponent = withLoading(
  () => {
    const location = useLocation();
    const params = new URLSearchParams(location.search);
    const from = params.get("from");

    const manager = useSetlistManager();

    return useCallback(async () => {
      return { setlist: from ? await manager.get(from) : null, manager };
    }, [manager, from]);
  },
  (_, { loading, data, error }) => {
    const navigate = useNavigate();

    return (
      <>
        <Header>
          <Header.Content as="h1">Create New Setlist</Header.Content>
          <Header.Subheader as="h2">
            please fill following form{" "}
            <span role="img" aria-label="fire">
              {" "}
              🔥{" "}
            </span>
          </Header.Subheader>
        </Header>{" "}
        {error ? (
          <Message error content={error}></Message>
        ) : (
          <SetlistForm
            onSubmit={async (v) => {
              const id = await data?.manager.create(v);
              navigate(`/show/${id}`);
            }}
            loading={loading}
            setlist={data?.setlist!}
          ></SetlistForm>
        )}
      </>
    );
  }
);
export const UpdateSetlistPage: React.FunctionComponent = withLoading(
  () => {
    const manager = useSetlistManager();
    const { id } = useParams();

    const navigate = useNavigate();
    return useCallback(async () => {
      const data = { setlist: await manager.get(id!), manager, id };
      if (!data.setlist) {
        navigate("/404")
      }
      return data;
    }, [manager, id]);
  },
  (_, { loading, data, error }) => {
    const navigate = useNavigate();

    const [confirmOverride, setConfirmOverride] = useState<{ confirm: boolean, setlist: SetListValue | null, resolver: null | (() => void) }>({ confirm: false, setlist: null, resolver: null });
    const handleTrySubmit = useCallback(async (v: SetListValue, operation: "update" | "create" = "update", forceOverride: boolean = false) => {
      if (!data) {
        return
      }
      setConfirmOverride(a => ({ ...a, confirm: false }))
      if (operation === "update") {
        if (data?.setlist.band.name !== v.band.name && !forceOverride) {
          return new Promise<void>(r => {
            setConfirmOverride({
              confirm: true,
              setlist: v,
              resolver: () => r()
            });
          })
        }
        await data?.manager.update(data.id!, v)
        confirmOverride.resolver?.()
        navigate(`/show/${data?.id}`);
      }
      if (operation === "create") {
        const id = await data?.manager.create(v)
        navigate(`/show/${id}`);
      }
    }, [data])

    return (
      <>
        <Header>
          <Header.Content as="h1">Update Setlist</Header.Content>
          <Header.Subheader as="h2">
            please fill following form{" "}
            <span role="img" aria-label="fire">
              {" "}
              🔥{" "}
            </span>
          </Header.Subheader>
        </Header>{" "}
        <Modal open={confirmOverride.confirm} header="Confirm override" closeOnDimmerClick content={{
          content:
            <Segment basic>
              <p>
                You changed band name from <code>{data?.setlist.band.name}</code> to <code>{confirmOverride.setlist?.band.name}</code>.
              </p>
              <p>
                Maybe you intended to create new setlist?
              </p>
              <p>
                Please confirm to override band name.
              </p>
            </Segment>
        }} actions={{
          content: <>
            <Button primary content="I'm sure(update setlist)" onClick={() => { return handleTrySubmit(confirmOverride.setlist!, "update", true) }} />
            <Button secondary content="I want to create new setlist(create new setlist)" onClick={() => { return handleTrySubmit(confirmOverride.setlist!, "create") }} />
            <Button content="cancel" onClick={(e => { confirmOverride.resolver?.(); setConfirmOverride({ confirm: false, setlist: null, resolver: null }) })} />
          </>
        }} closeOnEscape />
        {error ? (
          <Message error content={error}></Message>
        ) : (
          <SetlistForm
            onSubmit={async (v) => {
              return handleTrySubmit(v, "update")
            }}
            loading={loading}
            setlist={data?.setlist}
          ></SetlistForm>
        )}
      </>
    );
  }
);
function SetlistForm({
  loading,
  onSubmit,
  setlist,
}: {
  loading: boolean;
  onSubmit: (values: SetListValue) => Promise<void>;
  setlist?: SetList;
}) {
  const [restoreStatus, setRestoreStatus] = useState<RestoreStatus>(
    RestoreStatus.NEVER
  );
  const formContainerRef = React.createRef<HTMLDivElement>();
  useEffect(() => {
    if (!loading && !setlist && FormValuePersistanceManager.canRestore()) {
      setRestoreStatus(RestoreStatus.READY);
    }
  }, [loading, setlist]);

  const [submitState, setSubmitState] = useState<{
    submit: boolean;
    error: string | null;
  }>({ submit: false, error: null });

  return (
    <>
      <Formik
        enableReinitialize
        initialValues={{
          ...SetListSchema.cast(setlist || { band: { name: "mosquitone" } }),
          meta: {
            createDate: new Date().toLocaleDateString(),
            version: "v2.0.0",
          },
        }}
        validationSchema={SetListSchema}
        onSubmit={(values) => {
          FormValuePersistanceManager.store(values);
          setSubmitState({ submit: true, error: null });
          onSubmit(values)
            .catch((error) => {
              setSubmitState((a) => ({
                ...a,
                error: error instanceof Error ? error.message : "unknown",
              }));
            })
            .finally(() => {
              setSubmitState((a) => ({ ...a, submit: false }));
            });
        }}
        render={(formik) => (
          <Form
            loading={loading || restoreStatus === RestoreStatus.DOING}
            error={Object.keys(formik.errors).length > 0 || !!submitState.error}
          >
            <div ref={formContainerRef} style={{ marginTop: "2.5rem" }}>
              {restoreStatus === RestoreStatus.FAILURE && (
                <Message
                  attached
                  error
                  onDismiss={() => {
                    setRestoreStatus(RestoreStatus.NEVER);
                  }}
                >
                  <Message.Header>Restore Failure !</Message.Header>
                  <Message.Content>Error while restoring.</Message.Content>
                </Message>
              )}
              {restoreStatus === RestoreStatus.READY && (
                <Message
                  attached
                  info
                  onDismiss={() => {
                    setRestoreStatus(RestoreStatus.NEVER);
                  }}
                >
                  <Message.Header>Reuse setlist?</Message.Header>
                  <Message.Content>
                    <p>You can start from the last submitterd information.</p>
                    <Popup
                      size="large"
                      on="click"
                      trigger={<Button content="Restore"></Button>}
                    >
                      <Segment basic>
                        <Header color="red">
                          Danger
                          <Header.Subheader>
                            restore value will override current form input!
                          </Header.Subheader>
                        </Header>
                        <p>Are you sure?</p>
                        <Button
                          color="green"
                          content="OK"
                          onClick={() => {
                            setRestoreStatus(RestoreStatus.DOING);
                            setTimeout(() => {
                              const restoredValue =
                                FormValuePersistanceManager.restore();
                              if (restoredValue) {
                                formik.setValues(restoredValue);
                                setRestoreStatus(RestoreStatus.COMPLETE);
                              } else {
                                setRestoreStatus(RestoreStatus.FAILURE);
                              }
                            }, 1000);
                          }}
                        ></Button>
                      </Segment>
                    </Popup>
                  </Message.Content>
                </Message>
              )}
              {submitState.error && (
                <Message
                  error
                  header={"保存エラー"}
                  onDismiss={() => {
                    setSubmitState({ error: null, submit: false });
                  }}
                  content={submitState.error}
                />
              )}
              <Header as="h2">Band</Header>
              <Segment>
                <CreateFormInput
                  name="band.name"
                  placeholder="bandname"
                  label="Name"
                  required
                ></CreateFormInput>
              </Segment>
              <Header as="h2">Event</Header>
              <Segment>
                <Form.Group>
                  <CreateFormInput
                    width={16}
                    required
                    name="event.name"
                    placeholder="mosquitone show"
                    label="Name"
                  />
                </Form.Group>
                {loading || (
                  <Accordion
                    defaultActiveIndex={
                      setlist &&
                        ((e) => e.date || e.openTime || e.startTime)(
                          setlist.event
                        )
                        ? 0
                        : undefined
                    }
                    panels={[
                      {
                        key: "option",
                        title: "Option",
                        content: {
                          content: (
                            <Form.Group widths={"equal"}>
                              <CreateFormInput
                                name="event.date"
                                placeholder="yyyy-mm-dd"
                                label="Date"
                              />
                              <CreateFormInput
                                name="event.openTime"
                                placeholder="hh:mm"
                                label="Open"
                              />
                              <CreateFormInput
                                name="event.startTime"
                                placeholder="hh:mm"
                                label="Start"
                              />
                            </Form.Group>
                          ),
                        },
                      },
                    ]}
                  />
                )}
              </Segment>
              <Header as="h2">Playings</Header>
              <Segment>
                {typeof formik.errors.playings === "string" && (
                  <ErrorMessage
                    component="div"
                    className="ui error message"
                    name="playings"
                  />
                )}
                <FieldArray
                  name="playings"
                  render={(arrayHelper: any) => (
                    <Transition.Group duration={500} as={Grid}>
                      {formik.values.playings.map((p, idx, arr) => (
                        <Grid.Row key={p._id}>
                          <Grid.Column
                            style={{
                              padding: "0 1rem",
                              display: "flex",
                              width: "100%",
                              "": "",
                              alignItems: "flex-start",
                              gap: "1rem",
                            }}
                          >
                            <label htmlFor="" className="required">
                              {idx + 1}
                            </label>
                            <label style={{ width: "100%" }}>
                              <PlayingField name={`playings[${idx}]`} />
                            </label>
                            <Button.Group size="small">
                              <Button
                                disabled={idx < 1}
                                icon
                                onClick={() => arrayHelper.swap(idx - 1, idx)}
                              >
                                <Icon name="arrow up"></Icon>
                              </Button>
                              <Button
                                disabled={idx >= arr.length - 1}
                                icon
                                onClick={() => arrayHelper.swap(idx, idx + 1)}
                              >
                                <Icon name="arrow down"></Icon>
                              </Button>
                              <Button
                                icon
                                onClick={() => arrayHelper.remove(idx)}
                              >
                                <Icon name="close"></Icon>
                              </Button>
                            </Button.Group>
                          </Grid.Column>
                        </Grid.Row>
                      ))}
                      <Grid.Column width="three">
                        <Button
                          icon
                          onClick={() =>
                            arrayHelper.push({
                              title: "",
                              note: "",
                              _id: Math.random(),
                            })
                          }
                        >
                          <Icon name="add"></Icon>
                        </Button>
                      </Grid.Column>
                    </Transition.Group>
                  )}
                />
              </Segment>
              <Form.Field
                onClick={formik.submitForm}
                loading={submitState.submit}
                control={Button}
                size="big"
              >
                Submit
              </Form.Field>
            </div>
          </Form>
        )}
      ></Formik>
      <Popup
        context={formContainerRef}
        content="Complete!"
        position="top center"
        onClose={() => setRestoreStatus(RestoreStatus.NEVER)}
        open={restoreStatus === RestoreStatus.COMPLETE}
      ></Popup>
    </>
  );
}

const SharePanel: React.FunctionComponent<{
  url: string;
  message: string;
  title: string;
  signature?: boolean | string;
}> = ({ url, message, title, signature }) => {
  const [urlInput, setURLInput] = useState<HTMLInputElement>();

  const [showCopyCompletePopup, setShowCopyCompletePopup] = useState(false);

  const onCopyComplete = useCallback(() => {
    setShowCopyCompletePopup(true);
    setTimeout(() => {
      setShowCopyCompletePopup(false);
    }, 1000);
  }, [setShowCopyCompletePopup]);

  const copyURL = useCallback(() => {
    if (urlInput) {
      urlInput.focus();
      urlInput.setSelectionRange(0, urlInput.value.length);
      document.execCommand("copy");
      urlInput.setSelectionRange(0, 0);
      urlInput.blur();
      onCopyComplete();
    }
  }, [urlInput, onCopyComplete]);

  const supportShareAPI = (navigator as any).share;

  return (
    <>
      <Segment placeholder>
        <Grid columns={supportShareAPI ? 2 : 1} stackable textAlign="center">
          <Grid.Column verticalAlign="middle" textAlign="center">
            <Header>Copy URL</Header>
            <Input
              readOnly
              ref={(instance: any) => {
                instance && setURLInput(instance.inputRef.current);
              }}
              size="large"
              fluid
              value={url}
              action={
                <Popup
                  open={showCopyCompletePopup}
                  content="Copied!"
                  position="top center"
                  trigger={
                    <Button
                      {...{
                        color: "teal",
                        labelPosition: "right",
                        icon: "copy",
                        content: "Copy",
                        onClick: copyURL,
                      }}
                    ></Button>
                  }
                ></Popup>
              }
            />
          </Grid.Column>
          {supportShareAPI && (
            <>
              <Divider vertical>or</Divider>
              <Grid.Column textAlign="center" verticalAlign="middle">
                <Header>Share to Apps you want</Header>
                <Button
                  icon="share"
                  content="Share"
                  color="blue"
                  size="big"
                  onClick={() => {
                    (navigator as any).share({
                      title,
                      url,
                      text:
                        message +
                        "\n" +
                        `${signature
                          ? typeof signature === "string"
                            ? signature
                            : "mosquitone setlist generator"
                          : ""
                        }`,
                    });
                  }}
                ></Button>
              </Grid.Column>
            </>
          )}
        </Grid>
      </Segment>
    </>
  );
};

export const ShowSetlist = withLoading(
  (_: {}) => {
    const { id } = useParams();

    const manager = useSetlistManager();

    const navigate = //. 
      useNavigate();
    return useCallback(async () => {
      const qrCodeURL = await QR.toDataURL(window.location.href);
      const setlist = await manager.get(id!);
      if (!setlist) {
        navigate("/404")
      }



      const images = await Promise.all(
        ["basic", "mqtn", "minimal"].map((t) =>
          makeImage(
            <SetListProxy qrCodeURL={qrCodeURL} {...setlist} theme={t as any} />
          ).then((i) => [t, i[0]] as [string, string])
        )
      );

      return {
        setlist,
        manager,
        images: images.reduce<any>((t, [theme, image]) => ({ ...t, [theme]: image }), {}),
        id: id as string,
      };
    }, [manager, id]);
  },
  (_, { loading, error, data }) => {
    const navigate = useNavigate();

    const setlistSelectorId = "mqtn_setlist";
    const currentURL = window.location.href;
    const imageURL = `${window.location.origin
      }/api/print?url=${encodeURIComponent(
        currentURL
      )}&selector=${encodeURIComponent(
        `#${setlistSelectorId}`
      )}&filename=mosquitone_setlist&type=png`;

    const sharableURLs = [
      {
        name: "Page",
        url: currentURL,
      },
    ];
    const [selectedURLIndex, setSelectedURLIndex] = useState(0);

    const [theme, setTheme] = useState<SetList["theme"] | null>(null);

    useEffect(() => {
      if (data?.setlist) {
        setTheme(() => data.setlist.theme);
        data.manager.pushToHistory(data.id);
      }
    }, [data]);

    return (
      <>
        <Message className="mqtn unprint">
          <Message.Header as="h1">Setlist Generated !</Message.Header>
        </Message>
        <Menu className="mqtn unprint">
          <Menu.Item
            onClick={() =>
              navigate({
                pathname: `/update/${data?.id}`,
              })
            }
            name="edit"
          ></Menu.Item>
          <Menu.Item
            name="download"
            disabled={loading}
            as={"a"}
            href={data && data.images[theme || "basic"]}
          ></Menu.Item>
          <Modal trigger={<Menu.Item name="share"></Menu.Item>}>
            <Modal.Header>
              Share Setlist{" "}
              <Dropdown
                simple
                inline
                size="small"
                value={selectedURLIndex}
                options={sharableURLs.map(({ name }, idx) => ({
                  text: name,
                  value: idx,
                }))}
                onChange={(_, { value }) =>
                  setSelectedURLIndex(parseInt(value as string))
                }
              />
            </Modal.Header>
            <Modal.Content>
              <SharePanel
                url={sharableURLs[selectedURLIndex].url}
                title={`mosquitone setlist for ${data?.setlist?.event?.name}`}
                message="I've created new setlist!"
                signature
              />
            </Modal.Content>
          </Modal>
          <Menu.Item
            link
            onClick={() => {
              navigate(`/new?from=${data?.id}`);
            }}
          >
            Duplicate
          </Menu.Item>
        </Menu>
        <div>
          {error ? (
            <Message
              error
              header={"エラー"}
              content={error instanceof Error ? error.message : "unkown"}
            />
          ) : loading ? (
            <Segment children={<Loader active />} basic />
          ) : (
            data && (
              <>
                <div
                  style={{
                    display: "flex",
                    gap: "2px",
                    justifyContent: "flex-end",
                    padding: "1rem",
                  }}
                >
                  Theme:
                  <Dropdown
                    simple
                    inline
                    options={[
                      { value: "mqtn", text: "mosquitone" },
                      { value: "basic", text: "basic" },
                      { value: "minimal", text: "minimal" },
                    ]}
                    value={theme || ""}
                    onChange={(_, { value }) => {
                      setTheme(value as SetList["theme"]);
                      data.manager.update(data.id, {
                        ...data.setlist,
                        theme: value as any,
                      });
                    }}
                  />
                </div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                  }}
                >
                  {data && <img src={data?.images[theme || "basic"]} style={{ width: "100%" }}></img>}
                </div>
              </>
            )
          )}
        </div>
      </>
    );
  }
);

export const NotFound = () => {
  return (
    <Segment basic>
      <Message>
        <Message.Header>Appa! Content not found</Message.Header>
        Not Found
      </Message>
    </Segment>
  );
};

function useLoading<Data>(loader: () => Promise<Data>) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<Data | null>(null);
  const [error, setError] = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    (async () => {
      try {
        setData(await loader());
      } catch (e: any) {
        setError(e);
      } finally {
        setLoading(false);
      }
    })();
  }, [loader]);

  useEffect(load, [load]);

  return {
    loading,
    data,
    error,
    reload: load,
  };
}
function withLoading<Props extends React.PropsWithChildren, LoadData>(
  loaderFactory: (props: Props) => () => Promise<LoadData>,
  render: (
    props: Props,
    loadingState: {
      loading: boolean;
      error: any;
      data: LoadData | null;
      reload: () => void;
    }
  ) => ReactElement
): React.FunctionComponent<Props> {
  return function (props: Props) {
    const loader = loaderFactory(props);
    const state = useLoading(loader);
    return render(props, state);
  };
}

function useDownload() {
  const ref = useRef<HTMLElement | null>(null);
  const [state, setState] = useState<{ loading: boolean; error: any }>({
    loading: false,
    error: null,
  });

  const handleDownload = useCallback(() => {
    if (!ref.current) {
      return;
    }
    const element = ref.current;
    (async () => {
      setState({ loading: true, error: null });
      const canvas = await html2canvas(element);
      const blob = await new Promise<Blob>((r, j) =>
        canvas.toBlob((b) => (b ? r(b) : j(b)))
      );
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.target = "_blank";
      anchor.download = "mosquitone_setlist";
      anchor.href = url;
      anchor.click();
      URL.revokeObjectURL(url);
      setState({ loading: false, error: null });
    })()
      .catch((e) => setState((state) => ({ ...state, error: e })))
      .finally(() => {
        setState((state) => ({ ...state, loading: false }));
      });
  }, [ref]);

  return {
    state,
    ref,
    handleDownload,
  };
}
