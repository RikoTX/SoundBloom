import { useState } from "react";

export default function SignInAndLogin() {
  const [activeTab, setActiveTab] = useState("signup");
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        marginTop: "100px",
      }}
    >
      <div style={{ display: "flex", alignItems: "center" }}>
        <div style={{ paddingLeft: "15%" }}>
          <h1 style={{ fontSize: "40px", margin: 0 }}>Join Our Platform</h1>
          <p
            style={{
              width: "380px",
              display: "flex",
              justifyContent: "center",
              height: "50%",
              fontSize: "16px",
            }}
          >
            You can be one of the members of our platform by just adding some
            necessarily information. If you already have an account on our
            website, you can just hit the Login button.
          </p>
        </div>
      </div>

      <div style={{ paddingRight: "8%" }}>
        <div
          style={{
            width: "100%",
            maxWidth: "500px",
            height: "100%",
            backgroundColor: "#53063E",
            marginRight: "10%",
            borderRadius: "10px",
            padding: "30px",
            boxSizing: "border-box",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <div style={{ display: "flex" }}>
            {["signup", "login"].map((tab) => (
              <div
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  cursor: "pointer",
                  padding: "10px 20px",
                  backgroundColor:
                    activeTab === tab ? "transparent" : "transparent",
                  color: activeTab === tab ? "#EE10B0" : "#FAB5E7",
                  fontWeight: 600,
                  borderRadius: "8px 8px 0 0",
                  marginRight: "10px",
                  fontSize: activeTab === tab ? "25px" : "22px",
                  borderBottom:
                    activeTab === tab
                      ? "3px solid #EE10B0"
                      : "3px solid transparent",
                }}
              >
                {tab === "login" ? "Login" : "Sign Up"}
              </div>
            ))}
          </div>

          {activeTab === "login" ? (
            <div style={{ display: "flex", flexDirection: "column" }}>
              <style>
                {`
                                                        ::placeholder {
                                                            color: white;
                                                            font-size: 13px;
                                                            font-weight: 100;
                                                        }`}
              </style>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px",
                  marginTop: "20px",
                  width: "425px",
                }}
              >
                <label style={{ fontWeight: 500, fontSize: "17px", margin: 0 }}>
                  Number
                </label>
                <input
                  type="tel"
                  placeholder="Format: +7 (123) 456 78 99"
                  style={{
                    padding: "10px",
                    fontSize: "15px",
                    border: "3px solid #D9D9D9",
                    borderRadius: "4px",
                    backgroundColor: "transparent",
                    color: "white",
                  }}
                />
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px",
                  marginTop: "10px",
                }}
              >
                <label style={{ fontWeight: 500, fontSize: "17px", margin: 0 }}>
                  Password
                </label>
                <input
                  type="password"
                  placeholder="Enter Your Password"
                  style={{
                    padding: "10px",
                    fontSize: "15px",
                    border: "3px solid #D9D9D9",
                    borderRadius: "4px",
                    backgroundColor: "transparent",
                    color: "white",
                  }}
                />
              </div>
              <button
                style={{
                  padding: "15px",
                  fontSize: "16px",
                  backgroundColor: "#cb0094",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  marginTop: "20px",
                }}
              >
                Login
              </button>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginTop: "20px",
                }}
              >
                <div
                  style={{
                    flex: 1,
                    height: "1px",
                    backgroundColor: "#fff",
                  }}
                ></div>
                <span
                  style={{
                    margin: "0 10px",
                    color: "#fff",
                    fontSize: "16px",
                    fontWeight: 400,
                  }}
                >
                  Or
                </span>
                <div
                  style={{
                    flex: 1,
                    height: "1px",
                    backgroundColor: "#fff",
                  }}
                ></div>
              </div>
              <button
                style={{
                  fontSize: "16px",
                  backgroundColor: "transparent",
                  color: "white",
                  border: "3px solid #fff",
                  borderRadius: "8px",
                  cursor: "pointer",
                  marginTop: "20px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "10px",
                  padding: "10px 20px",
                }}
              >
                <img
                  src="https://wixmp-7ef3383b5fd80a9f5a5cc686.wixmp.com/logos/google-logo.svg"
                  alt="Google"
                  style={{ width: "20px", height: "20px" }}
                />
                Sign Up with Google
              </button>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column" }}>
              <style>
                {`
                                                        ::placeholder {
                                                            color: white;
                                                            font-size: 13px;
                                                            font-weight: 100;
                                                        }`}
              </style>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginTop: "20px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: "10px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "8px",
                    }}
                  >
                    <label
                      style={{
                        fontWeight: 500,
                        fontSize: "17px",
                        margin: 0,
                      }}
                    >
                      Name
                    </label>
                    <input
                      type="text"
                      placeholder="Enter Your Name"
                      style={{
                        padding: "10px",
                        fontSize: "15px",
                        border: "3px solid #D9D9D9",
                        borderRadius: "4px",
                        backgroundColor: "transparent",
                        color: "white",
                      }}
                    />
                  </div>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "8px",
                    }}
                  >
                    <label
                      style={{
                        fontWeight: 500,
                        fontSize: "17px",
                        margin: 0,
                      }}
                    >
                      E-Mail
                    </label>
                    <input
                      type="email"
                      placeholder="Enter Your E-Mail"
                      style={{
                        padding: "10px",
                        fontSize: "15px",
                        border: "3px solid #D9D9D9",
                        borderRadius: "4px",
                        backgroundColor: "transparent",
                        color: "white",
                      }}
                    />
                  </div>
                </div>
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px",
                  marginTop: "10px",
                }}
              >
                <label style={{ fontWeight: 500, fontSize: "17px", margin: 0 }}>
                  Number
                </label>
                <input
                  type="tel"
                  placeholder="Format: +7 (123) 456 78 99"
                  style={{
                    padding: "10px",
                    fontSize: "15px",
                    border: "3px solid #D9D9D9",
                    borderRadius: "4px",
                    backgroundColor: "transparent",
                    color: "white",
                  }}
                />
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px",
                  marginTop: "10px",
                }}
              >
                <label style={{ fontWeight: 500, fontSize: "17px", margin: 0 }}>
                  Password
                </label>
                <input
                  type="password"
                  placeholder="Enter Your Password"
                  style={{
                    padding: "10px",
                    fontSize: "15px",
                    border: "3px solid #D9D9D9",
                    borderRadius: "4px",
                    backgroundColor: "transparent",
                    color: "white",
                  }}
                />
              </div>
              <button
                style={{
                  padding: "15px",
                  fontSize: "16px",
                  backgroundColor: "#cb0094",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  marginTop: "20px",
                }}
              >
                Sign Up
              </button>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginTop: "20px",
                }}
              >
                <div
                  style={{
                    flex: 1,
                    height: "1px",
                    backgroundColor: "#fff",
                  }}
                ></div>
                <span
                  style={{
                    margin: "0 10px",
                    color: "#fff",
                    fontSize: "16px",
                    fontWeight: 400,
                  }}
                >
                  Or
                </span>
                <div
                  style={{
                    flex: 1,
                    height: "1px",
                    backgroundColor: "#fff",
                  }}
                ></div>
              </div>
              <button
                style={{
                  fontSize: "16px",
                  backgroundColor: "transparent",
                  color: "white",
                  border: "3px solid #fff",
                  borderRadius: "8px",
                  cursor: "pointer",
                  marginTop: "20px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "10px",
                  padding: "10px 20px",
                }}
              >
                <img
                  src="https://wixmp-7ef3383b5fd80a9f5a5cc686.wixmp.com/logos/google-logo.svg"
                  alt="Google"
                  style={{ width: "20px", height: "20px" }}
                />
                Sign Up with Google
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
