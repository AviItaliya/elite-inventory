import bcrypt from "bcrypt";

export async function users() {
  const password = await bcrypt.hash("Password@123", 10);

  return [
    {
      name: "Chetali",
      email: "aviitaliya1310@gmail.com",
      password,
      role: "ADMIN",
    },
    {
      name: "Avi",
      email: "avikitaliya2018@gmail.com",
      password,
      role: "MANAGER",
    },
    {
      name: "Isha",
      email: "isha@gmail.com",
      password,
      role: "MANAGER",
    },
    {
      name: "Amit Verma",
      email: "amit@example.com",
      password,
      role: "STAFF",
    },
    {
      name: "Neha Shah",
      email: "neha@example.com",
      password,
      role: "STAFF",
    },
    {
      name: "Rohan Singh",
      email: "rohan@example.com",
      password,
      role: "STAFF",
    },
    {
      name: "Sneha Joshi",
      email: "sneha@example.com",
      password,
      role: "STAFF",
    },
    {
      name: "Karan Mehta",
      email: "karan@example.com",
      password,
      role: "STAFF",
    },
    {
      name: "Anjali Desai",
      email: "anjali@example.com",
      password,
      role: "STAFF",
    },
    {
      name: "Vivek Kumar",
      email: "vivek@example.com",
      password,
      role: "STAFF",
    },
  ];
}