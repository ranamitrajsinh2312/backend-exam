import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET!;


export function generateToken(user: any) {
  const roleName = typeof user.role === 'object' ? user.role.name : user.role;
  return jwt.sign(
    { id: user.id, email: user.email, role: roleName },
    SECRET,
    { expiresIn: "1d" }
  );
}

export function verifyToken(token: string) {
  try {
    return jwt.verify(token, SECRET);
  } catch (err) {
    return null;
  }
}



// import jwt from 'jsonwebtoken';

// const SECRET = process.env.JWT_SECRET;

// if (!SECRET) {
//   throw new Error('Add JWT_SECRET to your .env file');
// }

// export function generateToken(user) {
//   return jwt.sign(
//     { id: user.id, email: user.email, role: user.role },
//     SECRET,
//     { expiresIn: '1d' }
//   );
// }

// export function verifyToken(token) {
//   try {
//     return jwt.verify(token, SECRET);
//   } catch (err) {
//     return null; // invalid or expired → return null
//   }
// }

