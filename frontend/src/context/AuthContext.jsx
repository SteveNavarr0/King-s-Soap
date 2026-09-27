import { createContext, useContext, useEffect, useState } from "react";
import supabase from "../supabaseClient";

const AuthContext = createContext();

export const AuthContextProvider = ({ children }) => {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const [adminName, setAdminName] = useState({
        first: "",
        last: "",
    });


  useEffect(() => {
    // 1. Fetch current session on initial load
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // 2. Listen for auth changes (sign in, sign out, token refresh)
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


  //Effect waits for useAuth to provide the logged in user and then finds matching row using user.id
    useEffect(() => {
        const fetchAdminName = async () => {
            if (!user) {
              setAdminName({
                first: "",
                last: "",
              });
                return;
            }

            const { data, error } = await supabase
                .from("users")
                .select("First, Last")
                .eq("id", user.id)
                .single();


            if (error) {
                console.error("Could not fetch admin name:")
                return;
            }

            setAdminName({
                first: data.First,
                last: data.Last,
            });
        };

        fetchAdminName();
    }, [user]);

  const signInUser = async (email, password) => {
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setLoading(false);
      return { data, error };
    }

    // Immediately update context so navigation doesn't race ahead of state
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
        adminName,
        loading,
        signInUser,
        signOutUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};