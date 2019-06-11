import React, { Component } from "react";
import Api from "../api";
import ProblemSearchDescription from "./ProblemSearchDescription";

class ProblemSearchList extends Component {
  constructor(props) {
    super(props);
    this.state = { loaded: false, problems: [] };
  }

  componentDidMount() {
    this.fetchQuery();
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
      .problems()
      .getQuery(this.props.query)
      .then(problems => {
        this.setState({
          loaded: true,
          problems: problems.map(x => x.id),
        });
      });
  }

  fetchAllProblems() {
    Api()
      .problems()
      .get()
      .then(problems => {
        this.setState({
          loaded: true,
          problems: problems.map(x => x.id),
        });
      });
  }

  renderNothingFound() {
    return <h1>Nothing found for query "{this.props.query}"!</h1>;
  }

  renderProblems() {
    if (!this.state.problems.length) {
      return this.renderNothingFound();
    }
    return this.state.problems.map(x => (
      <ProblemSearchDescription id={x} key={x} />
    ));
  }

  render() {
    return (
      <div>
        {this.state.loaded
          ? this.renderProblems()
          : "Searching for problems..."}
      </div>
    );
  }
}

export default ProblemSearchList;
