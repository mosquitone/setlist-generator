import { ErrorMessage, Field, FieldArray, Formik } from "formik";
import React from 'react';
import { Link, Redirect, Route, RouteComponentProps, Switch, withRouter } from "react-router-dom";
import { Button, Container, Form, Grid, Header, Icon, Label, Menu, Message, Segment, Transition } from "semantic-ui-react";
import * as Yup from "yup";
import './App.css';
import logo from './logo.png';

const Home = () => {
  return (
    <Segment basic >
      <Header>
        <Header.Content as="h1">
          mosquitone Setlist Generator
          </Header.Content>
        <Header.Subheader as="h2">
          To create setlist is fun.
          </Header.Subheader>
      </Header>
      <Menu text vertical>
        <Menu.Item header>content</Menu.Item>
        <Menu.Item
          as={Link}
          to="/new"
        >
          <Icon name='gamepad' />
          Create new setlist
        </Menu.Item>
      </Menu>
    </Segment>
  );
}

const CreateFormSchema = Yup.object().shape({
  meta: Yup.object().shape({
    createDate: Yup.string().required(),
    version: Yup.string().required(),
  }),
  event: Yup.object().shape({
    name: Yup.string().required().default(""),
    url: Yup.string().required().default(""),
    date: Yup.string().required().default(""),
    openTime: Yup.string().required().default(""),
    startTime: Yup.string().required().default(""),
  }),
  playings: Yup.array().of(Yup.string().required().default("")).required().default([])
});
declare type CreateFormValues = Yup.InferType<typeof CreateFormSchema>;

const FormValueSerializer = {
  serialize: (values: CreateFormValues) => encodeURIComponent(Buffer.from(JSON.stringify(values, null, 4), "utf16le").toString("base64")),
  deserialize: (serializedValues: string): CreateFormValues => JSON.parse(Buffer.from(decodeURIComponent(serializedValues), "base64").toString("utf16le")),
}

const CreateFormInput: React.FunctionComponent<{ name: string, label: string, placeholder: string, direction?: "row" | "column" }> = ({ name, label, placeholder, direction = "column" }) => (
  <div style={{ display: "flex", flexDirection: direction, alignItems: direction === "column" ? "baseline" : "center" }}>
    <label htmlFor={name}>{label}</label>
    <Field placeholder={placeholder} name={name}></Field>
    <ErrorMessage component="div" className="ui error message" name={name} render={(msg) =>
      <Label color="red" basic pointing={direction === "column" ? "above" : "left"}>{msg}</Label>
    } />
  </div>
)

const CreateForm: React.FunctionComponent<RouteComponentProps> = ({ location }) => {
  const params = new URLSearchParams(location.search);
  const fromData = params.get('from');
  const loadValues = fromData ? FormValueSerializer.deserialize(fromData) : {};

  return (
    <>
      <Header>
        <Header.Content as="h1">
          Create New Setlist
        </Header.Content>
        <Header.Subheader as="h2">
          please fill following form <span role="img" aria-label="fire"> 🔥 </span>
        </Header.Subheader>
      </Header>
      <Formik
        initialValues={
          {
            ...CreateFormSchema.cast({}),
            ...loadValues,
            meta: {
              createDate: new Date().toLocaleDateString(),
              version: "0.0.0@dev",
            }
          }
        }
        validationSchema={CreateFormSchema}
        onSubmit={(values) => {
          window.location.href = `/show/${FormValueSerializer.serialize(values)}`
        }}
        render={(formik) => <Form className={`${formik.errors ? "error" : ""}`}>
          <Header as="h2">Event Information</Header>
          <Segment>
            <Grid columns="two" >
              <Grid.Column>
                <CreateFormInput name="event.name" placeholder="mosquitone show" label="Name" />
              </Grid.Column>
              <Grid.Column>
                <CreateFormInput name="event.url" placeholder="https://..." label="URL" />
              </Grid.Column>
              <Grid.Column width="eight">
                <CreateFormInput name="event.date" placeholder="yyyy-mm-dd" label="Date" />
              </Grid.Column>
              <Grid.Column width="four">
                <CreateFormInput name="event.openTime" placeholder="hh:mm" label="Open" />
              </Grid.Column>
              <Grid.Column width="four">
                <CreateFormInput name="event.startTime" placeholder="hh:mm" label="Start" />
              </Grid.Column>
            </Grid>
          </Segment>
          <Header as="h2">Playings</Header>
          <Segment>
            {
              typeof formik.errors.playings === 'string' &&
              <ErrorMessage component="div" className="ui error message" name="playings" />
            }
            <Grid>
              <FieldArray name="playings" render={(arrayHelper) => (
                <Transition.Group
                  duration={500}
                >
                  {formik.values.playings.map((_, idx, arr) => (
                    <Grid.Row key={idx}>
                      <Grid.Column width="ten">
                        <CreateFormInput direction="row" name={`playings[${idx}]`} label={`${idx + 1}`} placeholder="My song or MC#1" />
                      </Grid.Column>
                      <Grid.Column width="four">
                        <Button.Group>
                          <Button disabled={idx < 1} icon onClick={() => arrayHelper.swap(idx - 1, idx)}>
                            <Icon name="arrow up"></Icon>
                          </Button>
                          <Button disabled={idx >= arr.length - 1} icon onClick={() => arrayHelper.swap(idx, idx + 1)}>
                            <Icon name="arrow down"></Icon>
                          </Button>
                          <Button icon onClick={() => arrayHelper.remove(idx)}>
                            <Icon name="close"></Icon>
                          </Button>
                        </Button.Group>
                      </Grid.Column>
                    </Grid.Row>
                  ))
                  }
                  <Grid.Column width="two">
                    <Button icon onClick={() => arrayHelper.push("")}>
                      <Icon name="add"></Icon>
                    </Button>
                  </Grid.Column>
                </Transition.Group>
              )} />
            </Grid>
          </Segment>
          <Form.Field onClick={formik.submitForm} control={Button} size="big" >Submit</Form.Field>
        </Form>
        }
      >
      </Formik>
    </>
  )
}

const SetList: React.FunctionComponent<CreateFormValues> = ({ event, playings }) => {
  const qrCodeImageSrc = `https://chart.apis.google.com/chart?cht=qr&chs=300x300&chl=${encodeURIComponent(event.url)}&chld=L|1`;
  return (
    <div className="mqtn setlist inverted paper container">
      <div className="mqtn content ui inverted paper padded segment">
        <div className="mqtn main ui grid">
          <div className="row">
            <div className="mqtn event ui inverted paper vertical stripe padded segment">
              <div className="ui inverted mqtn huge paper header">
                <div className="content">
                  <h1>mosquitone</h1>
                </div>
                <img className="ui huge image" src={logo} alt="mosquitone logo" />
                <h2 className="mqtn ui inverted sub huge paper header">
                  <div className="content">
                    {event.name}
                  </div>
                  <img className="ui right floated image" src={qrCodeImageSrc} alt={`qrcode for ${event.url}`} />
                </h2>
              </div>
              <p>{event.date}</p>
              <p>OPEN {event.openTime}, START: {event.startTime}</p>
            </div>
          </div>
          <div className="row">
            <div className="centered column">
              <div className="ui padded inverted paper basic segment">
                <div id="mqtn_playing_list" className="ui huge inverted paper divided relaxed list">
                  {playings.map((playing, idx) =>
                    <div key={idx} className="item">
                      <div className="content">
                        {playing}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}


const ShowSetlist: React.FunctionComponent<RouteComponentProps<{ data: string }>> = ({
  history,
  match: { params: { data } }
}) => {
  const formValues: CreateFormValues = FormValueSerializer.deserialize(data);
  const setlistSelectorId = "mqtn_setlist";
  const imageURL = `/api/print?url=${encodeURIComponent(window.location.href)}&selector=${encodeURIComponent(`#${setlistSelectorId}`)}&filename=mosquitone_setlist&type=png`

  return (
    <>
      <Message className="mqtn unprint">
        <Message.Header as="h1">
          Setlist Generated !
      </Message.Header>
      </Message>
      <Menu className="mqtn unprint">
        <Menu.Item onClick={() => history.push({ pathname: "/new", search: `?from=${data}` })} name="edit"></Menu.Item>
        <Menu.Item name="download" as="a" href={imageURL} target="_blank"></Menu.Item>
        <Menu.Item onClick={() => window.print()} name="print"></Menu.Item>
      </Menu>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div id={setlistSelectorId}>
          <SetList {...formValues}
          ></SetList>
        </div>
      </div>
    </>
  )
}

const NotFound = () => {
  return (
    <Segment basic>
      <Message>
        <Message.Header>Appa! Content not found</Message.Header>
        Not Found</Message>
    </Segment>
  )
}

const App = withRouter(({ location }) => {
  return (
    <Container text>
      <Grid>
        <Grid.Row as="header">
        </Grid.Row>
        <Grid.Row as="main">
          <Grid.Column>
            <Switch>
              <Route path="/" exact component={Home} />
              <Route path="/new" exact component={CreateForm} />
              <Route path="/show/:data" exact component={ShowSetlist} />
              <Route path="/404" exact strict component={NotFound} />
              <Redirect strict to="/404" />
            </Switch>
          </Grid.Column>
        </Grid.Row>
        <Grid.Row as="footer" >
          <Grid.Column width="six" floated="right">
            {
              location.pathname !== "/" && <Link to="/">back to top</Link>
            }
          </Grid.Column>
        </Grid.Row>
      </Grid>
    </Container>
  )
})

export default App;
