export const getActions = (a, callback = () => []) => {
  if (!a?.properties) return callback();
  return a.properties.filter((e) => e.displayName === "Operation");
};
