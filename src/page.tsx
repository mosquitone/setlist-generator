import { ErrorMessage, Field, FieldArray, Formik } from "formik";
import React, {
  ReactElement,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
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
  Popup,
  Segment,
  Transition,
} from "semantic-ui-react";
import { useSetlistManager } from "./client";
import { SetListProxy } from "./component";
import { SetList, SetListSchema, SetListValue } from "./model";

export const Home = () => {
  const m = useSetlistManager();
  const history = useMemo(
    () =>
      m
        .getHistory()
        .reverse()
        .filter((i, m, a) => a.indexOf(i) === m)
        .map((i) => i),
    [m],
  );
  const loader = useCallback(() => {
    return Promise.all(history.map((h) => m.get(h)))
      .then((s) =>
        s.reduce<Record<string, SetList>>(
          (m, s, i) => ({ ...m, [history[i]]: s }),
          {},
        ),
      )
      .catch((e) => e)
      .finally();
  }, [m, history]);

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
                        {history.map((i) => (
                          <List.Item key={i}>
                            <List.Content>
                              <Link to={"/show/" + i}>
                                {data ? i + "(" + data[i].displayName + ")" : i}
                                {loading && <Loader active />}

                                {/* } */}
                              </Link>
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
      JSON.stringify(values),
    ),
  restore: () =>
    FormValuePersistanceManager.canRestore()
      ? JSON.parse(
          localStorage.getItem(FormValuePersistanceManager.KEY) as string,
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
  const [openMisc, setOpenMisc] = useState(false);
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
  },
);
export const UpdateSetlistPage: React.FunctionComponent = withLoading(
  () => {
    const manager = useSetlistManager();
    const { id } = useParams();

    return useCallback(async () => {
      return { setlist: await manager.get(id!), manager, id };
    }, [manager, id]);
  },
  (_, { loading, data, error }) => {
    const navigate = useNavigate();

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
        {error ? (
          <Message error content={error}></Message>
        ) : (
          <SetlistForm
            onSubmit={async (v) => {
              return data?.manager.update(data?.id!, v).then((_) => {
                navigate(`/show/${data?.id}`);
              });
            }}
            loading={loading}
            setlist={data?.setlist}
          ></SetlistForm>
        )}
      </>
    );
  },
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
    RestoreStatus.NEVER,
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
                <Grid columns={3} stackable>
                  <Grid.Column width={16}>
                    <CreateFormInput
                      required
                      name="event.name"
                      placeholder="mosquitone show"
                      label="Name"
                    />
                  </Grid.Column>
                  <Grid.Column width={8}>
                    <CreateFormInput
                      name="event.date"
                      placeholder="yyyy-mm-dd"
                      label="Date"
                    />
                  </Grid.Column>
                  <Grid.Column width="four">
                    <CreateFormInput
                      name="event.openTime"
                      placeholder="hh:mm"
                      label="Open"
                    />
                  </Grid.Column>
                  <Grid.Column width="four">
                    <CreateFormInput
                      name="event.startTime"
                      placeholder="hh:mm"
                      label="Start"
                    />
                  </Grid.Column>
                </Grid>
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
                        `${
                          signature
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

    return useCallback(async () => {
      const setlist = await manager.get(id!);
      return {
        setlist,
        manager,
        id: id as string,
      };
    }, [manager, id]);
  },
  (_, { loading, error, data }) => {
    const navigate = useNavigate();

    const setlistSelectorId = "mqtn_setlist";
    const currentURL = window.location.href;
    const imageURL = `${
      window.location.origin
    }/api/print?url=${encodeURIComponent(
      currentURL,
    )}&selector=${encodeURIComponent(
      `#${setlistSelectorId}`,
    )}&filename=mosquitone_setlist&type=png`;

    const [prepareDownload, setPrepareDownload] = useState(
      !process.env.WAKEUP_CHROME,
    );
    useEffect(() => {
      if (!prepareDownload) {
        fetch(
          window.location.origin + "/api/print?url=google.com&selector=body",
        ).finally(() => {
          setPrepareDownload(true);
        });
      }
    }, [prepareDownload]);

    const sharableURLs = [
      {
        name: "Page",
        url: currentURL,
      },
      {
        name: "Image",
        url: imageURL,
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
            {...(prepareDownload
              ? { as: "a", href: imageURL, target: "_blank" }
              : { disabled: true, icon: "loading circle notch" })}
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
                  <div id={setlistSelectorId}>
                    <SetListProxy
                      {...data.setlist}
                      theme={theme || "basic"}
                    ></SetListProxy>
                  </div>
                </div>
              </>
            )
          )}
        </div>
      </>
    );
  },
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
    },
  ) => ReactElement,
): React.FunctionComponent<Props> {
  return function (props: Props) {
    const loader = loaderFactory(props);
    const state = useLoading(loader);
    return render(props, state);
  };
}
