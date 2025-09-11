import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useMemo,
  useReducer
} from 'react';
import { Alert } from 'react-native';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  businessId: string;
}

export interface CartState {
  items: CartItem[];
  businessId: string | null;
}

type CartAction =
  | { type: 'ADD_ITEM'; payload: CartItem }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'CLEAR_CART' };

const initialState: CartState = {
  items: [],
  businessId: null
};

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'ADD_ITEM': {
      if (!state.businessId) {
        return {
          items: [action.payload],
          businessId: action.payload.businessId
        };
      }
      if (state.businessId !== action.payload.businessId) {
        return state;
      }
      const existing = state.items.find((item: CartItem) => item.id === action.payload.id);
      if (existing) {
        return {
          items: state.items.map((item: CartItem) =>
            item.id === action.payload.id
              ? { ...item, quantity: item.quantity + action.payload.quantity }
              : item
          ),
          businessId: state.businessId
        };
      }
      return {
        items: [...state.items, action.payload],
        businessId: state.businessId
      };
    }
    case 'REMOVE_ITEM': {
      const filtered = state.items.filter((item: CartItem) => item.id !== action.payload);
      return {
        items: filtered,
        businessId: filtered.length === 0 ? null : state.businessId
      };
    }
    case 'CLEAR_CART':
      return { items: [], businessId: null };
    default:
      return state;
  }
}

interface CartContextType {
  items: CartItem[];
  businessId: string | null;
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
}

export const CartContext = createContext<CartContextType>({
  items: [],
  businessId: null,
  addItem: () => {},
  removeItem: () => {},
  clearCart: () => {}
});

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  const addItem = useCallback(
    (item: CartItem) => {
      if (state.items.length > 0 && state.businessId && state.businessId !== item.businessId) {
        Alert.alert('¿Cambiar de negocio?', 'Tu carrito actual se borrará. ¿Continuar?', [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Continuar',
            onPress: () => {
              dispatch({ type: 'CLEAR_CART' });
              dispatch({ type: 'ADD_ITEM', payload: item });
            }
          }
        ]);
        return;
      }
      dispatch({ type: 'ADD_ITEM', payload: item });
    },
    [state.items, state.businessId]
  );
  const removeItem = useCallback(
    (id: string) => dispatch({ type: 'REMOVE_ITEM', payload: id }),
    []
  );
  const clearCart = useCallback(() => dispatch({ type: 'CLEAR_CART' }), []);

  const value = useMemo(
    () => ({
      items: state.items,
      businessId: state.businessId,
      addItem,
      removeItem,
      clearCart
    }),
    [state.items, state.businessId, addItem, removeItem, clearCart]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => useContext(CartContext);
