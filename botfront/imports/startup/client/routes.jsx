import React from 'react';
import { render } from 'react-dom';
import {
    Router, Route, IndexRoute, browserHistory,
} from 'react-router';
import DocumentTitle from 'react-document-title';
import { Meteor } from 'meteor/meteor';
import { Provider } from 'react-redux';

import { Accounts } from 'meteor/accounts-base';
import { ApolloClient } from 'apollo-client';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { HttpLink } from 'apollo-link-http';
import { onError } from 'apollo-link-error';
import { ApolloLink, Observable } from 'apollo-link';
import { ApolloProvider } from 'react-apollo';
import { ApolloProvider as ApolloHooksProvider } from '@apollo/react-hooks';

import ConversationsBrowser from '../../ui/components/conversations/ConversationsBrowser.jsx';
import TemplatesContainer from '../../ui/components/templates/templates-list/Templates';
import TemplateContainer from '../../ui/components/templates/template-upsert/Template';
import SettingsContainer from '../../ui/components/admin/settings/Settings';
import ForgotPassword from '../../ui/components/account/ForgotPassword.jsx';
import StoriesContainer from '../../ui/components/stories/StoriesContainer';
import ConfigurationContainer from '../../ui/components/settings/Settings';
import ResetPassword from '../../ui/components/account/ResetPassword.jsx';
import NLUModelComponent from '../../ui/components/nlu/models/NLUModel';
import NLUModels from '../../ui/components/nlu/models/NLUModels';
import SetupSteps from '../../ui/components/setup/SetupSteps';
import Welcome from '../../ui/components/setup/Welcome';
import Login from '../../ui/components/account/Login';
import Incoming from '../../ui/components/incoming/Incoming';

import { can, areScopeReady } from '../../lib/scopes';
import AccountLayout from '../../ui/layouts/account';
import NotFound from '../../ui/components/NotFound';
import SetupLayout from '../../ui/layouts/setup';
import Project from '../../ui/layouts/project';
import Index from '../../ui/components/index';
import store from '../../ui/store/store';


const request = async (operation) => {
    operation.setContext({
        headers: {
            // eslint-disable-next-line no-underscore-dangle
            authorization: Accounts._storedLoginToken(),
        },
    });
};

const requestLink = new ApolloLink((operation, forward) => new Observable((observer) => {
    let handle;
    Promise.resolve(operation)
        .then(oper => request(oper))
        .then(() => {
            handle = forward(operation).subscribe({
                next: observer.next.bind(observer),
                error: observer.error.bind(observer),
                complete: observer.complete.bind(observer),
            });
        })
        .catch(observer.error.bind(observer));

    return () => {
        if (handle) handle.unsubscribe();
    };
}));


const errorLink = onError(({ graphQLErrors, networkError }) => {
    if (graphQLErrors) {
        graphQLErrors.forEach(({ message, locations, path }) => console.log(
            `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`,
        ));
    }
    if (networkError) console.log(`[Network error]: ${networkError}`);
});

const httpLink = new HttpLink({
    uri: '/graphql',
    credentials: 'same-origin',
});

const client = new ApolloClient({
    link: ApolloLink.from([errorLink, requestLink, httpLink]),
    cache: new InMemoryCache(),
});


const authenticateProject = (nextState, replace, callback) => {
    Tracker.autorun(() => {
        if (areScopeReady()) {
            if (!Meteor.loggingIn() && !Meteor.userId()) {
                replace({
                    pathname: '/login',
                    state: { nextPathname: nextState.location.pathname },
                });
            } else if (
                !can('project-viewer', nextState.params.project_id)
                && !can('global-admin')
            ) {
                replace({
                    pathname: '/404',
                    state: { nextPathname: nextState.location.pathname },
                });
            }
            callback();
        }
    });
};

const authenticateAdmin = (nextState, replace, callback) => {
    Tracker.autorun(() => {
        if (areScopeReady()) {
            if (!can('global-admin')) {
                replace({
                    pathname: '/403',
                    state: { nextPathname: nextState.location.pathname },
                });
            }
            callback();
        }
    });
};

Meteor.startup(() => {
    render(
        <DocumentTitle title='Botfront by Mr. Bot'>
            <ApolloProvider client={client}>
                <ApolloHooksProvider client={client}>
                    <Provider store={store}>
                        <Router history={browserHistory}>
                            <Route exact path='/setup' component={SetupLayout}>
                                <Route path='/setup/welcome' component={Welcome} name='Welcome' />
                                <Route path='/setup/account' component={SetupSteps} name='Account' />
                            </Route>
                            <Route exact path='/' component={AccountLayout}>
                                <IndexRoute component={Index} />
                                <Route path='/login' component={Login} name='Login' />
                                {/* <Route path="/signup" component={ Signup } onEnter={ logout } name='Signup' /> */}
                                {/* <Route path="/create-project" component={ CreateProjectComponent } onEnter={ authenticate } name='Create Project' /> */}
                                <Route path='/forgot-password' component={ForgotPassword} name='Forgot Password' />
                                <Route path='/reset-password/:token' component={ResetPassword} name='Reset Password' />
                                <Route path='/enroll-account/:token' component={ResetPassword} name='Reset Password' />
                            </Route>
                            <Route exact path='/project' component={Project}>
                                <Route path='/project/:project_id/nlu/legacy-models' component={NLUModels} name='NLU Models' onEnter={authenticateProject} />
                                <Route path='/project/:project_id/nlu/models' component={NLUModelComponent} name='NLU Models' onEnter={authenticateProject} />
                                <Route path='/project/:project_id/nlu/model/:model_id' component={NLUModelComponent} name='NLU Models' onEnter={authenticateProject} />
                                <Route path='/project/:project_id/incoming' component={Incoming} name='Incoming' onEnter={authenticateProject} />
                                <Route
                                    path='/project/:project_id/incoming/:model_id'
                                    component={Incoming}
                                    name='Incoming'
                                    onEnter={authenticateProject}
                                />
                                <Route
                                    path='/project/:project_id/incoming/:model_id/:tab'
                                    component={Incoming}
                                    name='Incoming'
                                    onEnter={authenticateProject}
                                />
                                <Route
                                    path='/project/:project_id/incoming/:model_id/:tab/:page'
                                    component={Incoming}
                                    name='Incoming'
                                    onEnter={authenticateProject}
                                />
                                <Route
                                    path='/project/:project_id/incoming/:model_id/:tab/:page/:selected_id'
                                    component={Incoming}
                                    name='Incoming'
                                    onEnter={authenticateProject}
                                />

                                <Route path='/project/:project_id/stories' component={StoriesContainer} name='Stories' onEnter={authenticateProject} />
                                <Route path='/project/:project_id/dialogue/templates' component={TemplatesContainer} name='Templates' onEnter={authenticateProject} />
                                <Route path='/project/:project_id/dialogue/templates/add' component={TemplateContainer} name='Template' onEnter={authenticateProject} />
                                <Route path='/project/:project_id/dialogue/template/:template_id' component={TemplateContainer} name='Template' onEnter={authenticateProject} />
                                <Route path='/project/:project_id/settings' component={ConfigurationContainer} name='Settings' onEnter={authenticateProject} />
                                <Route path='/project/:project_id/settings/global' component={SettingsContainer} name='More Settings' onEnter={authenticateAdmin} />
                                <Route path='*' component={NotFound} />
                            </Route>
                            <Route path='*' exact component={NotFound} />
                        </Router>
                    </Provider>
                </ApolloHooksProvider>
            </ApolloProvider>
        </DocumentTitle>,
        document.getElementById('render-target'),
    );
});
