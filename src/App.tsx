import React from "react";
import { Link, Route, Routes, useLocation } from "react-router-dom";
import { Container, Grid } from "semantic-ui-react";
import "./App.css";
import {
  CreateSetlistPage,
  Home,
  NotFound,
  ShowSetlist,
  UpdateSetlistPage,
} from "./page";

const App = () => {
  const location = useLocation();
  return (
    <Container text>
      <Grid>
        <Grid.Row as="header"></Grid.Row>
        <Grid.Row as="main">
          <Grid.Column>
            <Routes>
              <Route path="/" Component={Home} />
              <Route path="/new" Component={CreateSetlistPage} />
              <Route path="/update/:id" Component={UpdateSetlistPage} />
              <Route path="/show/:id" Component={ShowSetlist} />
              <Route path="/404" Component={NotFound} />
              <Route path="*" Component={NotFound}></Route>
            </Routes>
          </Grid.Column>
        </Grid.Row>
        <Grid.Row as="footer">
          <Grid.Column width="six" floated="right">
            {location.pathname !== "/" && <Link to="/">back to top</Link>}
          </Grid.Column>
        </Grid.Row>
      </Grid>
    </Container>
  );
};

export default App;
