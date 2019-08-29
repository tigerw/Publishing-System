import React, { Component } from "react";
import Api from "../../api";
import PublicationSearchTemplate from "./PublicationSearchTemplate";

const SEARCH_KEY = "search";

class PublicationSearchList extends Component {
  constructor(props) {
    super(props);
    this.state = { loaded: true };

    // Always start a new cache when the search page is loaded
    Api().subscribeClass(SEARCH_KEY, Math.random());
  }

  componentDidMount() {
    this.fetchQuery();
  }

  componentWillUnmount() {
    Api().unsubscribeClass(SEARCH_KEY);
  }

  componentDidUpdate(oldProps) {
    if (oldProps.query !== this.props.query) {
      this.fetchQuery();
    }
  }

  fetchQuery() {
    if (!this.props.query) {
      this.fetchAllProblems();
    } else {
      this.fetchQueryProblems();
    }
  }

  fetchQueryProblems() {
    Api()
      .publications()
      .getQuery(this.props.query)
      .then(problems => {
        this.setState(
          {
            loaded: true,
            problems: problems.map(x => x.id),
          },
          this.loadingComplete,
        );
      });
  }

  fetchAllProblems() {
    Api()
      .publications()
      .get()
      .then(problems => {
        this.setState(
          {
            loaded: true,
            problems: problems.map(x => x.id),
          },
          this.loadingComplete,
        );
      });
  }

  loadingComplete() {
    if (this.props.onLoaded) this.props.onLoaded();
  }

  render() {
    if (!this.props.publications.length) {
      return <h1>Nothing found for query "{this.props.query}"!</h1>;
    }
    return this.props.publications.map(
      (publication, index) => (
        <PublicationSearchTemplate
          key={index}
          publication={publication}
          onSelect={this.props.onSelect}
        />
      ),
      // <PublicationSearchDescription id={x} key={x} onSelect={this.props.onSelect} />
    );
  }
}

export default PublicationSearchList;
