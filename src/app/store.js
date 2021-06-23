import { configureStore } from '@reduxjs/toolkit'
import dataReducer from "../features/data-slice-reducer"
import { getDefaultMiddleware } from '@reduxjs/toolkit'
export default configureStore({
  reducer:{
    data: dataReducer,
  },
  middleware: getDefaultMiddleware({
    serializableCheck: false,
    immutableCheck: false,
    thunkCheck:false
  })
})
