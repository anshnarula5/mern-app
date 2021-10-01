import SET_AlERTS from "../actions/types"
import REMOVE_ALERTS from "../actions/types"

const initialState = []

const alert = (state = initialState, action) => {
    const {type, payload} = action
    switch (type) {
        case SET_AlERTS:
            return [...state, payload]
        case REMOVE_ALERTS:
            return state.filter(alert => alert.id !== payload)
        default:
            return state
    }
}

export default alert