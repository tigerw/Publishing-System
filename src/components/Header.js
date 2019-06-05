import React, { Component } from "react";
import { Link } from "react-router-dom";

import "../App.css";
import WebURI from "../urls/WebsiteURIs";
import GoblinIDLoginInvitation from "./GoblinIDLoginInvitation";
import LogoutInvitation from "./LogoutInvitation";
import { LoginDataContext } from "../LoginContext";
import OctopusLogo from "./OctopusLogo";
import { Trans } from "react-i18next";
import SearchField from "./SearchField";
import GlobalSearch from "./GlobalSearch";

class Header extends Component {
  static contextType = LoginDataContext;

  render() {
    const loggedIn = this.context.user !== undefined;

    return (
      <header className="ui teal inverted menu" style={styles.header}>
        <div className="ui container">
          <Link to={WebURI.Home} className="header item">
            <OctopusLogo style={styles.logo} />
            <Trans>octopus</Trans>
          </Link>
          <Link to={WebURI.Upload} className="item">
            <i className="ui pencil alternate icon" />
            Publish
          </Link>
          <GlobalSearch />
          {loggedIn ? (
            <LogoutInvitation user={this.context.user} />
          ) : (
            <GoblinIDLoginInvitation state={1337} />
          )}
        </div>
      </header>
    );
  }
}

const styles = {
  header: {
    borderRadius: 0,
    marginBottom: "0rem",
  },
  logo: {
    marginRight: 1.5 + "em",
  },
};

export default Header;
