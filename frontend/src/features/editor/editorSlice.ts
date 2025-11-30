import { createSlice, PayloadAction } from '@reduxjs/toolkit'
interface EditorState { code: string; cursor: number; suggestion: string | null }
const initialState: EditorState = { code: '', cursor: 0, suggestion: null }
const editorSlice = createSlice({
  name: 'editor',
  initialState,
  reducers: {
    setCode(state, action: PayloadAction<string>) { state.code = action.payload },
    setCursor(state, action: PayloadAction<number>) { state.cursor = action.payload },
    setSuggestion(state, action: PayloadAction<string | null>) { state.suggestion = action.payload }
  }
})
export const { setCode, setCursor, setSuggestion } = editorSlice.actions
export default editorSlice.reducer
