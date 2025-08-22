import React, { useContext } from "react";
import "./Verify.css";
import { useSearchParams } from "react-router-dom";
import { StoreContext } from "../context/StoreContext";

const Verify = () => {
  const [serchParams, setSearchParams] = useSearchParams();
  const success = serchParams.get("success");
  const orderId = serchParams.get("orderId");

  console.log(success, orderId);

  return <div>Verify</div>;
};

export default Verify;
