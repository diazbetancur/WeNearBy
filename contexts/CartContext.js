import { createContext, useCallback, useContext, useMemo, useReducer } from 'react';
import { Alert } from 'react-native';

const initialState = {
  businessId: null,
  items: []
};

function cartReducer(state, action) {
  switch (action.type) {
    case 'ADD_ITEM': {
      const { product, businessId } = action.payload;
      if (!state.businessId) {
        return {
          businessId,
          items: [product]
        };
      }
      if (state.businessId !== businessId) {
        // No agregamos aquí, solo confirmación fuera del reducer
        return state;
      }
      const existing = state.items.find((item) => item.id === product.id);
      if (existing) {
        return {
          businessId: state.businessId,
          items: state.items.map((item) =>
            item.id === product.id
              ? { ...item, quantity: item.quantity + (product.quantity || 1) }
              : item
          )
        };
      }
      return {
        businessId: state.businessId,
        items: [...state.items, product]
      };
    }
    case 'REMOVE_ITEM': {
      const filtered = state.items.filter((item) => item.id !== action.payload);
      return {
        businessId: filtered.length === 0 ? null : state.businessId,
        items: filtered
      };
    }
    case 'CLEAR_CART':
      return { businessId: null, items: [] };
    default:
      return state;
  }
}

export const CartContext = createContext({
  businessId: null,
  items: [],
  addItem: () => {},
  removeItem: () => {},
  clearCart: () => {}
});

export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  const addItem = useCallback(
    (product, businessId) => {
      if (state.items.length > 0 && state.businessId && state.businessId !== businessId) {
        Alert.alert('¿Cambiar de negocio?', 'Tu carrito actual se borrará. ¿Continuar?', [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Continuar',
            onPress: () => {
              dispatch({ type: 'CLEAR_CART' });
              dispatch({ type: 'ADD_ITEM', payload: { product, businessId } });
            }
          }
        ]);
        return;
      }
      dispatch({ type: 'ADD_ITEM', payload: { product, businessId } });
    },
    [state.items, state.businessId]
  );

  const removeItem = useCallback((id) => dispatch({ type: 'REMOVE_ITEM', payload: id }), []);
  const clearCart = useCallback(() => dispatch({ type: 'CLEAR_CART' }), []);

  const value = useMemo(
    () => ({
      businessId: state.businessId,
      items: state.items,
      addItem,
      removeItem,
      clearCart
    }),
    [state.businessId, state.items, addItem, removeItem, clearCart]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => useContext(CartContext);
