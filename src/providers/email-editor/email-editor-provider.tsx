"use client"

import type React from "react"
import { createContext, useContext, useReducer, useCallback } from "react"

export interface EmailElement {
  id: string
  type: string
  name?: string
  styles?: Record<string, string>
  content?: any
  parentId?: string
}

export interface EmailEditorState {
  elements: EmailElement[]
  selectedElement: EmailElement | null
  history: {
    past: EmailElement[][]
    future: EmailElement[][]
  }
  templateId: string | null
  previewMode: boolean
}

type EmailEditorAction =
  | { type: "ADD_ELEMENT"; payload: { element: EmailElement; parentId?: string } }
  | { type: "UPDATE_ELEMENT"; payload: { id: string; element: EmailElement } }
  | { type: "DELETE_ELEMENT"; payload: { id: string; parentId?: string } }
  | { type: "SELECT_ELEMENT"; payload: EmailElement | null }
  | {
      type: "MOVE_ELEMENT"
      payload: { id: string; sourceParentId?: string; targetParentId?: string; targetIndex: number }
    }
  | { type: "DUPLICATE_ELEMENT"; payload: { element: EmailElement; parentId?: string } }
  | { type: "TOGGLE_PREVIEW_MODE" }
  | { type: "UNDO" }
  | { type: "REDO" }
  | { type: "LOAD_TEMPLATE"; payload: { elements: EmailElement[]; templateId: string } }
  | { type: "CLEAR_TEMPLATE" }

const initialState: EmailEditorState = {
  elements: [],
  selectedElement: null,
  history: {
    past: [],
    future: [],
  },
  templateId: null,
  previewMode: false,
}

const emailEditorReducer = (state: EmailEditorState, action: EmailEditorAction): EmailEditorState => {
  switch (action.type) {
    case "ADD_ELEMENT": {
      const { element, parentId } = action.payload
      const newElements = parentId
        ? addElementToParent([...state.elements], element, parentId)
        : [...state.elements, element]

      return {
        ...state,
        elements: newElements,
        selectedElement: element,
        history: {
          past: [...state.history.past, state.elements],
          future: [],
        },
      }
    }

    case "UPDATE_ELEMENT": {
      const { id, element } = action.payload
      const newElements = updateElementInTree([...state.elements], id, element)

      // Mantener el mismo elemento seleccionado si el ID coincide, en lugar de reemplazarlo
      const updatedSelectedElement = state.selectedElement?.id === id ? element : state.selectedElement

      return {
        ...state,
        elements: newElements,
        selectedElement: updatedSelectedElement,
        history: {
          past: [...state.history.past, state.elements],
          future: [],
        },
      }
    }

    case "DELETE_ELEMENT": {
      const { id, parentId } = action.payload
      const newElements = deleteElementFromTree([...state.elements], id, parentId)

      return {
        ...state,
        elements: newElements,
        selectedElement: null,
        history: {
          past: [...state.history.past, state.elements],
          future: [],
        },
      }
    }

    case "SELECT_ELEMENT": {
      return {
        ...state,
        selectedElement: action.payload,
      }
    }

    case "TOGGLE_PREVIEW_MODE": {
      return {
        ...state,
        previewMode: !state.previewMode,
        selectedElement: null,
      }
    }

    case "UNDO": {
      if (state.history.past.length === 0) return state

      const previous = state.history.past[state.history.past.length - 1]
      const newPast = state.history.past.slice(0, state.history.past.length - 1)

      return {
        ...state,
        elements: previous,
        selectedElement: null,
        history: {
          past: newPast,
          future: [state.elements, ...state.history.future],
        },
      }
    }

    case "REDO": {
      if (state.history.future.length === 0) return state

      const next = state.history.future[0]
      const newFuture = state.history.future.slice(1)

      return {
        ...state,
        elements: next,
        selectedElement: null,
        history: {
          past: [...state.history.past, state.elements],
          future: newFuture,
        },
      }
    }

    case "LOAD_TEMPLATE": {
      const { elements, templateId } = action.payload

      return {
        ...state,
        elements,
        templateId,
        selectedElement: null,
        history: {
          past: [],
          future: [],
        },
        previewMode: false,
      }
    }

    case "CLEAR_TEMPLATE": {
      return initialState
    }

    default:
      return state
  }
}

// Helper functions
const addElementToParent = (elements: EmailElement[], element: EmailElement, parentId: string): EmailElement[] => {
  return elements.map((el) => {
    if (el.id === parentId) {
      return {
        ...el,
        content: Array.isArray(el.content) ? [...el.content, element] : [element],
      }
    }
    if (Array.isArray(el.content)) {
      return {
        ...el,
        content: addElementToParent(el.content, element, parentId),
      }
    }
    return el
  })
}

const updateElementInTree = (elements: EmailElement[], id: string, updatedElement: EmailElement): EmailElement[] => {
  return elements.map((el) => {
    if (el.id === id) {
      return updatedElement
    }
    if (Array.isArray(el.content)) {
      return {
        ...el,
        content: updateElementInTree(el.content, id, updatedElement),
      }
    }
    return el
  })
}

const deleteElementFromTree = (elements: EmailElement[], id: string, parentId?: string): EmailElement[] => {
  if (!parentId) {
    return elements.filter((el) => el.id !== id)
  }

  return elements.map((el) => {
    if (el.id === parentId && Array.isArray(el.content)) {
      return {
        ...el,
        content: el.content.filter((child) => child.id !== id),
      }
    }
    if (Array.isArray(el.content)) {
      return {
        ...el,
        content: deleteElementFromTree(el.content, id, parentId),
      }
    }
    return el
  })
}

const EmailEditorContext = createContext<{
  state: EmailEditorState
  dispatch: React.Dispatch<EmailEditorAction>
}>({ state: initialState, dispatch: () => null })

export const EmailEditorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(emailEditorReducer, initialState)

  return <EmailEditorContext.Provider value={{ state, dispatch }}>{children}</EmailEditorContext.Provider>
}

export const useEmailEditorStore = () => {
  const { state, dispatch } = useContext(EmailEditorContext)

  // Usar useCallback para evitar recreaciones innecesarias de funciones
  const addElement = useCallback((element: EmailElement, parentId?: string) => {
    dispatch({ type: "ADD_ELEMENT", payload: { element, parentId } })
  }, [dispatch])

  const updateElement = useCallback((id: string, element: EmailElement) => {
    dispatch({ type: "UPDATE_ELEMENT", payload: { id, element } })
  }, [dispatch])

  const deleteElement = useCallback((id: string, parentId?: string) => {
    dispatch({ type: "DELETE_ELEMENT", payload: { id, parentId } })
  }, [dispatch])

  const selectElement = useCallback((element: EmailElement | null) => {
    dispatch({ type: "SELECT_ELEMENT", payload: element })
  }, [dispatch])

  const moveElement = useCallback((id: string, sourceParentId?: string, targetParentId?: string, targetIndex = 0) => {
    dispatch({ type: "MOVE_ELEMENT", payload: { id, sourceParentId, targetParentId, targetIndex } })
  }, [dispatch])

  const duplicateElement = useCallback((element: EmailElement, parentId?: string) => {
    dispatch({ type: "DUPLICATE_ELEMENT", payload: { element, parentId } })
  }, [dispatch])

  const togglePreviewMode = useCallback(() => {
    dispatch({ type: "TOGGLE_PREVIEW_MODE" })
  }, [dispatch])

  const undo = useCallback(() => {
    dispatch({ type: "UNDO" })
  }, [dispatch])

  const redo = useCallback(() => {
    dispatch({ type: "REDO" })
  }, [dispatch])

  const loadTemplate = useCallback((elements: EmailElement[], templateId: string) => {
    dispatch({ type: "LOAD_TEMPLATE", payload: { elements, templateId } })
  }, [dispatch])

  const clearTemplate = useCallback(() => {
    dispatch({ type: "CLEAR_TEMPLATE" })
  }, [dispatch])

  return {
    elements: state.elements,
    selectedElement: state.selectedElement,
    templateId: state.templateId,
    previewMode: state.previewMode,
    canUndo: state.history.past.length > 0,
    canRedo: state.history.future.length > 0,
    addElement,
    updateElement,
    deleteElement,
    selectElement,
    moveElement,
    duplicateElement,
    togglePreviewMode,
    undo,
    redo,
    loadTemplate,
    clearTemplate,
  }
}
