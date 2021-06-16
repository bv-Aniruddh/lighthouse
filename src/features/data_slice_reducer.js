import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

const initialState = {
  lighthouseData : null,
  status : "idle",
  error : null,
};

export const fetchData  = createAsyncThunk("data/fetchData",async()=>{
    try{
        console.log('infetch')
        const result = await fetch('http://localhost:8000/')
        const response = await result.json()    
        return response;
    }
    catch(e){
        console.log(e)
    }
})

const dataSlice = createSlice({
    name :"data",
    initialState,
    extraReducers:{
        [fetchData.pending]:(state , action) =>{
            state.status = "loading";
            
        },
        [fetchData.rejected]:(state, action) => {
            state.status = "failed";
            state.error = action.error.message;
        },
        [fetchData.fulfilled]: (state,action) =>{
            
            if(action.payload && state.lighthouseData===null){
                state.status= "succeeded";
                state.lighthouseData = action.payload;
            }
        }
    }
})

export default dataSlice.reducer;
