import styles from "../styles/Home.module.css";
import { useState, useEffect } from "react";
import jwt from "jsonwebtoken";
import { useRouter } from "next/dist/client/router";

export default function Home() {
  const [email, setEmail] = useState("");
  const [user, setUser] = useState("");
  const router = useRouter();

  useEffect(() => {
    const sessionUserId = sessionStorage.getItem('userId')
    console.log('user id is session store', sessionUserId)
    if (sessionUserId) {
      fetch(`http://localhost:1337/api/accounts/${sessionUserId}`, {method: 'GET'})
      .then(async(response) => {
        const account = await response.json()
        const token = account.data.attributes.token
        jwt.verify(token, "this is a secret", (_, success) => {
          if (success) router.push(`/chat/${token}`)
        })
      })
      .catch((err) => console.log(err))
    }
  }, [])

  const handlesubmit = async (e) => {
    e.preventDefault();
    const id = Math.trunc(Math.random() * 1000000);
    let account = {
      id,
    };
    const SECRET = "this is a secret";
    const token = jwt.sign(account, SECRET);
    // let message = `http://localhost:3000/chat/${token}`;
    // let data = {
    //   email, // User's email
    //   message,
    // };

    // creating the account data for the user
    let strapiData = {
      data: {
        id,
        username: user,
        email,
        token,
      },
    };

    // storing the details in db
    await fetch("http://localhost:1337/api/accounts", {
      method: "POST",
      headers: {
        "Content-type": "application/json",
      },
      body: JSON.stringify(strapiData),
    })
      .then(async (res) => {
        console.log('Stored in Postgres')
        console.log(await res.json());
      })
      .catch((err) => console.log(err.message));

    // storing the user id in the sessions store
    sessionStorage.setItem('userId', id)

    router.push(`/chat/${token}`)
    // setEmail("");
    // setUser("");

    // await fetch("/api/mail", {
    //   method: "POST", // POST request to /api//mail
    //   headers: {
    //     "Content-Type": "application/json",
    //   },
    //   body: JSON.stringify(data),
    // })
    //   .then(async (res) => {
    //     console.log("fetching");
    //     if (res.status === 200) {
    //       console.log(await res.json());
    //     } else {
    //       console.log(await res.json());
    //     }
    //   })
    //   .catch((err) => console.log(err.message));
  };
  return (
    <div className={styles.container}>
      <form className={styles.main}>
        <h1>Login</h1>
        <label htmlFor="user">Username: </label>
        <input
          type="text"
          id="user"
          value={user}
          onChange={(e) => setUser(e.target.value)}
        />
        <br />
        <label htmlFor="email">Email: </label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)} // Getting the inputs
        />
        <br />
        <input type="submit" onClick={handlesubmit} />
      </form>
    </div>
  );
}
