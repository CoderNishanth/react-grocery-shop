import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import axios from "axios";

axios.defaults.withCredentials = true;
axios.defaults.baseURL = import.meta.env.VITE_BACKEND_URL;

export const AppContext = createContext();

export const AppContextProvider = ({children}) => {

    const currency = import.meta.env.VITE_CURRENCY;
    const navigate = useNavigate();
    const [user,setUser] = useState(null);
    const [isSeller,setIsSeller] = useState(false);
    const [showuserlogin, setShowuserlogin] = useState(false);
    const [products, setProducts] = useState([]);
    const [cartItems, setCartItems] = useState({});
    const [searchQuery, setSearchQuery] = useState({});

    //Fetch Seller Status
    const fetchSellerStatus = async ()=>{
        try {
            const {data} = await axios.get('/api/seller/is-auth');
            if(data.success){
                setIsSeller(true);
                navigate('/seller');
            }
            else{
                setIsSeller(false);
            }
        } catch (error) {
            setIsSeller(false);
        }
    }

    //Fetch User Status
    const fetchUserStatus = async ()=>{
        try {
            const {data} = await axios.get('/api/user/is-auth');
            if(data.success){
                setUser(data.user);
                setCartItems(data.user.cartItems);
            }
            else{
                setUser(null);
            }
        } catch (error) {
            setUser(null);
        }
    }
    
    //Fetch Products
    const fetchProducts = async ()=>{
        try{
            const {data} = await axios.get('/api/product/list');
            if(data.success){
                setProducts(data.products);
            }
            else{
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        }
    }
    
    // Add Product to Cart
const addToCart = (itemId)=>{
    let cartData = structuredClone(cartItems);
    if(cartData[itemId]){
            cartData[itemId]+= 1;
        }
        else{
            cartData[itemId]= 1;
        }
        setCartItems(cartData);

        toast.success('Product added to cart');
    }

    //Update Cart
    const updateCart = (itemId, quantity) => {
        let cartData = structuredClone(cartItems);
        cartData[itemId] = quantity;
        setCartItems(cartData);
        toast.success('Cart updated');
    }
    
    //Remove Product from Cart
    const removeFromCart = (itemId) => {
        let cartData = structuredClone(cartItems);
        if(cartData[itemId]){
            cartData[itemId] -= 1;
            if(cartData[itemId] === 0){
                delete cartData[itemId];
            }
        }
        setCartItems(cartData);
        toast.success('Product removed from cart');
    }

    // get cart item count
    const getCartCount = () => {
        let totalcount=0;
        for(const item in cartItems){
            totalcount += cartItems[item];
        }
        return totalcount;
    }

    //get cart total amount
    const getCartAmount = () => {
        let totalamount=0;
        for(const item in cartItems){
            let iteminfo = products.find((product)=>product._id === item);
            if(cartItems[item] > 0){
                totalamount += cartItems[item] * iteminfo.offerPrice;
            }
        }
        return Math.floor(totalamount*100)/100;
    }

    useEffect(()=>{
        fetchUserStatus();
        fetchSellerStatus();
        fetchProducts();
    },[]);

    useEffect(()=>{
        const updateCartData = async()=>{
            try {
                  const { data } = await axios.post('/api/cart/update', {
                    cartItems:cartItems
                  });
                  if(!data.success){
                    toast.error(data.message);
                  }
            } catch (error) {
                toast.error(error.message);
            }
        }
        if(user){
            updateCartData();
        }
    },[cartItems]);
    
    const value={axios,navigate,user,setUser,isSeller,setIsSeller,showuserlogin,setShowuserlogin,products,currency,addToCart,updateCart,removeFromCart,cartItems,setCartItems,searchQuery,setSearchQuery,getCartCount,getCartAmount,fetchProducts};
    return <AppContext.Provider value={value}>
        {children}
    </AppContext.Provider>
}

export const UseAppContext = () => {
    return useContext(AppContext)
}