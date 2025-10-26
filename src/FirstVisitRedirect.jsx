import { Navigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

function FirstVisitRedirect() {
 const token = localStorage.getItem("accessToken");

  if (token) {
    return <Navigate to="/items" replace />;
  }

  return <Navigate to="/innowise-shop" replace />;
}

export default FirstVisitRedirect;
