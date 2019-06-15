import React, { Component } from "react";
import PDFImagePreviewRenderer from "./PDFImagePreviewRenderer";
import styled from "styled-components";
import Api from "../api";
import withState from "../withState";
import FileUploadSelector from "../components/FileUploadSelector";
import TitledForm from "../components/TitledForm";
import TitledCheckbox from "../components/TitledCheckbox";

import uniqueId from "lodash/uniqueId";

const EDIT_KEY = "edit";

class EditPublicationView extends Component {
  constructor(props) {
    super(props);
    //console.log("constructor(SummaryView)");

    this.state = {
      publication: undefined,
      collaborators: [],
      resources: undefined,
      stage: undefined,
      schema: undefined,
      signoffs: [],
      signoffsRemaining: [],
    };

    this.fetchPublicationData();
  }

  componentWillUnmount() {
    Api().unsubscribeClass(EDIT_KEY);
  }

  fetchPublicationData() {
    this.setState({ publication: undefined, collaborators: [] });

    Api()
      .subscribeClass(EDIT_KEY, this.props.publicationId)
      .publication(this.props.publicationId)
      .get()
      .then(publication => {
        publication.data = JSON.parse(publication.data);

        this.setState(
          {
            publication: publication,
          },
          () => {
            Api()
              .subscribe(EDIT_KEY)
              .problem(this.state.publication.problem)
              .stage(this.state.publication.stage)
              .get()
              .then(stage => {
                let schema = JSON.parse(stage.schema);
                schema.forEach(scheme => scheme.push(uniqueId("metadata-")));
                this.setState({
                  stage: stage,
                  schema: schema,
                });
              });
          }
        );
      });

    Api()
      .subscribe(EDIT_KEY)
      .publication(this.props.publicationId)
      .resources()
      .get()
      .then(resources => {
        this.setState({
          resources: resources,
        });
      });

    Api()
      .subscribe(EDIT_KEY)
      .publication(this.props.publicationId)
      .collaborators()
      .get()
      .then(collaborators => {
        collaborators.forEach(collaborator => {
          Api()
            .user(collaborator.user)
            .get()
            .then(user => {
              this.setState(state => {
                var augmented = state;
                augmented.collaborators = augmented.collaborators.filter(
                  collaborator => collaborator.id !== user.id
                );
                augmented.collaborators.push(user);
                return augmented;
              });
            });
        });
      });

    Api()
      .subscribe(EDIT_KEY)
      .publication(this.props.publicationId)
      .signoffs()
      .get()
      .then(signoffs => {
        signoffs.forEach(signoff => {
          Api()
            .user(signoff.user)
            .get()
            .then(user => {
              this.setState(state => {
                var augmented = state;
                augmented.signoffs = augmented.signoffs.filter(
                  signoff => signoff.id !== user.id
                );
                augmented.signoffs.push(user);
                return augmented;
              });
            });
        });
      });

    Api()
      .subscribe(EDIT_KEY)
      .publication(this.props.publicationId)
      .signoffsRemaining()
      .get()
      .then(signoffsRemaining => {
        this.setState({ signoffsRemaining: [] }, () => {
          signoffsRemaining.forEach(signoff => {
            Api()
              .user(signoff.user)
              .get()
              .then(user => {
                this.setState(state => {
                  var augmented = state;
                  augmented.signoffsRemaining = augmented.signoffsRemaining.filter(
                    signoff => signoff.id !== user.id
                  );
                  augmented.signoffsRemaining.push(user);
                  return augmented;
                });
              });
          });
        });
      });
  }

  componentDidUpdate(oldProps) {
    if (oldProps.publicationId !== this.props.publicationId) {
      this.fetchPublicationData();
    }
  }

  handleTitleChange = e => {
    let val = e.target.value;
    this.setState(state => {
      let publication = { ...state.publication };
      publication.title = val;
      return { publication: publication };
    });
  };

  handleSummaryChange = e => {
    let val = e.target.value;
    this.setState(state => {
      let publication = { ...state.publication };
      publication.summary = val;
      return { publication: publication };
    });
  };

  handleFundingChange = e => {
    let val = e.target.value;
    this.setState(state => {
      let publication = { ...state.publication };
      publication.funding = val;
      return { publication: publication };
    });
  };

  handleConflictChange = e => {
    let val = e.target.value;
    this.setState(state => {
      let publication = { ...state.publication };
      publication.conflict = val;
      return { publication: publication };
    });
  };

  handleDataChange = idx => e => {
    let field = this.state.schema[idx];
    let data = [...this.state.publication.data];

    let content = e.target;

    switch (field[1]) {
      case "file":
        content = content.files[0];
        break;
      case "uri":
        content = content.value;
        break;
      case "text":
        content = content.value;
        break;
      case "bool":
        content = content.checked;
        break;
      default:
        return;
    }

    data[idx] = content;
    this.setState(state => {
      let publication = { ...state.publication };
      publication.data = data;
      return { publication: publication };
    });
  };

  render() {
    // TODO: handle cases where publication may not have loaded?
    if (this.state.publication === undefined) {
      return null;
    }

    const mainResourcePresent =
      this.state.resources !== undefined && this.state.resources.length > 0;
    const stagePresent = this.state.stage !== undefined;
    const reviewPresent = this.state.publication.review;

    let metadata = null;

    if (
      this.state.publication !== {} &&
      stagePresent &&
      this.state.resources !== undefined
    ) {
      // metadata = this.state.schema.map(([key, type, title, description], i) => {
      //   let datum = this.state.publication.data[i];
      //
      //   if (datum === undefined) {
      //     return null;
      //   }
      //
      //   let content;
      //
      //   switch (type) {
      //     case "file":
      //       datum = this.state.resources.find(
      //         resource => resource.id === datum,
      //       );
      //
      //       if (datum === undefined) {
      //         return null;
      //       }
      //
      //       content = (
      //         <a className="ui button" href={datum.uri}>
      //           <i className="ui download icon" />
      //           Download document
      //         </a>
      //       );
      //       break;
      //     case "uri":
      //       datum = this.state.resources.find(
      //         resource => resource.id === datum,
      //       );
      //
      //       if (datum === undefined) {
      //         return null;
      //       }
      //
      //       content = <a href={datum.uri}>{datum.uri}</a>;
      //       break;
      //     case "text":
      //       content = datum;
      //       break;
      //     case "bool":
      //       content = (
      //         <div className="ui checkbox">
      //           <input
      //             type="checkbox"
      //             checked={datum}
      //             style={{ cursor: "default" }}
      //             disabled
      //           />
      //           <label> </label>
      //         </div>
      //       );
      //       break;
      //     default:
      //       return null;
      //   }
      //
      //   return (
      //     <section key={key} className="ui segment">
      //       <h3>{title}</h3>
      //       {description ? (
      //         <div style={{ marginTop: "-0.5rem" }}>{description}</div>
      //       ) : null}
      //       <div className="ui divider" />
      //       {content}
      //     </section>
      //   );
      // });
      metadata = (
        <>
          {this.state.schema.map(([key, type, title, description, id], i) => {
            let value = this.state.publication.data[i];
            let onChange = this.handleDataChange(i);

            switch (type) {
              case "file":
                return (
                  <FileUploadSelector
                    key={key}
                    title={title}
                    description={description}
                    files={[value]}
                    onSelect={onChange}
                  />
                );
              case "uri":
                return (
                  <TitledForm
                    key={key}
                    title={title}
                    description={description}
                    value={value}
                    onChange={onChange}
                  />
                );
              case "text":
                return (
                  <TitledForm
                    key={key}
                    title={title}
                    description={description}
                    value={value}
                    onChange={onChange}
                  />
                );
              case "bool":
                return (
                  <TitledCheckbox
                    key={key}
                    title={title}
                    description={description}
                    checked={value}
                    onChange={onChange}
                    id={id}
                  />
                );
              default:
                return null;
            }
          })}
          <div className="ui divider" />
        </>
      );
    }

    let signoffInvitation = null;
    if (this.state.publication.signoff_requested) {
      signoffInvitation = (
        <>
          <p>
            Signoff has been requested on this publication, and once all
            contributors have signed off, it will be published.
          </p>

          <h3>Signoffs Awaiting</h3>

          {this.state.signoffsRemaining.length ? (
            <ul>
              {this.state.signoffsRemaining.map(signoff => {
                let submitSignoffButton =
                  signoff.id === global.session.user.id ? (
                    <button
                      className="ui green button"
                      onClick={() =>
                        Api()
                          .publication(this.state.publication.id)
                          .signoffs()
                          .post({ revision: this.state.publication.revision })
                          .then()
                      }
                    >
                      Sign Off
                    </button>
                  ) : (
                    <></>
                  );
                return (
                  <li key={signoff.display_name}>
                    {signoff.display_name}
                    {submitSignoffButton}
                  </li>
                );
              })}
            </ul>
          ) : (
            <p>No signoffs remain, this publication has been published!.</p>
          )}

          <h3>Signoffs Complete</h3>

          {this.state.signoffs.length ? (
            <ul>
              {this.state.signoffs.map(signoff => {
                return (
                  <li key={signoff.display_name}>{signoff.display_name}</li>
                );
              })}
            </ul>
          ) : (
            <p>No signoffs have yet been completed.</p>
          )}
        </>
      );
    } else {
      signoffInvitation = (
        <button
          className="ui green button"
          onClick={() => {
            Api()
              .publication(this.state.publication.id)
              .requestSignoff()
              .post({ revision: this.state.publication.revision })
              .then();
          }}
        >
          Finalise Publication And Request Signoffs
        </button>
      );
    }

    let addCollaboratorButton = (
      <>
        <div className="ui form">
          <div className="inline field">
            <label>Email Address</label>
            <input
              type="text"
              placeholder="example@example.com"
              onChange={e =>
                this.setState({
                  newCollaborator: e.target.value,
                })
              }
            />
          </div>
          <button
            className="ui button"
            type="submit"
            onClick={() => {
              Api()
                .publication(this.state.publication.id)
                .collaborators()
                .post({ email: this.state.newCollaborator })
                .then();
            }}
          >
            Add New Collaborator
          </button>
        </div>
      </>
    );

    let editForm = (
      <>
        <div className="ui form">
          <div className="inline field">
            <label>Title</label>
            <input
              type="text"
              value={this.state.publication.title}
              onChange={this.handleTitleChange}
            />
          </div>
          <div className="ui divider" />
          <div className="field">
            <label>Summary</label>
            <textarea
              value={this.state.publication.summary}
              onChange={this.handleSummaryChange}
            />
          </div>
          <TitledForm
            title="Funding Statement"
            value={this.state.publication.funding}
            guidance='If this research has any funding sources you think readers should be aware of, add them here. If not, feel free to enter "None".'
            placeholder="For example, funded by the British Council"
            onChange={this.handleFundingChange}
          />
          <p />
          <TitledForm
            title="Conflict of Interest Declaration"
            value={this.state.publication.conflict}
            guidance='Declare any potential conflicts of interest this publication may have in the following box. If there aren&apos;t any, just type "No conflicts of interest".'
            placeholder="For example, no conflicts of interest"
            onChange={this.handleConflictChange}
          />
          {metadata}
          <button
            className="ui button"
            type="submit"
            onClick={() => {
              let ddata = [];
              let schema = JSON.parse(this.state.stage.schema);
              schema.forEach(([key, type, title, description], i) => {
                let content = this.state.publication.data[i];

                switch (type) {
                  case "file":
                    //data.append("file", content);
                    //content = fileIdx++;
                    break;
                  case "uri":
                    break;
                  case "text":
                    break;
                  case "bool":
                    break;
                  default:
                    return;
                }

                ddata.push(content);
              });
              Api()
                .publication(this.state.publication.id)
                .post({
                  id: this.state.publication.id,
                  revision: this.state.publication.revision,
                  title: this.state.publication.title,
                  summary: this.state.publication.summary,
                  funding: this.state.publication.funding,
                  conflict: this.state.publication.conflict,
                  data: JSON.stringify(ddata),
                })
                .then();
            }}
          >
            Update Draft
          </button>
        </div>
        <p>
          (Current Revision: {this.state.publication.revision}, last updated:{" "}
          {new Date(this.state.publication.updated_at).toLocaleString()})
        </p>
      </>
    );

    return (
      <div>
        <div className="ui divider" />
        <main className="ui main text container">
          <article>
            <h1 className="ui header">
              <StageTitle>
                <DraftTitle>Draft </DraftTitle>
                {stagePresent && this.state.stage.singular}
                <ReviewTitle>{reviewPresent ? " Review" : ""}</ReviewTitle>
                {(stagePresent || reviewPresent) && ": "}
              </StageTitle>
              {this.state.publication.title}
            </h1>
            <p>
              <strong>Date added: </strong>
              {new Date(this.state.publication.created_at).toLocaleDateString()}
            </p>
            <h3>Collaborators</h3>
            <ul>
              {this.state.collaborators.map(user => (
                <li key={user.id}>{user.display_name}</li>
              ))}
            </ul>

            <div className="ui divider" />

            {addCollaboratorButton}

            <div className="ui divider" />

            {mainResourcePresent && (
              <a className="ui button" href={this.state.resources[0].uri}>
                <i className="ui download icon" />
                Download document
              </a>
            )}

            {/*{metadata}

            {mainResourcePresent ? (
              <section className="ui segment">
                <PDFImagePreviewRenderer document={this.state.resources[0]} />
              </section>
            ) : (
              <section className="ui placeholder segment">
                <div className="ui icon header">
                  <i className="pencil icon" />
                  No resources were uploaded for this publication.
                </div>
              </section>
            )}*/}

            <div className="ui divider" />

            {editForm}

            <div className="ui divider" />

            {signoffInvitation}
          </article>
        </main>
      </div>
    );
  }
}

const StageTitle = styled.span`
  color: var(--octopus-theme-publication);
`;

const ReviewTitle = styled.span`
  color: var(--octopus-theme-review);
`;

const DraftTitle = styled.span`
  color: var(--octopus-theme-draft);
`;

export default withState(EditPublicationView);
