import { collection, deleteDoc, doc, setDoc } from "firebase/firestore/lite";
import { firebaseDB } from "../../firebase/config";
import { fileUpload } from "../../helpers/fileUpload";
import { loadNotes } from "../../helpers/loadNotes";
import { addNewEmptyNote, deleteNoteById, savingNewNote, setActiveNote, setImgsToActiveNote, setNotes, setSaving, updateNotes } from "./journalSlice";
import axios from "axios";

const JOURNAL_API_URL = "http://localhost:4002/journal";

export const startNewNote = () => {
    return async (dispatch, getState) => {

        dispatch(savingNewNote());


        //Obtenemos el uid de nuestro store
        const { uid } = getState().auth;

        //Generamos nuestra nota
        const newNote = {
            title: '',
            body: '',
            date: new Date().getTime(),
            imgsUrls: []
        }

        //Guardamos la informacion de la nota en la base de datos
        newNote = await axios.post(`${JOURNAL_API_URL}/newNote`, {
            uid
        });

        console.log("🚀 ~ return ~ newNote:", newNote)

        dispatch(addNewEmptyNote(newNote));
        dispatch(setActiveNote(newNote));


    }
}

export const startLoadingNotes = () => {
    return async (dispatch, getState) => {

        const { uid } = getState().auth;

        if (!uid) throw new Error('El UID del usuario no existe');

        const notes = await loadNotes(uid);

        dispatch(setNotes(notes));
    }
}

export const startSavingNotes = () => {
    return async (dispatch, getState) => {

        dispatch(setSaving());

        const { uid } = getState().auth;
        const { active: note } = getState().journal;

        await axios.put(`${JOURNAL_API_URL}/saveNote`, {
            uid,
            note
        });

        dispatch(updateNotes(note));

    }
}

export const startUploadingFiles = (files = []) => {
    return async (dispatch) => {

        dispatch(setSaving());

        /* LLenamos el arreglo de promesas con la correspondiente de cada file del arreglo
        para luego ejecutarlas todas juntas */

        const { imgsUrls } = await axios.post(`${JOURNAL_API_URL}/uploadFiles`, {
            files,
        });
        dispatch(setImgsToActiveNote(imgsUrls));

    }
}

export const startDeletingNote = () => {
    return async (dispatch, getState) => {

        const { uid } = getState().auth;
        const { active: note } = getState().journal;

        await axios.post(`${JOURNAL_API_URL}/deleteNote`, {
            uid,
            note
        });

        dispatch(deleteNoteById(note.id));

    }
}