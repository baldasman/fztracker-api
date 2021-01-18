const getName = (info: any) => {
  let name = info.firstName;

  if (info.lastName) {
    name += ` ${info.lastName}`;
  }

  return name;
};

export default getName;