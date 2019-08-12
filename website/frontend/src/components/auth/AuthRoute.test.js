import React from 'react';
import ReactDOM from 'react-dom';
import { MemoryRouter } from 'react-router';
import { AuthRoute } from './AuthRoute';

it('loading user default text', () => {
  const div = document.createElement('div');
  ReactDOM.render(<MemoryRouter><AuthRoute oidc={{ isLoadingUser: true }} /></MemoryRouter>, div);
  expect(div.outerHTML).toEqual('<div><i class=\"fas fa-spinner fa-spin\"></i></div>');
})

it('loading user user text', () => {
  const div = document.createElement('div');
  ReactDOM.render(<MemoryRouter><AuthRoute oidc={{ isLoadingUser: true }} loading='test-string'/></MemoryRouter>, div);
  expect(div.outerHTML).toEqual('<div>test-string</div>');
})

it('loading groups', () => {
  const div = document.createElement('div');
  const oidc = { isLoadingUser: false, loadingGroups: true, user: { profile: { } } };
  ReactDOM.render(<MemoryRouter>
    <AuthRoute oidc={oidc} roles='users' loading='test-string'/>
  </MemoryRouter>, div);
  expect(div.outerHTML).toEqual('<div>test-string</div>');
})

it('loading groups short circuits when no roles', () => {
  const div = document.createElement('div');
  const oidc = { isLoadingUser: false, loadingGroups: true, user: { profile: { } } };
  ReactDOM.render(<MemoryRouter>
    <AuthRoute oidc={oidc}>test-content</AuthRoute>
  </MemoryRouter>, div);
  expect(div.outerHTML).toEqual('<div>test-content</div>');
})

it('shows content', () => {
  const div = document.createElement('div');
  const oidc = { isLoadingUser: false, loadingGroups: false, user: { profile: { } } };
  ReactDOM.render(<MemoryRouter><AuthRoute oidc={oidc}>test-content</AuthRoute></MemoryRouter>, div);
  expect(div.outerHTML).toEqual('<div>test-content</div>');
})

it('roles-string', () => {
  const div = document.createElement('div');
  const oidc = { isLoadingUser: false, loadingGroups: false, groups: ['users','testers'], user: { profile: { } } };
  ReactDOM.render(<MemoryRouter><AuthRoute roles='users' oidc={oidc}>test-content</AuthRoute></MemoryRouter>, div);
  expect(div.outerHTML).toEqual('<div>test-content</div>');
})

it('self-okay', () => {
  const div = document.createElement('div');
  const oidc = { isLoadingUser: false, loadingGroups: false, groups: ['users','testers'], user: { profile: { memberId: 'my-id' } } };
  ReactDOM.render(<MemoryRouter><AuthRoute self='my-id' oidc={oidc}>test-content</AuthRoute></MemoryRouter>, div);
  expect(div.outerHTML).toEqual('<div>test-content</div>');
})

it('self-denied', () => {
  const div = document.createElement('div');
  const oidc = { isLoadingUser: false, loadingGroups: false, groups: ['users','testers'], user: { profile: { memberId: 'my-id' } } };
  ReactDOM.render(<MemoryRouter><AuthRoute self='other-id' denied='denied' oidc={oidc}>test-content</AuthRoute></MemoryRouter>, div);
  expect(div.outerHTML).toEqual('<div>denied</div>');
})