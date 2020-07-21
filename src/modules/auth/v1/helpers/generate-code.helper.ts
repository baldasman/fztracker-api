const generateCode = () => {
  const possible = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  let code = '';

  for (let i = 0; i < 6; i += 1) {
    code += possible.charAt(Math.floor(Math.random() * possible.length));
  }

  return code;
};

export default generateCode;