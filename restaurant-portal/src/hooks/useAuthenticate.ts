import { useEffect, useState } from "react";

const useAuthenticated = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [token, setToken] = useState<string | null>(null);
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        setIsAuthenticated(!!parsedUser?.token);
        setToken(parsedUser?.token);
      } else {
        setIsAuthenticated(false);
      }
    } catch (error) {
      setIsAuthenticated(false);
    }
  }, []);

  return { isAuthenticated, token };
};

export default useAuthenticated;
