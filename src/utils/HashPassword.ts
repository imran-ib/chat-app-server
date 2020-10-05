import * as bcrypt from "bcryptjs";

const Hash = async (password: string): Promise<string> => {
  return await bcrypt.hash(password, 10);
};

const ComparePassword = async (
  password: string,
  hash: string
): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};

export { Hash, ComparePassword };
