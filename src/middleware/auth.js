// export function authenticate(req, res, next){
//   const authHeader = req.headers.authorization;

//   if (!authHeader) {
//     return res.status(401).json({
//       status: "error",
//       message: "Authorization header missing"
//     });
//   }

//   const token = authHeader.split(" ")[1];

//   if (token !== process.env.API_KEY) {
//     return res.status(401).json({
//       status: "error",
//       message: "Invalid API key"
//     });
//   }

//   next();
// }

export function authenticate(req, res, next) {
  const apiKey =
    req.headers["x-api-key"] ||
    req.headers["authorization"]?.replace("Bearer ", "");

  if (!apiKey || apiKey !== process.env.API_KEY) {
    return res.status(401).json({
      status: "error",
      message: "Unauthorized"
    });
  }

  next();
}


