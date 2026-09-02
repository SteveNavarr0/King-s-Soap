import { createContext, useContext, useEffect, useState } from "react";
import supabase from "../supabaseClient";

const AuthContext = createContext();

export const AuthContextProvider = ({ children }) => {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getSession = async () => {

      const { data, error } = await supabase.auth.getSession();
      console.log("Refresh session:", data.session);

      if (error) {
        console.error(error.message);
      } else {
        setSession(data.session);
        setUser(data.session?.user ?? null);
      }

      setLoading(false);
    };

    getSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signInUser = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

      if (error) {
        setLoading(false);
        return { data, error};
      }
      
        console.log("Login success:", data);

        setSession(data.session);
        setUser(data.session?.user ?? null);
        setLoading(false);

    return { data, error };
  };

  const signOutUser = async () => {
    const { error } = await supabase.auth.signOut();
    
    if (!error) {
    setSession(null);
    setUser(null);
  }
          setLoading(false);

    return { error };
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        loading,
        signInUser,
        signOutUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const UserAuth = () => {
  return useContext(AuthContext);
};