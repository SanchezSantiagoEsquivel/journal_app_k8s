import { clearNotesLogout } from "../journal/journalSlice";
import { startLoadingNotes } from "../journal/thunks";
import { checkingCredentials, logout, login } from "./";
import { signInWithGoogle } from "../../firebase/providers";
import axios from "axios";

const AUTH_API_URL = "http://localhost:4000/auth";
const USER_API_URL = "http://localhost:4001/user";

export const checkingAuthentication = () => {
  return (dispatch) => {
    dispatch(checkingCredentials());
  };
};

export const startGoogleSignIt = () => {
  return async (dispatch) => {

      dispatch(checkingCredentials());

      const result = await signInWithGoogle();
      console.log(result.errorMessage)

      if (!result.ok) return dispatch(logout(result.errorMessage));

      dispatch(login(result));
  }
}

export const startCreatingUserWithEmailPassword = ({
  displayName,
  email,
  password,
}) => {
  return async (dispatch) => {
    dispatch(checkingCredentials());

    try {
      const response = await axios.post(`${USER_API_URL}/register`, {
        displayName,
        email,
        password,
      });
      if (response.data.ok) {
        const { uid, photoURL } = response.data;
        dispatch(login({ displayName, email, uid, photoURL }));
      } else {
        dispatch(logout(response.data.errorMessage));
      }
    } catch (error) {
      dispatch(logout("Error al registrar usuario"));
    }
  };
};

export const startLoginWithUserWithEmailPassword = ({ email, password }) => {
  return async (dispatch) => {
    dispatch(checkingCredentials());

    try {
      const response = await axios.post(`${AUTH_API_URL}/login`, {
        email,
        password,
      });
      console.log("🚀 ~ return ~ response.data:", response.data);
      if (response.data.ok) {
        const { displayName, uid, photoURL } = response.data;
        dispatch(login({ displayName, email, uid, photoURL }));
      } else {
        dispatch(logout("Credenciales incorrectas"));
      }
    } catch (error) {
      dispatch(logout("Error al iniciar sesión"));
    }
  };
};

export const startLogout = () => {
  return async (dispatch) => {
    try {
      await axios.post(`${AUTH_API_URL}/logout`);
      dispatch(clearNotesLogout());
      dispatch(logout());
    } catch (error) {
    }
  };
};

export const checkAuthStateChanged = () => {
  return async (dispatch) => {
    try {
      const response = await axios.post(`${AUTH_API_URL}/check-auth-state`);

      const { user } = response.data;

      if (!user) {
        return dispatch(logout());
      }

      const { displayName, email, uid, photoURL } = user;

      dispatch(login({ displayName, email, uid, photoURL }));
      dispatch(startLoadingNotes());
    } catch (error) {
      console.error("Error al verificar el estado de autenticación:", error);
      dispatch(logout());
    }
  };
};
