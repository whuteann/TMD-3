import React from "react";

const protectedRoute = (
  name,
  component,
  title,
  Stack,
  permissions,
  requiredPermissions
) => {
  let isAllowed = requiredPermissions?.every(element => permissions.indexOf(element) > -1);
  
  return (
    <>
      {
        isAllowed
          ?
            <Stack.Screen name={name} component={component} options={{ title: title }} />
          :
            <></>
      }
    </>
  );
}

export default protectedRoute;