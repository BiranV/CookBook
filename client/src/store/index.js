import { configureStore, createSlice } from "@reduxjs/toolkit";

const initialRecipesState = { recipes: [] }

const recipesSlice = createSlice({
    name: "recipes",
    initialState: initialRecipesState,
    reducers: {
        fetch(state) {
            const initialData = JSON.parse(localStorage.getItem("recipes"));
            if (initialData) {
                state.recipes = initialData;
            }
        },
        add(state, actions) {
            actions.payload.created = Date.now();
            state.recipes.push(actions.payload)
            localStorage.setItem('recipes', JSON.stringify(state.recipes));
        },
        edit(state, actions) {
            actions.payload.created = Date.now();
            state.recipes = state.recipes.map(el => el.id !== actions.payload.id ? el : actions.payload);
            localStorage.setItem('recipes', JSON.stringify(state.recipes));
        },
        delete(state, actions) {
            state.recipes = state.recipes.filter((item) => item.id !== actions.payload)
            localStorage.setItem('recipes', JSON.stringify(state.recipes));
        },
    }
})

const store = configureStore({
    reducer:
        recipesSlice.reducer
})
export const recipesActions = recipesSlice.actions;
export default store;