import React from "react";
import { observer } from "mobx-react";
import { User } from "oidc-client";

export interface AuthorizedProps {
  user: User
  component?: any
  denied?: string|React.ReactNode
  roles?: string|string[]
  self?: string
}

export const Authorized :React.FC<AuthorizedProps> = ({component: Component, children, denied, user, roles, self, ...rest}) => {
  if (!user?.profile) return (<div>Loading user information ...</div>);

  const selfCheck = self && (self === user.profile.databaseId);
  let rolesList = roles ? (Array.isArray(roles) ? roles : [roles]) : [];
  let userRoles = user.profile.role ? (Array.isArray(user.profile.role) ? user.profile.role : [user.profile.role]) : [];

  const inRole = rolesList.filter(r => userRoles.includes(r)).length > 0;

  const content = selfCheck || inRole ? children : <>{denied}</>

  return <>{content}</>;
};

export default observer(Authorized);